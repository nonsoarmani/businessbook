import React from 'react';
import ExpenseEntryForm from '@/components/expenses/ExpenseEntryForm';
import ExpensesSummaryCard from '@/components/expenses/ExpensesSummaryCard';
import ExpensesHistoryTable from '@/components/expenses/ExpensesHistoryTable';
import WeeklyExpenseBreakdown from '@/components/expenses/WeeklyExpenseBreakdown';
import ExpenseAnalyticsCard from '@/components/expenses/ExpenseAnalyticsCard';
import { Separator } from '@/components/ui/separator';

const Expenses = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Expense Tracking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-semibold">Record New Expense</h2>
          <ExpenseEntryForm />
          <Separator />
          <h2 className="text-2xl font-semibold">Today's Summary</h2>
          <ExpensesSummaryCard />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-semibold">Expense History</h2>
          <ExpensesHistoryTable />
          <Separator />
          <h2 className="text-2xl font-semibold">Weekly Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WeeklyExpenseBreakdown />
            <ExpenseAnalyticsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;