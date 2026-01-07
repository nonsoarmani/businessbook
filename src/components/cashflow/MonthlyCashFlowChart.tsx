"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { getMonthlyCashFlowData } from '@/lib/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNaira } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MonthlyCashFlowChart = () => {
  const { state } = useBusiness();
  const cashFlowData = useMemo(() => getMonthlyCashFlowData(state.sales, state.expenses, 6), [state.sales, state.expenses]); // Last 6 months

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Monthly Cash Flow Trend</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>
      </CardHeader>
      <CardContent>
        {cashFlowData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cashFlowData}
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
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#82ca9d" name="Sales (Cash/Transfer/POS)" />
                <Line type="monotone" dataKey="expenses" stroke="#ff7300" name="Expenses" />
                <Line type="monotone" dataKey="netFlow" stroke="#8884d8" name="Net Cash Flow" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No cash flow data available for the last 6 months.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyCashFlowChart;