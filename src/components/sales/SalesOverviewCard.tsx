"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateSalesBreakdown, calculateTotalSales } from '@/lib/calculations';
import { HandCoins } from 'lucide-react';
import { Sale } from '@/types';

interface SalesOverviewCardProps {
  filter: 'all' | 'today' | 'thisWeek' | 'thisMonth';
}

const SalesOverviewCard = ({ filter }: SalesOverviewCardProps) => {
  const { state } = useBusiness();

  const filteredSales = useMemo(() => {
    return state.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const now = new Date();

      if (filter === 'today') {
        return saleDate.getDate() === now.getDate() &&
               saleDate.getMonth() === now.getMonth() &&
               saleDate.getFullYear() === now.getFullYear();
      }
      // The calculateTotalSales and calculateSalesBreakdown functions already handle 'thisWeek' and 'thisMonth'
      // based on the dateRange parameter. We can pass the filter directly.
      return true; // 'all' filter will be handled by the calculation functions
    });
  }, [state.sales, filter]);

  const totalSales = calculateTotalSales(filteredSales, filter);
  const breakdown = calculateSalesBreakdown(filteredSales, filter);

  const getTitle = () => {
    switch (filter) {
      case 'today': return "Today's Sales Overview";
      case 'thisWeek': return "This Week's Sales Overview";
      case 'thisMonth': return "This Month's Sales Overview";
      case 'all': return "All Sales Overview";
      default: return "Sales Overview";
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{getTitle()}</CardTitle>
        <HandCoins className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary mb-4">
          {formatNaira(totalSales)}
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

export default SalesOverviewCard;