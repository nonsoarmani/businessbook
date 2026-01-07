"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateTopSellingItems } from '@/lib/calculations';
import { Award } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const TopSellingItemsCard = () => {
  const { state } = useBusiness();
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const topSellingItems = useMemo(() => {
    return calculateTopSellingItems(state.sales, thisMonthStart, thisMonthEnd, 3); // Top 3 items
  }, [state.sales, thisMonthStart, thisMonthEnd]);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Top Selling Items (This Month)</CardTitle>
        <Award className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {topSellingItems.length > 0 ? (
          <ul className="space-y-2">
            {topSellingItems.map((item, index) => (
              <li key={item.item} className="flex justify-between items-center text-sm">
                <span className="font-medium">{index + 1}. {item.item}</span>
                <span>{formatNaira(item.totalAmount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">No sales recorded this month.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopSellingItemsCard;