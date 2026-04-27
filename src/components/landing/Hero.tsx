"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 mb-6">
            <span className="mr-2">🇳🇬</span> Built for Nigerian Small Businesses
          </div>
          
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            The Smart Way to Track Your <span className="text-green-600">Business Growth</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            Stop using paper notebooks. Track sales, manage customer debts, monitor inventory, and generate professional invoices all in one place.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white px-8 h-14 text-lg">
              <Link to="/login">
                Get Started for as little as ₦2,000 monthly <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-green-600 text-green-700 hover:bg-green-50 h-14 text-lg">
              <Link to="/login">View Demo</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Secure Cloud Backup</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Easy to Use</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;