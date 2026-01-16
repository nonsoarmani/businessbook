"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  getIncomeByPaymentMethod,
  getExpensesByCategory,
} from '@/utils/cashFlowCalculations';

type FilterPeriod = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';

const CashFlowSummary = () => {
  const { state } = useBusiness();
  const { sales, expenses } = state;

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('This Month');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handlePeriodChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
    const today = new Date();
    if (period === 'Today') {
      setDateRange({ from: today, to: today });
    } else if (period === 'This Week') {
      setDateRange({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) });
    } else if (period === 'This Month') {
      setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
    } else if (period === 'All') {
      setDateRange({}); // Clear custom range
    }
  };

  const totalIncome = useMemo(() => calculateTotalIncome(sales.filter(sale =>
    (!dateRange.from || new Date(sale.date) >= dateRange.from) &&
    (!dateRange.to || new Date(sale.date) <= dateRange.to)
  )), [sales, dateRange]);

  const totalExpenses = useMemo(() => calculateTotalExpenses(expenses.filter(expense =>
    (!dateRange.from || new Date(expense.date) >= dateRange.from) &&
    (!dateRange.to || new Date(expense.date) <= dateRange.to)
  )), [expenses, dateRange]);

  const netCashFlow = useMemo(() => calculateNetCashFlow(sales, expenses, dateRange.from, dateRange.to), [sales, expenses, dateRange]);

  const incomeBreakdown = useMemo(() => getIncomeByPaymentMethod(sales, dateRange.from, dateRange.to), [sales, dateRange]);
  const expenseBreakdown = useMemo(() => getExpensesByCategory(expenses, dateRange.from, dateRange.to), [expenses, dateRange]);

  const isCustomRangeSelected = filterPeriod === 'Custom';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Cash Flow Summary
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Select onValueChange={handlePeriodChange} defaultValue={filterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {(['All', 'Today', 'This Week', 'This Month', 'Custom'] as FilterPeriod[]).map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCustomRangeSelected && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Income</h3>
            <p className="text-3xl font-bold text-success">{formatNaira(totalIncome)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Expenses</h3>
            <p className="text-3xl font-bold text-destructive">{formatNaira(totalExpenses)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Net Cash Flow</h3>
            <p className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatNaira(netCashFlow)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Income by Payment Method</h3>
            {Object.values(incomeBreakdown).some(amount => amount > 0) ? (
              <div className="space-y-2">
                {Object.entries(incomeBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span>{method}:</span>
                    <span className="font-medium">{formatNaira(amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No income recorded for this period.</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Expenses by Category</h3>
            {expenseBreakdown.length > 0 ? (
              <div className="space-y-2">
                {expenseBreakdown.map((item, index) => (
                  <div key={item.category} className="flex justify-between text-sm">
                    <span>{item.category}:</span>
                    <span className="font-medium">{formatNaira(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No expenses recorded for this period.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowSummary;