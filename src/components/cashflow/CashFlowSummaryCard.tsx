"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateCurrentCashBalance } from '@/lib/calculations';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const CashFlowSummaryCard = () => {
  const { state } = useBusiness();
  const currentCashBalance = calculateCurrentCashBalance(state.sales, state.expenses);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Current Cash Balance</CardTitle>
        <Landmark className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-4xl font-bold mb-2",
          currentCashBalance >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {formatNaira(currentCashBalance)}
        </div>
        <p className="text-sm text-muted-foreground">
          This reflects your total cash-in (Cash, Transfer, POS sales) minus total expenses.
        </p>
      </CardContent>
    </Card>
  );
};

export default CashFlowSummaryCard;