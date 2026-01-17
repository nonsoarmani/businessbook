"use client";
import React from 'react';
import DebtForm from '@/components/debts/DebtForm';
import DebtDisplay from '@/components/debts/DebtDisplay';

const DebtsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Debt Management</h1>
      <p className="text-muted-foreground mb-6">Keep track of money owed to your business.</p>
      
      {/* Debt Entry Form */}
      <div className="mb-8 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Record New Debt</h2>
        <DebtForm />
      </div>
      
      {/* Debt Display */}
      <div>
        <DebtDisplay />
      </div>
    </div>
  );
};

export default DebtsPage;