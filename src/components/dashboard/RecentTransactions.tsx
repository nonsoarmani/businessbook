"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, cn } from '@/lib/utils';
import { Sale, Expense } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Transaction = (Sale & { type: 'sale' }) | (Expense & { type: 'expense' });

const RecentTransactions = () => {
  const { state } = useBusiness();

  const allTransactions = useMemo(() => {
    const salesTransactions: Transaction[] = state.sales
      .filter(sale => sale.paymentMethod !== 'Credit') // Only include cash-in sales
      .map(sale => ({ ...sale, type: 'sale' }));
    const expenseTransactions: Transaction[] = state.expenses.map(expense => ({ ...expense, type: 'expense' }));
    return [...salesTransactions, ...expenseTransactions];
  }, [state.sales, state.expenses]);

  const sortedRecentTransactions = useMemo(() => {
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show top 5 recent transactions
  }, [allTransactions]);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Link to="/cash-flow" className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {sortedRecentTransactions.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecentTransactions.map((tx) => (
                  <TableRow key={tx.id} className={cn(
                    tx.type === 'sale' ? 'bg-green-50/50 hover:bg-green-50' : 'bg-red-50/50 hover:bg-red-50'
                  )}>
                    <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        tx.type === 'sale' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      )}>
                        {tx.type === 'sale' ? 'Sale' : 'Exp.'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{tx.type === 'sale' ? tx.item : tx.name}</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      tx.type === 'sale' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.type === 'sale' ? '+' : '-'}{formatNaira(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent transactions. Start recording sales or expenses!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;