"use client";

import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths, addYears } from 'date-fns';

// Using environment variable for the public key
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Monthly Plan',
      price: 2500,
      interval: 'monthly',
      description: 'Perfect for short-term projects',
      features: ['Unlimited Shot Lists', 'PDF Exports', 'Custom Templates', 'Priority Support'],
      amount: 250000, // in kobo
    },
    {
      name: 'Yearly Plan',
      price: 25000,
      interval: 'yearly',
      description: 'Best value for professional creators',
      features: ['Everything in Monthly', '2 Months Free', 'Early Access to Features', 'Exclusive Creator Community'],
      amount: 2500000, // in kobo
    }
  ];

  const handlePaymentSuccess = async (reference: any, plan: any) => {
    setLoading(true);
    try {
      const endDate = plan.interval === 'monthly' 
        ? addMonths(new Date(), 1) 
        : addYears(new Date(), 1);

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user?.id,
          plan_type: plan.interval,
          status: 'active',
          amount: plan.price,
          paystack_reference: reference.reference,
          end_date: endDate.toISOString(),
        });

      if (subError) throw subError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'pro' })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      showSuccess(`Successfully subscribed to the ${plan.name}!`);
    } catch (error: any) {
      showError(error.message || 'Failed to update subscription status.');
    } finally {
      setLoading(false);
    }
  };

  const PaystackButton = ({ plan }: { plan: any }) => {
    const config = {
      reference: (new Date()).getTime().toString(),
      email: user?.email || '',
      amount: plan.amount,
      publicKey: PAYSTACK_PUBLIC_KEY,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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