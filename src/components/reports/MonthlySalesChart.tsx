"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { getMonthlySalesData } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNaira } from '@/lib/utils';
import { LineChart } from 'lucide-react';

const MonthlySalesChart = () => {
  const { state } = useBusiness();
  const salesData = useMemo(() => getMonthlySalesData(state.sales, 6), [state.sales]); // Last 6 months

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Monthly Sales Trend (Last 6 Months)</CardTitle>
        <LineChart className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {salesData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNaira(value)}
                />
                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => formatNaira(value)} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No sales data available for the last 6 months.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlySalesChart;