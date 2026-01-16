"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailySummary from '@/components/reports/DailySummary';
import WeeklySummary from '@/components/reports/WeeklySummary';
import MonthlySummary from '@/components/reports/MonthlySummary';

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
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Debt Report</h2>
            <p className="text-muted-foreground">Debt report coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="sales-by-payment" className="mt-6">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Sales by Payment Method Report</h2>
            <p className="text-muted-foreground">Sales by payment method report coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="expenses-by-category" className="mt-6">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Expenses by Category Report</h2>
            <p className="text-muted-foreground">Expenses by category report coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;