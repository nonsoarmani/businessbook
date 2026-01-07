"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, exportToCSV } from '@/lib/utils';
import { calculateDaysToCollect } from '@/lib/calculations';
import { Archive, Download, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isThisMonth, isThisYear, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Debt } from '@/types';

type SortKey = keyof Debt | null;
type SortDirection = 'asc' | 'desc';

const PaidDebtsArchive = () => {
  const { state } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'thisMonth' | 'thisYear'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('datePaid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const paidDebts = useMemo(() => state.debts.filter(debt => debt.status === 'paid'), [state.debts]);

  const filteredPaidDebts = useMemo(() => {
    const now = new Date();
    let debtsToFilter = paidDebts;

    // Apply date filter
    debtsToFilter = debtsToFilter.filter(debt => {
      const paidDate = debt.datePaid ? new Date(debt.datePaid) : null;
      if (!paidDate) return false; // Only show debts with a paid date
      if (filter === 'thisMonth') return isThisMonth(paidDate);
      if (filter === 'thisYear') return isThisYear(paidDate);
      return true; // 'all'
    });

    // Apply search term filter
    if (searchTerm) {
      debtsToFilter = debtsToFilter.filter(debt =>
        debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.itemsSold.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortKey) {
      debtsToFilter.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return debtsToFilter;
  }, [paidDebts, searchTerm, filter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const totalCollectedThisMonth = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return paidDebts
      .filter(debt => debt.datePaid && debt.datePaid >= start && debt.datePaid <= end)
      .reduce((sum, debt) => sum + debt.originalAmount, 0);
  }, [paidDebts]);

  const averageCollectionTime = useMemo(() => {
    const collectedTimes = paidDebts
      .filter(debt => debt.datePaid && debt.dateGiven)
      .map(debt => calculateDaysToCollect(debt.dateGiven, debt.datePaid!));

    if (collectedTimes.length === 0) return 0;
    const totalDays = collectedTimes.reduce((sum, days) => sum + days, 0);
    return totalDays / collectedTimes.length;
  }, [paidDebts]);

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'Original Amount', 'Amount Owed', 'Date Given', 'Due Date', 'Items Sold', 'Status', 'Paid Amount', 'Date Paid', 'Days to Collect'];
    const dataToExport = filteredPaidDebts.map(debt => ({
      'Customer Name': debt.customerName,
      Phone: debt.phone,
      'Original Amount': debt.originalAmount,
      'Amount Owed': debt.amountOwed,
      'Date Given': formatDate(debt.dateGiven),
      'Due Date': formatDate(debt.dueDate),
      'Items Sold': debt.itemsSold,
      Status: debt.status,
      'Paid Amount': debt.paidAmount || 0,
      'Date Paid': debt.datePaid ? formatDate(debt.datePaid) : '',
      'Days to Collect': debt.datePaid && debt.dateGiven ? calculateDaysToCollect(debt.dateGiven, debt.datePaid) : 'N/A',
    }));
    exportToCSV('paid_debts_archive', dataToExport, headers);
    toast.success('Paid debts archive exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected This Month</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalCollectedThisMonth)}</div>
            <p className="text-xs text-muted-foreground">For the current month.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Collection Time</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCollectionTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">Average days to collect a debt.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Search by customer or item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Original Amount</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('datePaid')}>
                  Date Paid
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Days to Collect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPaidDebts.length > 0 ? (
              filteredPaidDebts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">{debt.customerName}</TableCell>
                  <TableCell>{formatNaira(debt.originalAmount)}</TableCell>
                  <TableCell>{formatNaira(debt.paidAmount || debt.originalAmount)}</TableCell>
                  <TableCell>{debt.datePaid ? formatDate(debt.datePaid) : 'N/A'}</TableCell>
                  <TableCell>
                    {debt.datePaid && debt.dateGiven
                      ? `${calculateDaysToCollect(debt.dateGiven, debt.datePaid)} days`
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No paid debts found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaidDebtsArchive;