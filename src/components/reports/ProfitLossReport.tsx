"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { calculateProfitLossStatement } from '@/lib/calculations';
import { DateRange } from 'react-day-picker';

const ProfitLossReport = () => {
  const { state } = useBusiness();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
    to: new Date(), // Today
  });

  const { totalSales, totalExpenses, netProfitLoss } = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { totalSales: 0, totalExpenses: 0, netProfitLoss: 0 };
    }
    return calculateProfitLossStatement(state.sales, state.expenses, dateRange.from, dateRange.to);
  }, [state.sales, state.expenses, dateRange]);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Profit & Loss Statement</CardTitle>
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
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Sales:</span>
          <span className="font-bold text-lg text-green-600">{formatNaira(totalSales)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Expenses:</span>
          <span className="font-bold text-lg text-red-600">{formatNaira(totalExpenses)}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <span className="text-md font-semibold flex items-center gap-2">
            {netProfitLoss >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
            Net Profit/Loss:
          </span>
          <span className={cn("text-xl font-bold", netProfitLoss >= 0 ? "text-green-600" : "text-red-600")}>
            {formatNaira(netProfitLoss)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitLossReport;