"use client";

import React from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { state, dispatch } = useBusiness();
  const { sales = [], expenses = [], debts = [], customers = [], inventory = [] } = state;
  const today = new Date();
  
  const todaySalesData = React.useMemo(() => getSalesForDay(sales, today), [sales, today]);
  const totalTodaySales = React.useMemo(() => calculateTotalSales(todaySalesData), [todaySalesData]);
  
  const todayExpensesData = React.useMemo(() => getExpensesForDay(expenses, today), [expenses, today]);
  const totalTodayExpenses = React.useMemo(() => calculateTotalExpenses(todayExpensesData), [todayExpensesData]);
  
  const todayProfitLoss = totalTodaySales - totalTodayExpenses;
  
  const totalCustomers = React.useMemo(() => customers.length, [customers]);

  const handleClearAllData = () => {
    try {
      dispatch({ type: 'CLEAR_ALL_DATA' });
      showSuccess('All business data has been cleared!');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      showError('Failed to clear all data. Please try again.');
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-2 md:flex md:flex-row gap-3">
          <Link to="sales" className="col-span-1">
            <Button asChild variant="default" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex flex-col items-center gap-1">
                <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[10px] md:text-xs">Add Sale</span>
              </div>
            </Button>
          </Link>
          <Link to="expenses" className="col-span-1">
            <Button asChild variant="secondary" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex flex-col items-center gap-1">
                <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[10px] md:text-xs">Add Expense</span>
              </div>
            </Button>
          </Link>
          <Link to="inventory" className="col-span-1">
            <Button asChild variant="outline" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex flex-col items-center gap-1">
                <Box className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[10px] md:text-xs">Inventory</span>
              </div>
            </Button>
          </Link>
          <Link to="debts" className="col-span-1">
            <Button asChild variant="outline" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex flex-col items-center gap-1">
                <Handshake className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[10px] md:text-xs">Debts</span>
              </div>
            </Button>
          </Link>
          <Link to="customers" className="col-span-1">
            <Button asChild variant="outline" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex flex-col items-center gap-1">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[10px] md:text-xs">Customers</span>
              </div>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full py-3 md:py-4 flex flex-col items-center gap-1 md:gap-2 col-span-1">
                <div className="flex flex-col items-center gap-1">
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] md:text-xs">Clear Data</span>
                </div>
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