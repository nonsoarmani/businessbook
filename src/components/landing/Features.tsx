"use client";

import React from 'react';
import { ShoppingCart, Handshake, Box, ReceiptText, BarChart3, BellRing } from 'lucide-react';

const features = [
  {
    title: 'Sales Tracking',
    description: 'Record every sale instantly. Track cash, transfer, and POS payments with ease.',
    icon: ShoppingCart,
  },
  {
    title: 'Debt Management',
    description: 'Never forget who owes you. Track customer debts and get reminders for due dates.',
    icon: Handshake,
  },
  {
    title: 'Inventory Control',
    description: 'Monitor your stock levels. Get alerts when items are running low so you never run out.',
    icon: Box,
  },
  {
    title: 'Professional Invoices',
    description: 'Generate and share professional receipts and invoices with your customers via WhatsApp.',
    icon: ReceiptText,
  },
  {
    title: 'Financial Reports',
    description: 'See your profit and loss at a glance. View daily, weekly, and monthly business summaries.',
    icon: BarChart3,
  },
  {
    title: 'Smart Notifications',
    description: 'Stay on top of your business with automated reminders for debts and low stock.',
    icon: BellRing,
  },
];

const Features = () => {
  return (
    <section className="bg-emerald-50/50 py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to run your business</h2>
          <p className="mt-4 text-lg text-slate-600">Powerful tools designed specifically for the Nigerian marketplace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;