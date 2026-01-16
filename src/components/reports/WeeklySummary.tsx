"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, filterSalesByPeriod, calculateWeekOverWeekComparison } from '@/utils/salesCalculations';
import { calculateTotalExpenses, filterExpensesByPeriod, calculateWeekOverWeekExpenseComparison } from '@/utils/expenseCalculations';

const WeeklySummary = () => {
  const { state } = useBusiness();
  const { sales, expenses } = state;

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday

  const currentWeekSalesData = useMemo(() => filterSalesByPeriod(sales, 'All', currentWeekStart, endOfWeek(currentWeekStart, { weekStartsOn: 1 })), [sales, currentWeekStart]);
  const totalCurrentWeekSales = useMemo(() => calculateTotalSales(currentWeekSalesData), [currentWeekSalesData]);

  const currentWeekExpensesData = useMemo(() => filterExpensesByPeriod(expenses, 'All', currentWeekStart, endOfWeek(currentWeekStart, { weekStartsOn: 1 })), [expenses, currentWeekStart]);
  const totalCurrentWeekExpenses = useMemo(() => calculateTotalExpenses(currentWeekExpensesData), [currentWeekExpensesData]);

  const currentWeekProfitLoss = totalCurrentWeekSales - totalCurrentWeekExpenses;

  const { currentWeekSales: wowCurrentSales, lastWeekSales: wowLastSales, percentageChange: wowSalesChange } = useMemo(() => calculateWeekOverWeekComparison(sales), [sales]);
  const { currentWeekExpenses: wowCurrentExpenses, lastWeekExpenses: wowLastExpenses, percentageChange: wowExpensesChange } = useMemo(() => calculateWeekOverWeekExpenseComparison(expenses), [expenses]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleSelectWeek = (date: Date | undefined) => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  const weekRange = `${format(currentWeekStart, 'MMM dd, yyyy')} - ${format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy')}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Weekly Summary
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !currentWeekStart && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{weekRange}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={currentWeekStart}
                  onSelect={handleSelectWeek}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Sales (This Week)</h3>
            <p className="text-3xl font-bold text-primary">{formatNaira(totalCurrentWeekSales)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Expenses (This Week)</h3>
            <p className="text-3xl font-bold text-destructive">{formatNaira(totalCurrentWeekExpenses)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Profit/Loss (This Week)</h3>
            <p className={`text-3xl font-bold ${currentWeekProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatNaira(currentWeekProfitLoss)}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-3">Week-over-Week Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/40 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sales Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Current Week: <span className="font-medium text-foreground">{formatNaira(wowCurrentSales)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last Week: <span className="font-medium text-foreground">{formatNaira(wowLastSales)}</span>
              </p>
              {wowSalesChange !== null && (
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  wowSalesChange >= 0 ? "text-success" : "text-destructive"
                )}>
                  {wowSalesChange >= 0 ? '↑' : '↓'} {Math.abs(wowSalesChange).toFixed(2)}% vs Last Week
                </p>
              )}
              {wowSalesChange === null && wowLastSales === 0 && wowCurrentSales > 0 && (
                <p className="text-sm font-semibold mt-1 text-success">
                  ↑ 100% vs Last Week (No sales last week)
                </p>
              )}
              {wowSalesChange === null && wowLastSales === 0 && wowCurrentSales === 0 && (
                <p className="text-sm font-semibold mt-1 text-muted-foreground">
                  No sales recorded for last two weeks.
                </p>
              )}
            </div>
            <div className="bg-muted/40 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Expenses Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Current Week: <span className="font-medium text-foreground">{formatNaira(wowCurrentExpenses)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last Week: <span className="font-medium text-foreground">{formatNaira(wowLastExpenses)}</span>
              </p>
              {wowExpensesChange !== null && (
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  wowExpensesChange >= 0 ? "text-destructive" : "text-success"
                )}>
                  {wowExpensesChange >= 0 ? '↑' : '↓'} {Math.abs(wowExpensesChange).toFixed(2)}% vs Last Week
                </p>
              )}
              {wowExpensesChange === null && wowLastExpenses === 0 && wowCurrentExpenses > 0 && (
                <p className="text-sm font-semibold mt-1 text-destructive">
                  ↑ 100% vs Last Week (No expenses last week)
                </p>
              )}
              {wowExpensesChange === null && wowLastExpenses === 0 && wowCurrentExpenses === 0 && (
                <p className="text-sm font-semibold mt-1 text-muted-foreground">
                  No expenses recorded for last two weeks.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;