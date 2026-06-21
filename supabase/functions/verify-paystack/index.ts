// Deploy with: supabase functions deploy verify-paystack

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: any) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    const { reference, userId, plan, amount } = await req.json();

    // --- Guard: make sure all required fields are present ---
    if (!reference || !userId || !plan || !amount) {
      return new Response(
        JSON.stringify({ status: "error", message: "Missing required fields: reference, userId, plan, amount" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // --- Env vars (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected) ---
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY secret is not set in Supabase Edge Function secrets.");
      return new Response(
        JSON.stringify({ status: "error", message: "Server configuration error: missing Paystack key." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // --- 1. Verify transaction with Paystack ---
    console.log(`Verifying Paystack reference: ${reference}`);
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();
    console.log("Paystack response status:", paystackData?.data?.status);

    if (!paystackData.status || paystackData.data?.status !== "success") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Paystack verification failed: ${paystackData.message || "Unknown error"}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // --- 2. Confirmed: process the subscription ---
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check for duplicate reference (idempotency guard)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingPayment) {
      console.log("Duplicate reference detected, returning success without re-inserting.");
      return new Response(JSON.stringify({ status: "success", message: "Already processed." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Calculate subscription end date ---
    const endDate = new Date();
    if (plan === "daily") {
      endDate.setDate(endDate.getDate() + 1);
    } else if (plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return new Response(
        JSON.stringify({ status: "error", message: `Unknown plan type: ${plan}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // --- 4. Upsert subscription (update if exists, insert if not) ---
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_type: plan,
          status: "active",
          amount: amount,
          paystack_reference: reference,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        },
        { onConflict: "user_id" } // assumes one active sub per user
      );

    if (subError) {
      console.error("Subscription insert error:", subError);
      throw new Error(`Subscription DB error: ${subError.message}`);
    }

    // --- 5. Record the payment ---
    const { error: payError } = await supabase.from("payments").insert({
      user_id: userId,
      amount: amount,
      reference: reference,
      status: "success",
      plan: plan,
    });

    if (payError) {
      console.error("Payment insert error:", payError);
      throw new Error(`Payment DB error: ${payError.message}`);
    }

    // --- 6. Update profile subscription status ---
    const { error: profError } = await supabase
      .from("profiles")
      .update({ subscription_status: "pro" })
      .eq("id", userId);

    if (profError) {
      console.error("Profile update error:", profError);
      throw new Error(`Profile DB error: ${profError.message}`);
    }

    console.log(`Subscription activated for user ${userId}, plan: ${plan}, expires: ${endDate.toISOString()}`);

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge function error:", error.message);
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});