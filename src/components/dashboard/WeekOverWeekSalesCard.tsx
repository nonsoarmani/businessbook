"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, cn } from '@/lib/utils';
import { calculateTotalSales, calculateWeekOverWeekSalesChange } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Equal } from 'lucide-react';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const WeekOverWeekSalesCard = () => {
  const { state } = useBusiness();
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const totalThisWeekSales = calculateTotalSales(state.sales, 'all', thisWeekStart, thisWeekEnd);
  const weekOverWeekChange = calculateWeekOverWeekSalesChange(state.sales);

  const changeIcon = weekOverWeekChange > 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> :
                     weekOverWeekChange < 0 ? <TrendingDown className="h-5 w-5 text-red-600" /> :
                     <Equal className="h-5 w-5 text-gray-500" />;

  const changeTextColor = weekOverWeekChange > 0 ? "text-green-600" :
                          weekOverWeekChange < 0 ? "text-red-600" :
                          "text-gray-500";

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Week-over-Week Sales</CardTitle>
        {changeIcon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {formatNaira(totalThisWeekSales)}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", changeTextColor)}>
            {weekOverWeekChange.toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">
            vs. previous week
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ({format(thisWeekStart, 'MMM dd')} - {format(thisWeekEnd, 'MMM dd')})
        </p>
      </CardContent>
    </Card>
  );
};

export default WeekOverWeekSalesCard;