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
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
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

  const handlePaymentSuccess = (reference: any, plan: any) => {
    setLoading(true);
    // Redirect to verification edge function
    const verifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-paystack?reference=${reference.reference}&userId=${user?.id}&plan=${plan.interval}`;
    
    fetch(verifyUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          showSuccess(`Successfully subscribed to the ${plan.name}!`);
          refreshProfile();
        } else {
          showError(data.message || 'Payment verification failed.');
        }
      })
      .catch(err => {
        console.error('Verification error:', err);
        showError('An error occurred during verification.');
      })
      .finally(() => setLoading(false));
  };

  const paystackConfig = (plan: any) => ({
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: plan.price * 100, // Paystack amount is in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    plan: plan.planCode, // This connects the payment to the Paystack plan
  });

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