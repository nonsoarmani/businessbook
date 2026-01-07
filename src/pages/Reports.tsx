import React from 'react';
import DailyReportCard from '@/components/reports/DailyReportCard';
import MonthlySalesChart from '@/components/reports/MonthlySalesChart';
import ExpenseCategoryReport from '@/components/reports/ExpenseCategoryReport';
import TopSellingItemsReport from '@/components/reports/TopSellingItemsReport';
import ProfitLossReport from '@/components/reports/ProfitLossReport'; // Import new component
import { Separator } from '@/components/ui/separator';

const Reports = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Business Reports</h1>
      <p className="text-gray-600">Gain insights into your business performance.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <DailyReportCard />
          <TopSellingItemsReport />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <ProfitLossReport /> {/* Add ProfitLossReport here */}
          <Separator />
          <MonthlySalesChart />
          <Separator />
          <ExpenseCategoryReport />
        </div>
      </div>
    </div>
  );
};

export default Reports;