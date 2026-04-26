"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Search, FileText, AlertCircle, CalendarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira, exportToCSV, ColumnHeader } from '@/lib/utils';
import { filterExpensesByPeriod, calculateTotalExpenses, getExpensesForDay, groupExpensesByCategory, calculateWeekOverWeekExpenseComparison, calculateTotalSales, getTotalExpensesLast7Days, checkPersonalUseWarning, checkCategoryIncreaseWarning } from '@/utils/expenseCalculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Expense } from '@/types';
import type { DateRange } from "react-day-picker";

type FilterPeriod = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';
type SortKey = 'date' | 'name' | 'amount' | 'category';

const expenseCategories = [
  'All',
  'Stock/Inventory',
  'Transport',
  'Food/Lunch',
  'Airtime/Data',
  'Rent/Shop',
  'Staff Payment',
  'Personal Use',
  'Other',
] as const;

const ExpenseDisplay = () => {
  const { state } = useBusiness();
  const { expenses, sales } = state;
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('All');
  const [selectedCategory, setSelectedCategory] = useState<typeof expenseCategories[number]>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Newest first by default
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const todaySales = useMemo(() => {
    const today = new Date();
    return sales.filter(sale => format(parseISO(sale.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
  }, [sales]);

  const totalTodaySales = calculateTotalSales(todaySales);

  const filteredExpenses = useMemo(() => {
    let currentExpenses = [...expenses];
    
    // Apply date filtering
    if (filterPeriod !== 'All') {
      if (filterPeriod === 'Custom' && dateRange?.from && dateRange?.to) {
        currentExpenses = filterExpensesByPeriod(expenses, 'All', dateRange.from, dateRange.to);
      } else if (filterPeriod !== 'Custom') {
        currentExpenses = filterExpensesByPeriod(expenses, filterPeriod);
      }
    }
    
    if (selectedCategory !== 'All') {
      currentExpenses = currentExpenses.filter(expense => expense.category === selectedCategory);
    }
    
    if (searchTerm) {
      currentExpenses = currentExpenses.filter(expense =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort expenses
    currentExpenses.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortKey === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return currentExpenses;
  }, [expenses, filterPeriod, selectedCategory, searchTerm, sortKey, sortOrder, dateRange]);

  const todayExpenses = useMemo(() => getExpensesForDay(expenses, new Date()), [expenses]);
  const totalTodayExpenses = calculateTotalExpenses(todayExpenses);
  const todayExpensesExceedSales = totalTodayExpenses > totalTodaySales && totalTodaySales > 0;

  const { currentWeekExpenses, lastWeekExpenses, percentageChange } = useMemo(
    () => calculateWeekOverWeekExpenseComparison(expenses),
    [expenses]
  );

  const totalExpensesLast7Days = useMemo(() => getTotalExpensesLast7Days(expenses), [expenses]);
  const weeklyCategoryBreakdown = useMemo(() => groupExpensesByCategory(filterExpensesByPeriod(expenses, 'This Week')), [expenses]);
  const top3ExpenseCategories = weeklyCategoryBreakdown.slice(0, 3);

  const personalUseWarning = useMemo(() => checkPersonalUseWarning(expenses, sales), [expenses, sales]);
  const categoryIncreaseWarnings = useMemo(() => checkCategoryIncreaseWarning(expenses), [expenses]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to newest/highest first for new sort key
    }
  };

  const handleExportCSV = () => {
    const headers: ColumnHeader<Expense>[] = [
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Expense Name' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount (₦)' },
    ];
    exportToCSV('expense_history', expenses, headers);
  };

  return (
    <div className="space-y-8">
      {/* Today's Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl font-bold">Today's Expenses Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-base md:text-lg font-semibold">Total Expenses:</p>
            <p className="text-2xl md:text-3xl font-bold text-destructive">{formatNaira(totalTodayExpenses)}</p>
          </div>
          {todayExpensesExceedSales && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Today's expenses exceed today's sales.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expense History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl font-bold">Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select onValueChange={(value: typeof expenseCategories[number]) => setSelectedCategory(value)} defaultValue={selectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(['All', 'Today', 'This Week', 'This Month'] as FilterPeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={filterPeriod === period ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterPeriod(period);
                    setDateRange(undefined);
                  }}
                  className="text-xs md:text-sm flex-1 md:flex-none min-w-[80px]"
                >
                  {period}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'text-xs md:text-sm flex-1 md:flex-none min-w-[120px] justify-start text-left font-normal',
                      !dateRange?.from && 'text-muted-foreground',
                      filterPeriod === 'Custom' && 'bg-accent'
                    )}
                    onClick={() => setFilterPeriod('Custom')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}` : format(dateRange.from, 'MMM dd')
                    ) : "Custom"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" onClick={handleExportCSV} className="text-xs md:text-sm flex-1 md:flex-none">
                <FileText className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer text-xs md:text-sm whitespace-nowrap" onClick={() => handleSort('date')}>
                      Date
                      {sortKey === 'date' && <ArrowUpDown className="ml-1 inline-block h-3 w-3" />}
                    </TableHead>
                    <TableHead className="cursor-pointer text-xs md:text-sm whitespace-nowrap" onClick={() => handleSort('name')}>
                      Name
                      {sortKey === 'name' && <ArrowUpDown className="ml-1 inline-block h-3 w-3" />}
                    </TableHead>
                    <TableHead className="cursor-pointer text-xs md:text-sm whitespace-nowrap" onClick={() => handleSort('category')}>
                      Category
                      {sortKey === 'category' && <ArrowUpDown className="ml-1 inline-block h-3 w-3" />}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer text-xs md:text-sm whitespace-nowrap" onClick={() => handleSort('amount')}>
                      Amount
                      {sortKey === 'amount' && <ArrowUpDown className="ml-1 inline-block h-3 w-3" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{format(parseISO(expense.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-xs md:text-sm max-w-[120px] truncate">{expense.name}</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{expense.category}</TableCell>
                        <TableCell className="text-right text-xs md:text-sm whitespace-nowrap">{formatNaira(expense.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs md:text-sm">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards - Stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground">Total (Last 7 Days)</p>
              <p className="text-xl font-bold">{formatNaira(totalExpensesLast7Days)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Top Categories:</h4>
              <ul className="space-y-1">
                {top3ExpenseCategories.map((cat, index) => (
                  <li key={index} className="text-xs flex justify-between">
                    <span>{cat.category}</span>
                    <span className="font-medium">{formatNaira(cat.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 border rounded-lg bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Current Week</p>
                <p className="text-sm font-bold">{formatNaira(currentWeekExpenses)}</p>
              </div>
              <div className="p-2 border rounded-lg bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Last Week</p>
                <p className="text-sm font-bold">{formatNaira(lastWeekExpenses)}</p>
              </div>
            </div>
            {percentageChange !== null && (
              <p className={cn(
                "text-xs font-semibold",
                percentageChange >= 0 ? "text-destructive" : "text-success"
              )}>
                {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}% vs Last Week
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseDisplay;