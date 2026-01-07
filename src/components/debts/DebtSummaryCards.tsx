"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateOutstandingDebts } from '@/lib/calculations';
import { Scale, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DebtSummaryCards = () => {
  const { state } = useBusiness();
  const { totalAmount, numberOfPeople, overdueAmount } = calculateOutstandingDebts(state.debts);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Total Outstanding Debts</CardTitle>
          <Scale className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            {formatNaira(totalAmount)}
          </div>
          <p className="text-sm text-muted-foreground">Across all active debts.</p>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">People Owing</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{numberOfPeople}</div>
          <p className="text-xs text-muted-foreground">Unique customers with active debts.</p>
        </CardContent>
      </Card>

      <Card className={cn(
        "bg-card text-card-foreground shadow-sm",
        overdueAmount > 0 ? "border-red-500 ring-2 ring-red-500" : ""
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Overdue Amount</CardTitle>
          <AlertCircle className={cn("h-4 w-4", overdueAmount > 0 ? "text-red-600" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", overdueAmount > 0 ? "text-red-600" : "text-primary")}>
            {formatNaira(overdueAmount)}
          </div>
          <p className="text-xs text-muted-foreground">Amount from debts past their due date.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtSummaryCards;