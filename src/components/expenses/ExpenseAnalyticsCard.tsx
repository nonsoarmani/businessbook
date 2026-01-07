"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateWeekOverWeekExpensesChange, calculatePersonalUsePercentage } from '@/lib/calculations';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

const ExpenseAnalyticsCard = () => {
  const { state } = useBusiness();
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const { change: weekOverWeekTotalChange, categoryChanges } = useMemo(
    () => calculateWeekOverWeekExpensesChange(state.expenses),
    [state.expenses]
  );

  const personalUsePercentage = useMemo(
    () => calculatePersonalUsePercentage(state.sales, state.expenses, thisWeekStart, thisWeekEnd),
    [state.sales, state.expenses, thisWeekStart, thisWeekEnd]
  );

  const significantCategoryIncreases = Object.entries(categoryChanges).filter(
    ([category, change]) => change > 50
  );

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Expense Analytics</CardTitle>
        <Info className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week-over-week comparison */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">Week-over-week Total Expenses:</span>
          <span className={cn(
            "font-bold flex items-center gap-1",
            weekOverWeekTotalChange >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {weekOverWeekTotalChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {weekOverWeekTotalChange.toFixed(2)}%
          </span>
        </div>

        {/* Warnings */}
        {significantCategoryIncreases.length > 0 && (
          <Alert variant="warning" className="bg-orange-50 text-orange-800 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Expense Alert!</AlertTitle>
            <AlertDescription className="text-orange-700">
              The following categories increased by more than 50% this week:
              <ul className="list-disc list-inside mt-1">
                {significantCategoryIncreases.map(([category, change]) => (
                  <li key={category}>{category}: <span className="font-semibold">+{change.toFixed(2)}%</span></li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {personalUsePercentage > 20 && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">High Personal Use!</AlertTitle>
            <AlertDescription className="text-red-700">
              "Personal Use" expenses ({personalUsePercentage.toFixed(2)}% of sales) exceeded 20% of your total sales this week.
              Consider reviewing personal spending.
            </AlertDescription>
          </Alert>
        )}

        {significantCategoryIncreases.length === 0 && personalUsePercentage <= 20 && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Info className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Good News!</AlertTitle>
            <AlertDescription className="text-green-700">
              No significant expense warnings this week. Keep up the good work!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseAnalyticsCard;