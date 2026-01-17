"use client";
import React, { useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateTotalSales, getSalesForDay } from '@/utils/salesCalculations';
import { calculateTotalExpenses, getExpensesForDay } from '@/utils/expenseCalculations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Wallet, Handshake, Users, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/utils/toast';

const Dashboard = () => {
  const { state, dispatch } = useBusiness();
  const { sales = [], expenses = [], debts = [], customers = [] } = state;
  const today = new Date();
  
  const todaySalesData = useMemo(() => getSalesForDay(sales, today), [sales, today]);
  const totalTodaySales = useMemo(() => calculateTotalSales(todaySalesData), [todaySalesData]);
  
  const todayExpensesData = useMemo(() => getExpensesForDay(expenses, today), [expenses, today]);
  const totalTodayExpenses = useMemo(() => calculateTotalExpenses(todayExpensesData), [todayExpensesData]);
  
  const todayProfitLoss = totalTodaySales - totalTodayExpenses;
  
  const totalOutstandingDebts = useMemo(() => {
    return debts.filter(debt => debt.status !== 'paid').reduce((sum, debt) => sum + debt.amountOwed, 0);
  }, [debts]);
  
  const totalCustomers = useMemo(() => customers.length, [customers]);

  const handleClearAllData = () => {
    try {
      dispatch({ type: 'CLEAR_ALL_DATA' });
      showSuccess('All business data has been cleared!');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      showError('Failed to clear all data. Please try again.');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome to BusinessBook! Your business overview will appear here.</p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-semibold">Today's Sales</h2>
          <p className="text-2xl md:text-3xl font-bold text-primary">{formatNaira(totalTodaySales)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-semibold">Today's Expenses</h2>
          <p className="text-2xl md:text-3xl font-bold text-destructive">{formatNaira(totalTodayExpenses)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-semibold">Today's Profit/Loss</h2>
          <p className={`text-2xl md:text-3xl font-bold ${todayProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatNaira(todayProfitLoss)}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-semibold">Total Customers</h2>
          <p className="text-2xl md:text-3xl font-bold text-primary">{totalCustomers}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button asChild className="w-full">
            <Link to="/sales">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Sale
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/expenses">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/debts">
              <PlusCircle className="mr-2 h-4 w-4" /> Record Debt
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/customers">
              <Users className="mr-2 h-4 w-4" /> Manage Customers
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:col-span-2 lg:col-span-1">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your sales, expenses, debts, and receipts data from this application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllData}>Confirm Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <p className="text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;