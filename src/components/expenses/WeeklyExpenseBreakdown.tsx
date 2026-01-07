"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira } from '@/lib/utils';
import { calculateExpensesByCategory, calculateWeeklyExpenses } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { ListFilter } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const WeeklyExpenseBreakdown = () => {
  const { state } = useBusiness();
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const totalWeeklyExpenses = calculateWeeklyExpenses(state.expenses);
  const expensesByCategory = calculateExpensesByCategory(state.expenses, thisWeekStart, thisWeekEnd);

  const chartData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
  }, [expensesByCategory]);

  const top3Categories = chartData.slice(0, 3);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Weekly Expense Breakdown</CardTitle>
        <ListFilter className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {formatNaira(totalWeeklyExpenses)}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total expenses for the last 7 days ({format(thisWeekStart, 'MMM dd')} - {format(thisWeekEnd, 'MMM dd')})
        </p>

        {chartData.length > 0 ? (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNaira(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-md font-semibold">Top 3 Categories:</h3>
              {top3Categories.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="font-medium" style={{ color: COLORS[index % COLORS.length] }}>{item.name}</span>
                  <span>{formatNaira(item.value)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">No expenses recorded this week.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyExpenseBreakdown;