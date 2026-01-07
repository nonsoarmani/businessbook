"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Wallet, HandCoins } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { calculateDailySummary } from '@/lib/calculations';

const DailyReportCard = () => {
  const { state } = useBusiness();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { totalSales, totalExpenses, profitLoss } = calculateDailySummary(
    state.sales,
    state.expenses,
    selectedDate
  );

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Daily Summary</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-green-600" /> Total Sales:
          </span>
          <span className="font-bold text-lg">{formatNaira(totalSales)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-red-600" /> Total Expenses:
          </span>
          <span className="font-bold text-lg">{formatNaira(totalExpenses)}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <span className="text-md font-semibold flex items-center gap-2">
            {profitLoss >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
            Net Profit/Loss:
          </span>
          <span className={cn("text-xl font-bold", profitLoss >= 0 ? "text-green-600" : "text-red-600")}>
            {formatNaira(profitLoss)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReportCard;