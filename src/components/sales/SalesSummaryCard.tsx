"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateSalesBreakdown, calculateTotalSales } from '@/lib/calculations';
import { HandCoins } from 'lucide-react';

const SalesSummaryCard = () => {
  const { state } = useBusiness();
  const todaySales = state.sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.getDate() === today.getDate() &&
           saleDate.getMonth() === today.getMonth() &&
           saleDate.getFullYear() === today.getFullYear();
  });

  const totalTodaySales = calculateTotalSales(todaySales);
  const breakdown = calculateSalesBreakdown(todaySales);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Today's Sales Summary</CardTitle>
        <HandCoins className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary mb-4">
          {formatNaira(totalTodaySales)}
        </div>
        <p className="text-sm text-muted-foreground mb-2">Breakdown by payment type:</p>
        <div className="space-y-2">
          {Object.entries(breakdown).map(([method, amount]) => (
            <React.Fragment key={method}>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{method}:</span>
                <span>{formatNaira(amount)}</span>
              </div>
              <Separator className="my-2 bg-border" />
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryCard;