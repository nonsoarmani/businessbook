"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const Pricing = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your business size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="border rounded-3xl p-8 bg-white shadow-sm hover:border-green-200 transition-colors">
            <h3 className="text-xl font-bold text-gray-900">Monthly Plan</h3>
            <p className="mt-2 text-gray-600">Flexible for growing businesses</p>
            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">₦2,000</span>
              <span className="ml-1 text-gray-500">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Unlimited Sales Records', 'Debt Tracking', 'Inventory Management', 'Basic Reports'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-10 w-full bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 h-12">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>

          <div className="border-2 border-green-600 rounded-3xl p-8 bg-green-50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
              SAVE ₦4,000
            </div>
            <h3 className="text-xl font-bold text-gray-900">Yearly Plan</h3>
            <p className="mt-2 text-gray-600">Best value for serious owners</p>
            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">₦20,000</span>
              <span className="ml-1 text-gray-500">/year</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Everything in Monthly', 'Priority Support', 'Advanced Analytics', 'Custom Branding'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white h-12">
              <Link to="/login">Subscribe Yearly</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;