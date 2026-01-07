"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateOutstandingDebts } from '@/lib/calculations';
import { Scale, Users } from 'lucide-react';

const TotalOutstandingDebtsCard = () => {
  const { state } = useBusiness();
  const { totalAmount, numberOfPeople } = calculateOutstandingDebts(state.debts);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Total Outstanding Debts</CardTitle>
        <Scale className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary mb-2">
          {formatNaira(totalAmount)}
        </div>
        <p className="text-sm text-muted-foreground">
          From {numberOfPeople} unique customer{numberOfPeople !== 1 ? 's' : ''}.
        </p>
      </CardContent>
    </Card>
  );
};

export default TotalOutstandingDebtsCard;