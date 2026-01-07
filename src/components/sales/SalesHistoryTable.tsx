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
import { ArrowUpDown, Download, Edit, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, exportToCSV } from '@/lib/utils';
import { Sale } from '@/types';
import { isSameDay, isThisWeek, isThisMonth, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import EditSaleDialog from './EditSaleDialog';
import DeleteSaleDialog from './DeleteSaleDialog'; // Import the new dialog

type SortKey = keyof Sale | null;
type SortDirection = 'asc' | 'desc';

const SalesHistoryTable = () => {
  const { state } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isEditSaleDialogOpen, setIsEditSaleDialogOpen] = useState(false);
  const [isDeleteSaleDialogOpen, setIsDeleteSaleDialogOpen] = useState(false); // State for delete dialog
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let salesToFilter = state.sales;

    // Apply date filter
    salesToFilter = salesToFilter.filter(sale => {
      const saleDate = new Date(sale.date);
      if (filter === 'today') return isSameDay(saleDate, now);
      if (filter === 'thisWeek') return isThisWeek(saleDate, { weekStartsOn: 1 });
      if (filter === 'thisMonth') return isThisMonth(saleDate);
      return true; // 'all'
    });

    // Apply search term filter
    if (searchTerm) {
      salesToFilter = salesToFilter.filter(sale =>
        sale.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortKey) {
      salesToFilter.sort((a, b) => {
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

    return salesToFilter;
  }, [state.sales, searchTerm, filter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to newest first for date, or asc for others
    }
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditSaleDialogOpen(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteSaleDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Item/Service', 'Amount', 'Payment Method', 'Customer Name', 'Customer Phone', 'Note'];
    const dataToExport = filteredSales.map(sale => ({
      Date: formatDate(sale.date),
      'Item/Service': sale.item,
      Amount: sale.amount,
      'Payment Method': sale.paymentMethod,
      'Customer Name': sale.customerName || '',
      'Customer Phone': sale.customerPhone || '',
      Note: sale.note || '',
    }));
    exportToCSV('sales_history', dataToExport, headers);
    toast.success('Sales history exported to CSV!');
  };

  const calculateWeekOverWeekChange = () => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekSales = state.sales
      .filter(sale => new Date(sale.date) >= thisWeekStart && new Date(sale.date) <= thisWeekEnd)
      .reduce((sum, sale) => sum + sale.amount, 0);

    const lastWeekSales = state.sales
      .filter(sale => new Date(sale.date) >= lastWeekStart && new Date(sale.date) <= lastWeekEnd)
      .reduce((sum, sale) => sum + sale.amount, 0);

    if (lastWeekSales === 0) {
      return thisWeekSales > 0 ? '+100%' : '0%';
    }

    const change = ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Search by item or customer name..."
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
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">Week-over-week Sales Change:</span>
        <span className={cn(
          "font-bold",
          calculateWeekOverWeekChange().startsWith('+') ? "text-green-600" : calculateWeekOverWeekChange().startsWith('-') ? "text-red-600" : "text-gray-600"
        )}>
          {calculateWeekOverWeekChange()}
        </span>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <Button variant="ghost" onClick={() => handleSort('date')}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Item/Service</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('amount')}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.item}</TableCell>
                  <TableCell>{formatNaira(sale.amount)}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>{sale.customerName || 'N/A'}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSale(sale)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSale(sale)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No sales found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedSale && (
        <>
          <EditSaleDialog
            sale={selectedSale}
            open={isEditSaleDialogOpen}
            onOpenChange={setIsEditSaleDialogOpen}
          />
          <DeleteSaleDialog
            sale={selectedSale}
            open={isDeleteSaleDialogOpen}
            onOpenChange={setIsDeleteSaleDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default SalesHistoryTable;