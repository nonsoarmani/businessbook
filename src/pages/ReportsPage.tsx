"use client";
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailySummary from '@/components/reports/DailySummary';
import WeeklySummary from '@/components/reports/WeeklySummary';
import MonthlySummary from '@/components/reports/MonthlySummary';
import DebtReport from '@/components/reports/DebtReport';
import SalesByPaymentMethodReport from '@/components/reports/SalesByPaymentMethodReport';
import ExpensesByCategoryReport from '@/components/reports/ExpensesByCategoryReport';
import FinancialDashboard from '@/components/reports/FinancialDashboard';

const ReportsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Business Reports</h1>
      <p className="text-muted-foreground mb-6">View daily, weekly, and monthly summaries of your business performance, along with other key reports.</p>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs md:text-sm">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs md:text-sm">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs md:text-sm">Monthly</TabsTrigger>
          <TabsTrigger value="debts" className="text-xs md:text-sm">Debts</TabsTrigger>
          <TabsTrigger value="sales-by-payment" className="text-xs md:text-sm hidden md:block">Sales by Payment</TabsTrigger>
          <TabsTrigger value="expenses-by-category" className="text-xs md:text-sm hidden md:block">Expenses by Category</TabsTrigger>
        </TabsList>
        
        {/* Mobile tabs for smaller screens */}
        <div className="md:hidden grid grid-cols-2 gap-2 mt-2">
          <TabsList className="h-auto">
            <TabsTrigger value="sales-by-payment" className="text-xs w-full">Sales by Payment</TabsTrigger>
          </TabsList>
          <TabsList className="h-auto">
            <TabsTrigger value="expenses-by-category" className="text-xs w-full">Expenses by Category</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="mt-6">
          <FinancialDashboard />
        </TabsContent>
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