import React from 'react';
import CashFlowSummaryCard from '@/components/cashflow/CashFlowSummaryCard';
import MonthlyCashFlowChart from '@/components/cashflow/MonthlyCashFlowChart';
import CashFlowTransactionsTable from '@/components/cashflow/CashFlowTransactionsTable';
import { Separator } from '@/components/ui/separator';

const CashFlow = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Cash Flow Dashboard</h1>
      <p className="text-gray-600">Understand the movement of cash in and out of your business.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CashFlowSummaryCard />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <MonthlyCashFlowChart />
          <Separator />
          <h2 className="text-2xl font-semibold">All Cash Transactions</h2>
          <CashFlowTransactionsTable />
        </div>
      </div>
    </div>
  );
};

export default CashFlow;