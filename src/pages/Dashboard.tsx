"use client";

import React, { useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateTotalSales, getSalesForDay } from '@/utils/salesCalculations';
import { calculateTotalExpenses, getExpensesForDay } from '@/utils/expenseCalculations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Wallet, Handshake } from 'lucide-react';

const Dashboard = () => {
  const { state } = useBusiness();
  const { sales, expenses, debts } = state;

  const today = new Date();

  const todaySalesData = useMemo(() => getSalesForDay(sales, today), [sales, today]);
  const totalTodaySales = useMemo(() => calculateTotalSales(todaySalesData), [todaySalesData]);

  const todayExpensesData = useMemo(() => getExpensesForDay(expenses, today), [expenses, today]);
  const totalTodayExpenses = useMemo(() => calculateTotalExpenses(todayExpensesData), [todayExpensesData]);

  const todayProfitLoss = totalTodaySales - totalTodayExpenses;

  const totalOutstandingDebts = useMemo(() => {
    return debts.filter(debt => debt.status !== 'paid').reduce((sum, debt) => sum + debt.amountOwed, 0);
  }, [debts]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to BusinessBook! Your business overview will appear here.</p>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Sales</h2>
          <p className="text-3xl font-bold text-primary">{formatNaira(totalTodaySales)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Expenses</h2>
          <p className="text-3xl font-bold text-destructive">{formatNaira(totalTodayExpenses)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Profit/Loss</h2>
          <p className={`text-3xl font-bold ${todayProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatNaira(todayProfitLoss)}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Outstanding Debts</h2>
          <p className="text-3xl font-bold text-warning">{formatNaira(totalOutstandingDebts)}</p>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/sales">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Sale
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/expenses">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/debts">
              <PlusCircle className="mr-2 h-4 w-4" /> Record Debt
            </Link>
          </Button>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <p className="text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;