import React, { useState } from 'react';
import SaleEntryForm from '@/components/sales/SaleEntryForm';
import SalesOverviewCard from '@/components/sales/SalesOverviewCard'; // Renamed import
import SalesHistoryTable from '@/components/sales/SalesHistoryTable';
import { Separator } from '@/components/ui/separator';

const Sales = () => {
  const [salesFilter, setSalesFilter] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth'>('all');

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
          <SalesOverviewCard filter={salesFilter} /> {/* Pass filter to the overview card */}
          <Separator />
          <h2 className="text-2xl font-semibold">Sales History</h2>
          <SalesHistoryTable currentFilter={salesFilter} onFilterChange={setSalesFilter} /> {/* Pass filter and setter to table */}
        </div>
      </div>
    </div>
  );
};

export default Sales;