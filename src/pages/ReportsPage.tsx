"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailySummary from '@/components/reports/DailySummary';
import WeeklySummary from '@/components/reports/WeeklySummary';
import MonthlySummary from '@/components/reports/MonthlySummary';
import DebtReport from '@/components/reports/DebtReport';
import SalesByPaymentMethodReport from '@/components/reports/SalesByPaymentMethodReport';
import ExpensesByCategoryReport from '@/components/reports/ExpensesByCategoryReport';

const ReportsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Business Reports</h1>
      <p className="text-muted-foreground mb-8">View daily, weekly, and monthly summaries of your business performance, along with other key reports.</p>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="sales-by-payment">Sales by Payment</TabsTrigger>
          <TabsTrigger value="expenses-by-category">Expenses by Category</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6">
          <DailySummary />
        </TabsContent>
        <TabsContent value="weekly" className="mt-6">
          <WeeklySummary />
        </TabsContent>
        <TabsContent value="monthly" className="mt-6">
          <MonthlySummary />
        </TabsContent>
        <TabsContent value="debts" className="mt-6">
          <DebtReport />
        </TabsContent>
        <TabsContent value="sales-by-payment" className="mt-6">
          <SalesByPaymentMethodReport />
        </TabsContent>
        <TabsContent value="expenses-by-category" className="mt-6">
          <ExpensesByCategoryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;