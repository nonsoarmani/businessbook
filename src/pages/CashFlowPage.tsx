"use client";

import React from 'react';
import CashFlowSummary from '@/components/cashflow/CashFlowSummary';
import CashFlowChart from '@/components/cashflow/CashFlowChart';

const CashFlowPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Cash Flow</h1>
      <p className="text-muted-foreground mb-8">Track your cash inflows and outflows to understand your business's liquidity.</p>
      <div className="space-y-8">
        <CashFlowSummary />
        <CashFlowChart />
      </div>
    </div>
  );
};

export default CashFlowPage;