"use client";
import React, { useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNaira } from '@/lib/utils';
import { calculateTotalSales } from '@/utils/salesCalculations';
import { calculateTotalExpenses, groupExpensesByCategory } from '@/utils/expenseCalculations';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const FinancialDashboard = () => {
  const { state } = useBusiness();
  const { sales, expenses, inventory } = state;

  // Calculate monthly data for the last 6 months
  const monthlyData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      const salesTotal = calculateTotalSales(monthSales);
      const expensesTotal = calculateTotalExpenses(monthExpenses);
      const profit = salesTotal - expensesTotal;
      
      data.push({
        name: format(month, 'MMM yyyy'),
        sales: salesTotal,
        expenses: expensesTotal,
        profit: profit,
      });
    }
    
    return data;
  }, [sales, expenses]);

  // Calculate expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const breakdown = groupExpensesByCategory(expenses);
    return breakdown.slice(0, 5); // Top 5 categories
  }, [expenses]);

  // Calculate inventory value
  const inventoryValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  }, [inventory]);

  // Colors for charts
  const COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Sales (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatNaira(monthlyData.reduce((sum, month) => sum + month.sales, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Expenses (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {formatNaira(monthlyData.reduce((sum, month) => sum + month.expenses, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Profit (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${monthlyData.reduce((sum, month) => sum + month.profit, 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatNaira(monthlyData.reduce((sum, month) => sum + month.profit, 0))}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatNaira(value as number)} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#2563eb" />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                  <Bar dataKey="profit" name="Profit" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNaira(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;