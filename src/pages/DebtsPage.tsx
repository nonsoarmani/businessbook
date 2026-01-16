"use client";

import React from 'react';
import DebtForm from '@/components/debts/DebtForm';
import DebtDisplay from '@/components/debts/DebtDisplay';

const DebtsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Debt Management</h1>
      <p className="text-muted-foreground">Keep track of money owed to your business.</p>
      {/* Debt Entry Form */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Record New Debt</h2>
        <DebtForm />
      </div>
      {/* Debt Display */}
      <div className="mt-8">
        <DebtDisplay />
      </div>
    </div>
  );
};

export default DebtsPage;