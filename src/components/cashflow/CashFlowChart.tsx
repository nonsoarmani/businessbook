"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, addMonths, subWeeks, addWeeks, parseISO } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatNaira } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCashFlowSummaryByDay, getCashFlowSummaryByMonth } from '@/utils/cashFlowCalculations';

type ChartPeriod = 'Daily' | 'Monthly';

const CashFlowChart = () => {
  const { state } = useBusiness();
  const { sales, expenses } = state;

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('Monthly');
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Used for navigation

  const chartData = useMemo(() => {
    if (chartPeriod === 'Daily') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return getCashFlowSummaryByDay(sales, expenses, start, end);
    } else { // Monthly
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return getCashFlowSummaryByDay(sales, expenses, start, end); // Daily data for the month
    }
  }, [sales, expenses, chartPeriod, currentDate]);

  const handlePrevious = () => {
    if (chartPeriod === 'Daily') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (chartPeriod === 'Daily') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const formattedDateRange = useMemo(() => {
    if (chartPeriod === 'Daily') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  }, [chartPeriod, currentDate]);

  const dataKeyFormat = chartPeriod === 'Daily' ? 'dd/MM' : 'MMM yyyy';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
          Cash Flow Trend
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Select onValueChange={(value: ChartPeriod) => setChartPeriod(value)} defaultValue={chartPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[180px] justify-start text-left font-normal',
                    !currentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{formattedDateRange}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={handleSelectDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(parseISO(value), dataKeyFormat)}
                  className="text-xs"
                />
                <YAxis tickFormatter={(value) => formatNaira(value)} className="text-xs" />
                <Tooltip formatter={(value: number) => formatNaira(value)} labelFormatter={(label) => format(parseISO(label), 'PPP')} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--success))" activeDot={{ r: 8 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} name="Expense" />
                <Line type="monotone" dataKey="netFlow" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} name="Net Flow" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No cash flow data available for the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;