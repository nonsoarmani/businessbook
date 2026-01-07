"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import {
  calculateTopCustomersBySales,
  calculateTopCustomersByOutstandingDebt,
  calculateAverageDebtCollectionTime,
} from '@/lib/calculations';
import { BarChart, TrendingUp, Users } from 'lucide-react';

const CustomerAnalyticsCard = () => {
  const { state } = useBusiness();

  const topCustomersBySales = useMemo(() => calculateTopCustomersBySales(state.sales), [state.sales]);
  const topCustomersByDebt = useMemo(() => calculateTopCustomersByOutstandingDebt(state.debts), [state.debts]);
  const averageCollectionTime = useMemo(() => calculateAverageDebtCollectionTime(state.debts), [state.debts]);

  return (
    <Card className="bg-card text-card-foreground shadow-sm lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Customer Analytics</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" /> Top Spending Customers
          </h3>
          {topCustomersBySales.length > 0 ? (
            <ul>
              {topCustomersBySales.map((customer, index) => (
                <li key={index} className="flex justify-between items-center py-1 text-sm">
                  <span>{customer.name} ({customer.phone})</span>
                  <span>{formatNaira(customer.totalSales)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No sales data yet.</p>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
            <BarChart className="h-4 w-4 text-orange-600" /> Customers with Highest Debt
          </h3>
          {topCustomersByDebt.length > 0 ? (
            <ul>
              {topCustomersByDebt.map((customer, index) => (
                <li key={index} className="flex justify-between items-center py-1 text-sm">
                  <span>{customer.name} ({customer.phone})</span>
                  <span>{formatNaira(customer.totalDebt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No active debts yet.</p>
          )}
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-center py-2">
          <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Average Debt Collection Time
          </h3>
          <p className="text-2xl font-bold text-blue-600">{averageCollectionTime.toFixed(0)} days</p>
          <p className="text-muted-foreground text-sm">for paid debts</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAnalyticsCard;