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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DebtForm from './DebtForm';
import { Edit2, Trash2 } from 'lucide-react';

type SortKey = 'customerName' | 'originalAmount' | 'amountOwed' | 'dateGiven' | 'dueDate' | 'status';

const DebtDisplay = () => {
  const { state, markDebtPaid, deleteDebt } = useBusiness();
  const { debts } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Oldest due date first by default
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDeleteDebt = async (id: string) => {
    if (confirm('Are you sure you want to delete this debt?')) {
      await deleteDebt(id);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingDebt(null);
  };

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

  const handleMarkAsPaid = async (debtId: string) => {
    try {
      await markDebtPaid({
        id: debtId,
        datePaid: format(new Date(), 'yyyy-MM-dd'),
        paidAmount: debts.find(d => d.id === debtId)?.originalAmount || 0
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
                    <div className="flex justify-center gap-2">
                      {debt.status !== 'paid' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Mark this debt from {debt.customerName} as fully paid?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleMarkAsPaid(debt.id)}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingDebt(debt);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteDebt(debt.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No debts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Debt Management</CardTitle>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-destructive">Overdue</p>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-2xl font-bold text-destructive">{formatNaira(calculateTotalOutstandingDebts(overdueDebts))}</p>
                <p className="text-xs text-muted-foreground mt-1">{overdueDebts.length} customers</p>
              </CardContent>
            </Card>
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warning">Due Soon</p>
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{formatNaira(calculateTotalOutstandingDebts(debtsDueSoon))}</p>
                <p className="text-xs text-muted-foreground mt-1">{debtsDueSoon.length} customers</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">Active</p>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{formatNaira(calculateTotalOutstandingDebts(activeDebts))}</p>
                <p className="text-xs text-muted-foreground mt-1">{activeDebts.length} customers</p>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-success">Total Outstanding</p>
                  <FileText className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{formatNaira(totalOutstanding)}</p>
                <p className="text-xs text-muted-foreground mt-1">Overall balance</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, items or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {overdueDebts.length > 0 && renderDebtTable(overdueDebts, "Overdue Debts", AlertCircle, "text-destructive")}
          {debtsDueSoon.length > 0 && renderDebtTable(debtsDueSoon, "Due Soon", Clock, "text-warning")}
          {activeDebts.length > 0 && renderDebtTable(activeDebts, "Active Debts", Clock, "text-primary")}
          {paidDebts.length > 0 && renderDebtTable(paidDebts, "Paid History", CheckCircle, "text-success")}
          
          {filteredDebts.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No debts matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Debt</DialogTitle>
          </DialogHeader>
          {editingDebt && (
            <DebtForm 
              initialData={editingDebt} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtDisplay;