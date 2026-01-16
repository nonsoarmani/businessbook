"use client";

import React from 'react';

const CashFlowPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Cash Flow</h1>
      <p className="text-muted-foreground">Track your cash and bank balances.</p>
      {/* Cash Flow Dashboard */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Cash Flow Overview</h2>
        {/* Cash, Bank, and Combined totals will go here */}
        <p>Cash flow dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default CashFlowPage;