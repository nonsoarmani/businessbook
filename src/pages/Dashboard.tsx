"use client";
import React, { useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, getSalesForDay } from '@/utils/salesCalculations';
import { calculateTotalExpenses, getExpensesForDay } from '@/utils/expenseCalculations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Wallet, Handshake, Users, Trash2, Box, LayoutDashboard } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/utils/toast';
import InventorySummary from '@/components/dashboard/InventorySummary';

const Dashboard = () => {
  const { state, dispatch } = useBusiness();
  const { sales = [], expenses = [], debts = [], customers = [], inventory = [] } = state;
  const today = new Date();
  
  const todaySalesData = useMemo(() => getSalesForDay(sales, today), [sales, today]);
  const totalTodaySales = useMemo(() => calculateTotalSales(todaySalesData), [todaySalesData]);
  
  const todayExpensesData = useMemo(() => getExpensesForDay(expenses, today), [expenses, today]);
  const totalTodayExpenses = useMemo(() => calculateTotalExpenses(todayExpensesData), [todayExpensesData]);
  
  const todayProfitLoss = totalTodaySales - totalTodayExpenses;
  
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
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">Today's Sales</h2>
            <ShoppingCart className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold text-primary">{formatNaira(totalTodaySales)}</p>
        </div>
        
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">Today's Expenses</h2>
            <Wallet className="h-4 w-4 text-destructive opacity-70" />
          </div>
          <p className="text-2xl font-bold text-destructive">{formatNaira(totalTodayExpenses)}</p>
        </div>
        
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">Today's Profit</h2>
            <Box className="h-4 w-4 text-success opacity-70" />
          </div>
          <p className={cn("text-2xl font-bold", todayProfitLoss >= 0 ? 'text-success' : 'text-destructive')}>
            {formatNaira(todayProfitLoss)}
          </p>
        </div>
        
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">Total Customers</h2>
            <Users className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold">{totalCustomers}</p>
        </div>
        
        <InventorySummary />
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button asChild variant="default" className="h-auto py-4 flex-col gap-2">
            <Link to="/sales">
              <PlusCircle className="h-5 w-5" /> 
              <span className="text-xs">Add Sale</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto py-4 flex-col gap-2">
            <Link to="/expenses">
              <PlusCircle className="h-5 w-5" /> 
              <span className="text-xs">Add Expense</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/inventory">
              <Box className="h-5 w-5" /> 
              <span className="text-xs">Inventory</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/debts">
              <Handshake className="h-5 w-5" /> 
              <span className="text-xs">Debts</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/customers">
              <Users className="h-5 w-5" /> 
              <span className="text-xs">Customers</span>
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-auto py-4 flex-col gap-2">
                <Trash2 className="h-5 w-5" /> 
                <span className="text-xs">Clear Data</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your business records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllData}>Confirm Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Recent Activity Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Recent Activity</h2>
        <div className="bg-card p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No recent activity to show yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a sale or expense.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;