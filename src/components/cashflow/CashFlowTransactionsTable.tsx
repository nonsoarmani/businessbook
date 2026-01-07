"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowUpDown, Download, CalendarIcon } from 'lucide-react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, exportToCSV, cn } from '@/lib/utils';
import { Sale, Expense } from '@/types';
import { isWithinInterval, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

type Transaction = (Sale & { type: 'sale' }) | (Expense & { type: 'expense' });
type SortKey = keyof Transaction | null;
type SortDirection = 'asc' | 'desc';

const CashFlowTransactionsTable = () => {
  const { state } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const allTransactions = useMemo(() => {
    const salesTransactions: Transaction[] = state.sales
      .filter(sale => sale.paymentMethod !== 'Credit') // Only include cash-in sales
      .map(sale => ({ ...sale, type: 'sale' }));
    const expenseTransactions: Transaction[] = state.expenses.map(expense => ({ ...expense, type: 'expense' }));
    return [...salesTransactions, ...expenseTransactions];
  }, [state.sales, state.expenses]);

  const filteredTransactions = useMemo(() => {
    let transactionsToFilter = allTransactions;

    // Apply type filter
    if (typeFilter !== 'all') {
      transactionsToFilter = transactionsToFilter.filter(tx => tx.type === typeFilter);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      transactionsToFilter = transactionsToFilter.filter(tx =>
        isWithinInterval(tx.date, { start: dateRange.from!, end: dateRange.to! })
      );
    }

    // Apply search term filter
    if (searchTerm) {
      transactionsToFilter = transactionsToFilter.filter(tx =>
        (tx.type === 'sale' && (tx.item.toLowerCase().includes(searchTerm.toLowerCase()) || tx.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (tx.type === 'expense' && (tx.name.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply sorting
    if (sortKey) {
      transactionsToFilter.sort((a, b) => {
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

    return transactionsToFilter;
  }, [allTransactions, searchTerm, typeFilter, dateRange, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Category/Method', 'Amount'];
    const dataToExport = filteredTransactions.map(tx => ({
      Date: formatDate(tx.date),
      Type: tx.type === 'sale' ? 'Sale' : 'Expense',
      Description: tx.type === 'sale' ? tx.item : tx.name,
      'Category/Method': tx.type === 'sale' ? tx.paymentMethod : tx.category,
      Amount: tx.amount,
    }));
    exportToCSV('cash_flow_transactions', dataToExport, headers);
    toast.success('Cash flow transactions exported to CSV!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Search by description or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(value: typeof typeFilter) => setTypeFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <Button variant="ghost" onClick={() => handleSort('date')}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category/Method</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('amount')}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className={cn(
                  tx.type === 'sale' ? 'bg-green-50/50 hover:bg-green-50' : 'bg-red-50/50 hover:bg-red-50'
                )}>
                  <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      tx.type === 'sale' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    )}>
                      {tx.type === 'sale' ? 'Sale' : 'Expense'}
                    </span>
                  </TableCell>
                  <TableCell>{tx.type === 'sale' ? tx.item : tx.name}</TableCell>
                  <TableCell>{tx.type === 'sale' ? tx.paymentMethod : tx.category}</TableCell>
                  <TableCell className={cn(
                    tx.type === 'sale' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'sale' ? '+' : '-'}{formatNaira(tx.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No transactions found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CashFlowTransactionsTable;