"use client";

import React from 'react';
import { useBusiness } from '@/state/businessStore';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, getSalesForDay } from '@/utils/salesCalculations';
import { calculateTotalExpenses, getExpensesForDay } from '@/utils/expenseCalculations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Wallet, Handshake, Users, Trash2, Box, LayoutDashboard, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/utils/toast';
import InventorySummary from '@/components/dashboard/InventorySummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const { state, dispatch } = useBusiness();
  const { sales = [], expenses = [], debts = [], customers = [], inventory = [] } = state;
  
  // Combine all activities
  const recentActivities = React.useMemo(() => {
    const allActivities = [
      ...sales.map(s => ({ id: s.id, type: 'sale', title: s.item, amount: s.amount, date: s.date, icon: ShoppingCart, color: 'text-primary' })),
      ...expenses.map(e => ({ id: e.id, type: 'expense', title: e.name, amount: e.amount, date: e.date, icon: Wallet, color: 'text-destructive' })),
      ...debts.filter(d => d.status !== 'paid').map(d => ({ id: d.id, type: 'debt', title: `Debt: ${d.customerName}`, amount: d.amountOwed, date: d.dateGiven, icon: Handshake, color: 'text-warning' }))
    ];

    return allActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [sales, expenses, debts]);

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="sales" className="col-span-1">
            <Button asChild variant="default" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <PlusCircle className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Sales</span>
              </div>
            </Button>
          </Link>
          <Link to="expenses" className="col-span-1">
            <Button asChild variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Expenses</span>
              </div>
            </Button>
          </Link>
          <Link to="inventory" className="col-span-1">
            <Button asChild variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <Box className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Inventory</span>
              </div>
            </Button>
          </Link>
          <Link to="debts" className="col-span-1">
            <Button asChild variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <Handshake className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Debts</span>
              </div>
            </Button>
          </Link>
          <Link to="customers" className="col-span-1">
            <Button asChild variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Customers</span>
              </div>
            </Button>
          </Link>
          <Link to="reports" className="col-span-1">
            <Button asChild variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2">
                <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">Reports</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </h2>
          {recentActivities.length > 0 && (
            <Link to="reports" className="text-xs text-primary hover:underline font-medium">
              View All
            </Link>
          )}
        </div>

        {recentActivities.length > 0 ? (
          <div className="bg-card rounded-xl border shadow-sm divide-y overflow-hidden">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted", activity.color)}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(activity.date), 'MMM d, yyyy')} • {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold flex items-center justify-end gap-1",
                    activity.type === 'expense' ? 'text-destructive' : 'text-success'
                  )}>
                    {activity.type === 'expense' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3" />
                    )}
                    {formatNaira(activity.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card p-12 rounded-xl border border-dashed flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No recent activity to show yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a sale or expense.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;