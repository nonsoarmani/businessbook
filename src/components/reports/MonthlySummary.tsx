"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, filterSalesByPeriod } from '@/utils/salesCalculations';
import { calculateTotalExpenses, filterExpensesByPeriod } from '@/utils/expenseCalculations';

const MonthlySummary = () => {
  const { state } = useBusiness();
  const { sales, expenses } = state;

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const currentMonthSalesData = useMemo(() => filterSalesByPeriod(sales, 'All', startOfMonth(selectedMonth), endOfMonth(selectedMonth)), [sales, selectedMonth]);
  const totalCurrentMonthSales = useMemo(() => calculateTotalSales(currentMonthSalesData), [currentMonthSalesData]);

  const currentMonthExpensesData = useMemo(() => filterExpensesByPeriod(expenses, 'All', startOfMonth(selectedMonth), endOfMonth(selectedMonth)), [expenses, selectedMonth]);
  const totalCurrentMonthExpenses = useMemo(() => calculateTotalExpenses(currentMonthExpensesData), [currentMonthExpensesData]);

  const currentMonthProfitLoss = totalCurrentMonthSales - totalCurrentMonthExpenses;

  // Month-over-month comparison
  const lastMonth = subMonths(selectedMonth, 1);
  const lastMonthSalesData = useMemo(() => filterSalesByPeriod(sales, 'All', startOfMonth(lastMonth), endOfMonth(lastMonth)), [sales, lastMonth]);
  const totalLastMonthSales = useMemo(() => calculateTotalSales(lastMonthSalesData), [lastMonthSalesData]);

  const lastMonthExpensesData = useMemo(() => filterExpensesByPeriod(expenses, 'All', startOfMonth(lastMonth), endOfMonth(lastMonth)), [expenses, lastMonth]);
  const totalLastMonthExpenses = useMemo(() => calculateTotalExpenses(lastMonthExpensesData), [lastMonthExpensesData]);

  const salesMonthOverMonthChange = useMemo(() => {
    if (totalLastMonthSales > 0) {
      return ((totalCurrentMonthSales - totalLastMonthSales) / totalLastMonthSales) * 100;
    } else if (totalCurrentMonthSales > 0) {
      return 100;
    }
    return null;
  }, [totalCurrentMonthSales, totalLastMonthSales]);

  const expensesMonthOverMonthChange = useMemo(() => {
    if (totalLastMonthExpenses > 0) {
      return ((totalCurrentMonthExpenses - totalLastMonthExpenses) / totalLastMonthExpenses) * 100;
    } else if (totalCurrentMonthExpenses > 0) {
      return 100;
    }
    return null;
  }, [totalCurrentMonthExpenses, totalLastMonthExpenses]);


  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handleSelectMonth = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(startOfMonth(date));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Monthly Summary
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !selectedMonth && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{format(selectedMonth, 'MMMM yyyy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={handleSelectMonth}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Sales (This Month)</h3>
            <p className="text-3xl font-bold text-primary">{formatNaira(totalCurrentMonthSales)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Expenses (This Month)</h3>
            <p className="text-3xl font-bold text-destructive">{formatNaira(totalCurrentMonthExpenses)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Profit/Loss (This Month)</h3>
            <p className={`text-3xl font-bold ${currentMonthProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatNaira(currentMonthProfitLoss)}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-3">Month-over-Month Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/40 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sales Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Current Month: <span className="font-medium text-foreground">{formatNaira(totalCurrentMonthSales)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last Month: <span className="font-medium text-foreground">{formatNaira(totalLastMonthSales)}</span>
              </p>
              {salesMonthOverMonthChange !== null && (
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  salesMonthOverMonthChange >= 0 ? "text-success" : "text-destructive"
                )}>
                  {salesMonthOverMonthChange >= 0 ? '↑' : '↓'} {Math.abs(salesMonthOverMonthChange).toFixed(2)}% vs Last Month
                </p>
              )}
              {salesMonthOverMonthChange === null && totalLastMonthSales === 0 && totalCurrentMonthSales > 0 && (
                <p className="text-sm font-semibold mt-1 text-success">
                  ↑ 100% vs Last Month (No sales last month)
                </p>
              )}
              {salesMonthOverMonthChange === null && totalLastMonthSales === 0 && totalCurrentMonthSales === 0 && (
                <p className="text-sm font-semibold mt-1 text-muted-foreground">
                  No sales recorded for last two months.
                </p>
              )}
            </div>
            <div className="bg-muted/40 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Expenses Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Current Month: <span className="font-medium text-foreground">{formatNaira(totalCurrentMonthExpenses)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last Month: <span className="font-medium text-foreground">{formatNaira(totalLastMonthExpenses)}</span>
              </p>
              {expensesMonthOverMonthChange !== null && (
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  expensesMonthOverMonthChange >= 0 ? "text-destructive" : "text-success"
                )}>
                  {expensesMonthOverMonthChange >= 0 ? '↑' : '↓'} {Math.abs(expensesMonthOverMonthChange).toFixed(2)}% vs Last Month
                </p>
              )}
              {expensesMonthOverMonthChange === null && totalLastMonthExpenses === 0 && totalCurrentMonthExpenses > 0 && (
                <p className="text-sm font-semibold mt-1 text-destructive">
                  ↑ 100% vs Last Month (No expenses last month)
                </p>
              )}
              {expensesMonthOverMonthChange === null && totalLastMonthExpenses === 0 && totalCurrentMonthExpenses === 0 && (
                <p className="text-sm font-semibold mt-1 text-muted-foreground">
                  No expenses recorded for last two months.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySummary;