"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wallet, AlertCircle } from 'lucide-react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateDailySummary } from '@/lib/calculations';

const ExpensesSummaryCard = () => {
  const { state } = useBusiness();
  const today = new Date();
  const { totalSales, totalExpenses, profitLoss } = calculateDailySummary(state.sales, state.expenses, today);

  const expensesExceedSales = totalExpenses > totalSales && totalSales > 0; // Only show if there are sales

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Today's Expenses</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary mb-4">
          {formatNaira(totalExpenses)}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Total expenses recorded for today.</p>

        {expensesExceedSales && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Warning!</AlertTitle>
            <AlertDescription className="text-red-700">
              Today's expenses ({formatNaira(totalExpenses)}) exceed today's sales ({formatNaira(totalSales)}).
              You spent {formatNaira(Math.abs(profitLoss))} more than you earned.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesSummaryCard;