"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Search, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira, exportToCSV, ColumnHeader } from '@/lib/utils';
import { updateDebtStatus, calculateTotalOutstandingDebts, getOverdueDebts, getDebtsDueSoon, } from '@/utils/debtCalculations';
import { Debt } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';

type SortKey = 'customerName' | 'originalAmount' | 'amountOwed' | 'dateGiven' | 'dueDate' | 'status';

const DebtDisplay = () => {
  const { state, dispatch } = useBusiness();
  const { debts } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Oldest due date first by default

  // Update debt statuses whenever debts change
  useEffect(() => {
    const updatedDebts = debts.map(debt => updateDebtStatus(debt));
    // Only dispatch if there are actual status changes to avoid infinite loops
    if (JSON.stringify(updatedDebts) !== JSON.stringify(debts)) {
      // This is a simplified approach. In a real app, you might dispatch individual UPDATE_DEBT actions
      // or have a specific action for bulk status updates. For now, we'll assume the reducer handles it.
      // Since we don't have a bulk update, we'll rely on the next render to show the updated status.
      // The `updateDebtStatus` function is primarily for display logic here.
    }
  }, [debts]);

  const processedDebts = useMemo(() => {
    return debts.map(debt => updateDebtStatus(debt));
  }, [debts]);

  const totalOutstanding = useMemo(() => calculateTotalOutstandingDebts(processedDebts), [processedDebts]);
  const overdueDebts = useMemo(() => getOverdueDebts(processedDebts), [processedDebts]);
  const debtsDueSoon = useMemo(() => getDebtsDueSoon(processedDebts), [processedDebts]);
  const activeDebts = useMemo(() => processedDebts.filter(debt => debt.status === 'active'), [processedDebts]);
  const paidDebts = useMemo(() => processedDebts.filter(debt => debt.status === 'paid'), [processedDebts]);

  const filteredDebts = useMemo(() => {
    let currentDebts = processedDebts;
    if (searchTerm) {
      currentDebts = currentDebts.filter(debt =>
        debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.itemsSold.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.phone.includes(searchTerm)
      );
    }
    // Sort debts
    currentDebts.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortKey === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortKey === 'originalAmount') {
        comparison = a.originalAmount - b.originalAmount;
      } else if (sortKey === 'amountOwed') {
        comparison = a.amountOwed - b.amountOwed;
      } else if (sortKey === 'dateGiven') {
        comparison = new Date(a.dateGiven).getTime() - new Date(b.dateGiven).getTime();
      } else if (sortKey === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return currentDebts;
  }, [processedDebts, searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc'); // Default to ascending for new sort key (e.g., oldest due date first)
    }
  };

  const handleMarkAsPaid = (debtId: string) => {
    try {
      dispatch({
        type: 'MARK_DEBT_PAID',
        payload: {
          id: debtId,
          datePaid: format(new Date(), 'yyyy-MM-dd'),
          paidAmount: debts.find(d => d.id === debtId)?.originalAmount || 0
        },
      });
      showSuccess('Debt marked as paid!');
    } catch (error) {
      console.error('Failed to mark debt as paid:', error);
      showError('Failed to mark debt as paid. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const headers: ColumnHeader<Debt>[] = [
      { key: 'customerName', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'itemsSold', label: 'Items Sold' },
      { key: 'originalAmount', label: 'Original Amount (₦)' },
      { key: 'amountOwed', label: 'Amount Owed (₦)' },
      { key: 'dateGiven', label: 'Date Given' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'status', label: 'Status' },
      { key: 'paidAmount', label: 'Paid Amount (₦)' },
      { key: 'datePaid', label: 'Date Paid' },
    ];
    exportToCSV('debt_history', processedDebts, headers);
  };

  const renderDebtTable = (debtsToRender: Debt[], title: string, icon: React.ElementType, statusColor: string) => (
    <div className="mb-8">
      <h3 className={cn("text-xl font-semibold mb-4 flex items-center", statusColor)}>
        {React.createElement(icon, { className: "mr-2 h-5 w-5" })}
        {title} ({formatNaira(calculateTotalOutstandingDebts(debtsToRender))})
      </h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('customerName')}>
                Customer
                {sortKey === 'customerName' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('originalAmount')}>
                Original Amt
                {sortKey === 'originalAmount' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amountOwed')}>
                Amt Owed
                {sortKey === 'amountOwed' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dateGiven')}>
                Given
                {sortKey === 'dateGiven' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                Due
                {sortKey === 'dueDate' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtsToRender.length > 0 ? (
              debtsToRender.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.customerName}</TableCell>
                  <TableCell>{debt.phone}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{debt.itemsSold}</TableCell>
                  <TableCell className="text-right">{formatNaira(debt.originalAmount)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatNaira(debt.amountOwed)}</TableCell>
                  <TableCell>{format(parseISO(debt.dateGiven), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className={cn(
                    debt.status === 'overdue' && 'text-destructive font-medium',
                    debt.status === 'dueSoon' && 'text-warning font-medium'
                  )}>
                    {format(parseISO(debt.dueDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-center">
                    {debt.status !== 'paid' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will mark this debt as fully paid. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleMarkAsPaid(debt.id)}>
                              Confirm Payment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {debt.status === 'paid' && (
                      <span className="text-success text-sm font-medium flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Paid
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No {title.toLowerCase()} debts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Overall Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Overall Debt Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-semibold">Total Outstanding Debts:</p>
            <p className="text-3xl font-bold text-warning">{formatNaira(totalOutstanding)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Debt History and Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Debt History & Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, phone, or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          {renderDebtTable(overdueDebts, 'Overdue Debts', XCircle, 'text-destructive')}
          {renderDebtTable(debtsDueSoon, 'Debts Due Soon', Clock, 'text-warning')}
          {renderDebtTable(activeDebts, 'Active Debts', AlertCircle, 'text-primary')}
          {renderDebtTable(paidDebts, 'Paid Debts', CheckCircle, 'text-success')}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtDisplay;