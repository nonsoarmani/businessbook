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
import { ArrowUpDown, Download, CalendarIcon, Eye, Trash2, Edit } from 'lucide-react'; // Import Edit icon
import { useBusiness } from '@/state/businessStore';
import { formatNaira, formatDate, exportToCSV, cn } from '@/lib/utils';
import { Receipt } from '@/types';
import { isWithinInterval, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReceiptCard from './ReceiptCard';
import DeleteReceiptDialog from './DeleteReceiptDialog';
import EditReceiptDialog from './EditReceiptDialog'; // Import the new dialog

type SortKey = keyof Receipt | null;
type SortDirection = 'asc' | 'desc';

const ReceiptListTable = () => {
  const { state } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | Receipt['paymentMethod']>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isViewReceiptDialogOpen, setIsViewReceiptDialogOpen] = useState(false);
  const [isDeleteReceiptDialogOpen, setIsDeleteReceiptDialogOpen] = useState(false);
  const [isEditReceiptDialogOpen, setIsEditReceiptDialogOpen] = useState(false); // State for edit dialog
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = useMemo(() => {
    let receiptsToFilter = state.receipts;

    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      receiptsToFilter = receiptsToFilter.filter(receipt => receipt.paymentMethod === paymentMethodFilter);
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      receiptsToFilter = receiptsToFilter.filter(receipt =>
        isWithinInterval(receipt.date, { start: dateRange.from!, end: dateRange.to! })
      );
    }

    // Apply search term filter
    if (searchTerm) {
      receiptsToFilter = receiptsToFilter.filter(receipt =>
        receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortKey) {
      receiptsToFilter.sort((a, b) => {
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

    return receiptsToFilter;
  }, [state.receipts, searchTerm, paymentMethodFilter, dateRange, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt Number', 'Date', 'Customer Name', 'Customer Phone', 'Items', 'Amount', 'Payment Method', 'Linked Sale ID'];
    const dataToExport = filteredReceipts.map(receipt => ({
      'Receipt Number': receipt.receiptNumber,
      Date: formatDate(receipt.date),
      'Customer Name': receipt.customerName,
      'Customer Phone': receipt.customerPhone || '',
      Items: receipt.items,
      Amount: receipt.amount,
      'Payment Method': receipt.paymentMethod,
      'Linked Sale ID': receipt.linkedSaleId || '',
    }));
    exportToCSV('receipts_list', dataToExport, headers);
    toast.success('Receipts list exported to CSV!');
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsViewReceiptDialogOpen(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsEditReceiptDialogOpen(true);
  };

  const handleDeleteReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDeleteReceiptDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Search by customer, item, or receipt no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={paymentMethodFilter} onValueChange={(value: typeof paymentMethodFilter) => setPaymentMethodFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="POS">POS</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
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
                defaultMonth={dateRange.from}
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
              <TableHead className="w-[150px]">
                <Button variant="ghost" onClick={() => handleSort('receiptNumber')}>
                  Receipt No.
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button variant="ghost" onClick={() => handleSort('date')}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('amount')}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                  <TableCell>{formatDate(receipt.date)}</TableCell>
                  <TableCell>{receipt.customerName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{receipt.items}</TableCell>
                  <TableCell>{formatNaira(receipt.amount)}</TableCell>
                  <TableCell>{receipt.paymentMethod}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(receipt)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditReceipt(receipt)}> {/* New Edit button */}
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReceipt(receipt)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No receipts found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewReceiptDialogOpen} onOpenChange={setIsViewReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>View Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && <ReceiptCard receipt={selectedReceipt} />}
        </DialogContent>
      </Dialog>

      {selectedReceipt && (
        <>
          <EditReceiptDialog
            receipt={selectedReceipt}
            open={isEditReceiptDialogOpen}
            onOpenChange={setIsEditReceiptDialogOpen}
          />
          <DeleteReceiptDialog
            receipt={selectedReceipt}
            open={isDeleteReceiptDialogOpen}
            onOpenChange={setIsDeleteReceiptDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default ReceiptListTable;