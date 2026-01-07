"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, PieChart as PieChartIcon } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { calculateExpensesByCategory } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const ExpenseCategoryReport = () => {
  const { state } = useBusiness();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
    to: new Date(), // Today
  });

  const expensesByCategory = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return {};
    return calculateExpensesByCategory(state.expenses, dateRange.from, dateRange.to);
  }, [state.expenses, dateRange]);

  const chartData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
  }, [expensesByCategory]);

  const totalExpensesForPeriod = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Expense Breakdown by Category</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Select a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNaira(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-md font-semibold">Total Expenses: {formatNaira(totalExpensesForPeriod)}</h3>
              {chartData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="font-medium" style={{ color: COLORS[index % COLORS.length] }}>{item.name}</span>
                  <span>{formatNaira(item.value)} ({(item.value / totalExpensesForPeriod * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">No expenses recorded for the selected period.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryReport;