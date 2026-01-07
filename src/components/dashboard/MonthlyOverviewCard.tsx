"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, cn } from '@/lib/utils';
import { calculateTotalSales, calculateTotalExpenses, calculateProfitLossStatement } from '@/lib/calculations';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const MonthlyOverviewCard = () => {
  const { state } = useBusiness();
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const { totalSales, totalExpenses, netProfitLoss } = calculateProfitLossStatement(
    state.sales,
    state.expenses,
    thisMonthStart,
    thisMonthEnd
  );

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Monthly Overview</CardTitle>
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
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
        <p className="text-xs text-muted-foreground mt-1">
          ({format(thisMonthStart, 'MMM dd')} - {format(thisMonthEnd, 'MMM dd')})
        </p>
      </CardContent>
    </Card>
  );
};

export default MonthlyOverviewCard;