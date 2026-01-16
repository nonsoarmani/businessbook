"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format } from 'date-fns';
import { ArrowUpDown, Search, FileText } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira, exportToCSV } from '@/lib/utils';
import {
  filterSalesByPeriod,
  calculateTotalSales,
  calculatePaymentMethodBreakdown,
  calculateWeekOverWeekComparison,
  getSalesForDay
} from '@/utils/salesCalculations';
import { Sale } from '@/types';

type FilterPeriod = 'All' | 'Today' | 'This Week' | 'This Month';
type SortKey = 'date' | 'item' | 'amount' | 'paymentMethod';

const SalesDisplay = () => {
  const { state } = useBusiness();
  const { sales } = state;

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Newest first by default

  const filteredSales = useMemo(() => {
    let currentSales = filterSalesByPeriod(sales, filterPeriod);

    if (searchTerm) {
      currentSales = currentSales.filter(sale =>
        sale.item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort sales
    currentSales.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortKey === 'item') {
        comparison = a.item.localeCompare(b.item);
      } else if (sortKey === 'paymentMethod') {
        comparison = a.paymentMethod.localeCompare(b.paymentMethod);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return currentSales;
  }, [sales, filterPeriod, searchTerm, sortKey, sortOrder]);

  const todaySales = useMemo(() => getSalesForDay(sales, new Date()), [sales]);
  const totalTodaySales = calculateTotalSales(todaySales);
  const todayPaymentBreakdown = calculatePaymentMethodBreakdown(todaySales);

  const { currentWeekSales, lastWeekSales, percentageChange } = useMemo(() => calculateWeekOverWeekComparison(sales), [sales]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to newest/highest first for new sort key
    }
  };

  const handleExportCSV = () => {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'item', label: 'Item' },
      { key: 'amount', label: 'Amount (₦)' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'customerPhone', label: 'Customer Phone' },
      { key: 'note', label: 'Note' },
    ];
    exportToCSV('sales_history', sales, headers);
  };

  return (
    <div className="space-y-8">
      {/* Today's Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Today's Sales Summary ({format(new Date(), 'PPP')})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-semibold">Total Sales:</p>
            <p className="text-3xl font-bold text-primary">{formatNaira(totalTodaySales)}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(todayPaymentBreakdown).map(([method, amount]) => (
              <React.Fragment key={method}>
                <p className="font-medium">{method}:</p>
                <p className="text-right">{formatNaira(amount)}</p>
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Today', 'This Week', 'This Month'] as FilterPeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={filterPeriod === period ? 'default' : 'outline'}
                  onClick={() => setFilterPeriod(period)}
                  className="min-w-[100px]"
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
          </div>

          <div className="mb-6 p-4 border rounded-lg bg-muted/40">
            <h3 className="text-lg font-semibold mb-2">Week-over-Week Sales Comparison</h3>
            <p className="text-sm text-muted-foreground">
              Current Week: <span className="font-medium text-foreground">{formatNaira(currentWeekSales)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Last Week: <span className="font-medium text-foreground">{formatNaira(lastWeekSales)}</span>
            </p>
            {percentageChange !== null && (
              <p className={cn(
                "text-sm font-semibold mt-1",
                percentageChange >= 0 ? "text-success" : "text-destructive"
              )}>
                {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(2)}% vs Last Week
              </p>
            )}
            {percentageChange === null && lastWeekSales === 0 && currentWeekSales > 0 && (
              <p className="text-sm font-semibold mt-1 text-success">
                ↑ 100% vs Last Week (No sales last week)
              </p>
            )}
            {percentageChange === null && lastWeekSales === 0 && currentWeekSales === 0 && (
              <p className="text-sm font-semibold mt-1 text-muted-foreground">
                No sales recorded for last two weeks.
              </p>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    Date {sortKey === 'date' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('item')}>
                    Item {sortKey === 'item' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                    Amount {sortKey === 'amount' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('paymentMethod')}>
                    Payment Method {sortKey === 'paymentMethod' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{format(parseISO(sale.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{sale.item}</TableCell>
                      <TableCell className="text-right">{formatNaira(sale.amount)}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No sales found for the selected period or search term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDisplay;