"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira } from '@/lib/utils';
import {
  calculateTotalOutstandingDebts,
  getOverdueDebts,
  getDebtsDueSoon,
  updateDebtStatus,
} from '@/utils/debtCalculations';
import { Debt } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const DebtReport = () => {
  const { state } = useBusiness();
  const { debts } = state;

  const processedDebts = useMemo(() => {
    return debts.map(debt => updateDebtStatus(debt));
  }, [debts]);

  const totalOutstanding = useMemo(() => calculateTotalOutstandingDebts(processedDebts), [processedDebts]);
  const overdueDebts = useMemo(() => getOverdueDebts(processedDebts), [processedDebts]);
  const debtsDueSoon = useMemo(() => getDebtsDueSoon(processedDebts), [processedDebts]);
  const activeDebts = useMemo(() => processedDebts.filter(debt => debt.status === 'active'), [processedDebts]);
  const paidDebts = useMemo(() => processedDebts.filter(debt => debt.status === 'paid'), [processedDebts]);

  const renderDebtSection = (title: string, debtsList: Debt[], icon: React.ElementType, colorClass: string) => (
    <div className="mb-6">
      <h3 className={cn("text-lg font-semibold mb-3 flex items-center", colorClass)}>
        {React.createElement(icon, { className: "mr-2 h-5 w-5" })} {title} ({formatNaira(calculateTotalOutstandingDebts(debtsList))})
      </h3>
      {debtsList.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount Owed</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtsList.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.customerName}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{debt.itemsSold}</TableCell>
                  <TableCell className="text-right font-medium">{formatNaira(debt.amountOwed)}</TableCell>
                  <TableCell>{format(parseISO(debt.dueDate), 'dd/MM/yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No {title.toLowerCase()} debts.</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Debt Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Outstanding</h3>
            <p className="text-3xl font-bold text-warning">{formatNaira(totalOutstanding)}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Overdue Debts</h3>
            <p className="text-3xl font-bold text-destructive">{formatNaira(calculateTotalOutstandingDebts(overdueDebts))}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Debts Due Soon</h3>
            <p className="text-3xl font-bold text-primary">{formatNaira(calculateTotalOutstandingDebts(debtsDueSoon))}</p>
          </div>
        </div>

        <Separator />

        {renderDebtSection('Overdue Debts', overdueDebts, XCircle, 'text-destructive')}
        {renderDebtSection('Debts Due Soon', debtsDueSoon, Clock, 'text-warning')}
        {renderDebtSection('Active Debts', activeDebts, AlertCircle, 'text-primary')}
        {renderDebtSection('Paid Debts', paidDebts, CheckCircle, 'text-success')}
      </CardContent>
    </Card>
  );
};

export default DebtReport;