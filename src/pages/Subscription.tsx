"use client";

import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { format, addMonths, addYears, isAfter } from 'date-fns';

// Using environment variable for the public key
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

const Subscription = () => {
  const { user, profile, refreshProfile, isSubscriptionActive } = useAuth();
  const [loading, setLoading] = useState(false);

  const subscription = profile?.subscription;
  const isExpired = subscription && !isSubscriptionActive && profile?.role !== 'admin';

  const plans = [
    {
      name: 'One Day Test Plan',
      price: 100,
      interval: 'daily',
      description: 'Perfect for testing out the features',
      features: ['All Pro Features for 24 hours'],
      planCode: '',
    },
    {
      name: 'Monthly Plan',
      price: 2000,
      interval: 'monthly',
      description: 'Flexible for growing businesses',
      features: ['Unlimited Sales Records', 'Debt Tracking', 'Inventory Management', 'Basic Reports'],
      planCode: import.meta.env.VITE_PAYSTACK_MONTHLY_PLAN_CODE,
    },
    {
      name: 'Yearly Plan',
      price: 20000,
      interval: 'yearly',
      description: 'Best value for serious owners',
      features: ['Everything in Monthly', 'Priority Support', 'Advanced Analytics', 'Custom Branding'],
      planCode: import.meta.env.VITE_PAYSTACK_YEARLY_PLAN_CODE,
    }
  ];

  const handlePaymentSuccess = async (reference: any, plan: any) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const verifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-paystack`;
      console.log('Verifying at:', verifyUrl);
      console.log('Payload:', { reference: reference.reference, userId: user?.id, plan: plan.interval, amount: plan.price });

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          reference: reference.reference,
          userId: user?.id,
          plan: plan.interval,
          amount: plan.price
        })
      });

      // Log the raw response before parsing
      const rawText = await response.text();
      console.log('Raw response:', rawText);
      console.log('HTTP status:', response.status);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        showError(`Server returned invalid response: ${rawText.slice(0, 100)}`);
        return;
      }

      if (data.status === 'success') {
        showSuccess(`Successfully subscribed to the ${plan.name}!`);
        await refreshProfile();
      } else {
        // Now shows the ACTUAL error message from the server
        showError(data.message || 'Payment verification failed.');
        console.error('Verification failed:', data);
      }
    } catch (err: any) {
      console.error('Full verification error:', err);
      showError(`Verification error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const PaystackButton = ({ plan }: { plan: any }) => {
    const config = {
      reference: (new Date()).getTime().toString(),
      email: user?.email || '',
      amount: plan.price * 100, // Paystack amount is in kobo
      publicKey: PAYSTACK_PUBLIC_KEY,
      plan: plan.planCode || undefined,
    };

    const initializePayment = usePaystackPayment(config);

    return (
      <Button
        className="w-full"
        disabled={loading || !PAYSTACK_PUBLIC_KEY}
        onClick={() => {
          initializePayment({
            onSuccess: (ref) => handlePaymentSuccess(ref, plan),
            onClose: () => showError('Payment cancelled.'),
          });
        }}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {PAYSTACK_PUBLIC_KEY ? 'Subscribe Now' : 'Configuration Missing'}
      </Button>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-xl text-muted-foreground">Unlock professional tools to streamline your production workflow.</p>
      </div>

      {subscription && (
        <Card className="max-w-4xl mx-auto mb-12 bg-muted/50">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Details of your current plan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold capitalize">{subscription.plan_type} Plan</p>
              <p className="text-sm text-muted-foreground">
                {isSubscriptionActive ? 'Expires' : 'Expired'} on {format(new Date(subscription.end_date), 'PPP')}
              </p>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm font-bold ${isSubscriptionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {isSubscriptionActive ? 'Active' : 'Expired'}
            </div>
          </CardContent>
        </Card>
      )}

      {isExpired && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
          <p className="font-bold">Your subscription has expired!</p>
          <p>Please select a plan below to continue using the service.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.interval === 'yearly' ? 'border-primary shadow-lg relative' : ''}>
            {plan.interval === 'yearly' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Best Value
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₦{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <PaystackButton plan={plan} />
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Secure payments powered by Paystack. Cancel anytime.</p>
      </div>
    </div>
  );
};

export default Subscription;