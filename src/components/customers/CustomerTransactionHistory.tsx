"use client";

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, cn } from '@/lib/utils';
import { Customer, Sale, Debt } from '@/types';
import { isSameDay } from 'date-fns';

interface CustomerTransactionHistoryProps {
  customer: Customer;
}

type Transaction = (Sale & { type: 'sale' }) | (Debt & { type: 'debt' });

const CustomerTransactionHistory = ({ customer }: CustomerTransactionHistoryProps) => {
  const { state } = useBusiness();

  const customerTransactions = useMemo(() => {
    const salesForCustomer: Transaction[] = state.sales
      .filter(sale =>
        sale.customerName === customer.name &&
        (sale.customerPhone === customer.phone || (!customer.phone && !sale.customerPhone))
      )
      .map(sale => ({ ...sale, type: 'sale' }));

    const debtsForCustomer: Transaction[] = state.debts
      .filter(debt =>
        debt.customerName === customer.name && debt.phone === customer.phone
      )
      .map(debt => ({ ...debt, type: 'debt' }));

    return [...salesForCustomer, ...debtsForCustomer].sort((a, b) =>
      new Date(b.date || b.dateGiven).getTime() - new Date(a.date || a.dateGiven).getTime()
    );
  }, [state.sales, state.debts, customer]);

  return (
    <div className="space-y-4">
      {customerTransactions.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerTransactions.map((tx) => (
                <TableRow key={tx.id} className={cn(
                  tx.type === 'sale' ? 'bg-green-50/50 hover:bg-green-50' : 'bg-red-50/50 hover:bg-red-50'
                )}>
                  <TableCell className="font-medium">{formatDate(tx.type === 'sale' ? tx.date : tx.dateGiven)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      tx.type === 'sale' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    )}>
                      {tx.type === 'sale' ? 'Sale' : 'Debt'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {tx.type === 'sale' ? tx.item : tx.itemsSold}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    tx.type === 'sale' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatNaira(tx.type === 'sale' ? tx.amount : tx.amountOwed)}
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.type === 'sale' ? tx.paymentMethod : tx.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No transactions found for this customer.</p>
      )}
    </div>
  );
};

export default CustomerTransactionHistory;