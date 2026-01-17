"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import { calculateTotalSales, calculatePaymentMethodBreakdown } from '@/utils/salesCalculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import type { DateRange } from "react-day-picker";

type FilterPeriod = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';

const SalesByPaymentMethodReport = () => {
  const { state } = useBusiness();
  const { sales } = state;
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('This Month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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
      setDateRange(undefined); // Clear custom range
    }
  };

  const filteredSales = useMemo(() => {
    if (filterPeriod === 'All') {
      return sales;
    }
    
    if (filterPeriod === 'Custom' && dateRange?.from && dateRange?.to) {
      return sales.filter(sale => {
        const saleDate = parseISO(sale.date);
        return isWithinInterval(saleDate, { start: dateRange.from!, end: dateRange.to! });
      });
    }
    
    // For predefined periods, we need to filter manually
    const today = new Date();
    switch (filterPeriod) {
      case 'Today':
        const todayStr = format(today, 'yyyy-MM-dd');
        return sales.filter(sale => sale.date === todayStr);
      case 'This Week':
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        return sales.filter(sale => {
          const saleDate = parseISO(sale.date);
          return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
        });
      case 'This Month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return sales.filter(sale => {
          const saleDate = parseISO(sale.date);
          return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
        });
      default:
        return sales;
    }
  }, [sales, filterPeriod, dateRange]);

  const totalSales = useMemo(() => calculateTotalSales(filteredSales), [filteredSales]);
  const paymentBreakdown = useMemo(() => calculatePaymentMethodBreakdown(filteredSales), [filteredSales]);

  const isCustomRangeSelected = filterPeriod === 'Custom';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Sales by Payment Method Report
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
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
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
        <div className="bg-muted/40 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Sales for Period</h3>
          <p className="text-3xl font-bold text-primary">{formatNaira(totalSales)}</p>
        </div>
        <Separator />
        <div>
          <h3 className="text-xl font-semibold mb-3">Breakdown by Payment Method</h3>
          {totalSales > 0 ? (
            <div className="space-y-2">
              {Object.entries(paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-base">
                  <span>{method}:</span>
                  <span className="font-medium">{formatNaira(amount)} ({((amount / totalSales) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No sales recorded for the selected period.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesByPaymentMethodReport;