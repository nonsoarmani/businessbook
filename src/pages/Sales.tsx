import React from 'react';
import SaleEntryForm from '@/components/sales/SaleEntryForm';
import SalesSummaryCard from '@/components/sales/SalesSummaryCard';
import SalesHistoryTable from '@/components/sales/SalesHistoryTable';
import { Separator } from '@/components/ui/separator';

const Sales = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Sales Tracking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Record New Sale</h2>
          <SaleEntryForm />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-semibold">Sales Overview</h2>
          <SalesSummaryCard />
          <Separator />
          <h2 className="text-2xl font-semibold">Sales History</h2>
          <SalesHistoryTable />
        </div>
      </div>
    </div>
  );
};

export default Sales;