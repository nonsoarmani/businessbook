"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, getSalesForDay, calculatePaymentMethodBreakdown } from '@/utils/salesCalculations';
import { calculateTotalExpenses, getExpensesForDay, groupExpensesByCategory } from '@/utils/expenseCalculations';

const DailySummary = () => {
  const { state } = useBusiness();
  const { sales, expenses } = state;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dailySales = useMemo(() => getSalesForDay(sales, selectedDate), [sales, selectedDate]);
  const totalDailySales = useMemo(() => calculateTotalSales(dailySales), [dailySales]);
  const dailyPaymentBreakdown = useMemo(() => calculatePaymentMethodBreakdown(dailySales), [dailySales]);

  const dailyExpenses = useMemo(() => getExpensesForDay(expenses, selectedDate), [expenses, selectedDate]);
  const totalDailyExpenses = useMemo(() => calculateTotalExpenses(dailyExpenses), [dailyExpenses]);
  const dailyExpenseBreakdown = useMemo(() => groupExpensesByCategory(dailyExpenses), [dailyExpenses]);

  const dailyProfitLoss = totalDailySales - totalDailyExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Daily Summary
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full md:w-[240px] justify-start text-left font-normal mt-2 md:mt-0',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Sales</h3>
            <p className="text-3xl font-bold text-primary">{formatNaira(totalDailySales)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Expenses</h3>
            <p className="text-3xl font-bold text-destructive">{formatNaira(totalDailyExpenses)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Profit/Loss</h3>
            <p className={`text-3xl font-bold ${dailyProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatNaira(dailyProfitLoss)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Sales Breakdown by Payment Method</h3>
            {Object.entries(dailyPaymentBreakdown).length > 0 && Object.values(dailyPaymentBreakdown).some(amount => amount > 0) ? (
              <div className="space-y-2">
                {Object.entries(dailyPaymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span>{method}:</span>
                    <span className="font-medium">{formatNaira(amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No sales recorded for this day.</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Expenses Breakdown by Category</h3>
            {dailyExpenseBreakdown.length > 0 ? (
              <div className="space-y-2">
                {dailyExpenseBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.category}:</span>
                    <span className="font-medium">{formatNaira(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No expenses recorded for this day.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;