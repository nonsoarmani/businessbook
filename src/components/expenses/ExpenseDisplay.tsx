"use client";

import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Search, FileText, AlertCircle, CalendarIcon } from 'lucide-react';
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
  filterExpensesByPeriod,
  calculateTotalExpenses,
  getExpensesForDay,
  groupExpensesByCategory,
  calculateWeekOverWeekExpenseComparison,
  calculateTotalSales, // Re-import from salesCalculations if needed, or define here
  getTotalExpensesLast7Days,
  checkPersonalUseWarning,
  checkCategoryIncreaseWarning
} from '@/utils/expenseCalculations'; // Using expenseCalculations for all expense-related calcs
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Expense } from '@/types';

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
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const todaySales = useMemo(() => {
    const today = new Date();
    return sales.filter(sale => format(parseISO(sale.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
  }, [sales]);
  const totalTodaySales = calculateTotalSales(todaySales);

  const filteredExpenses = useMemo(() => {
    let currentExpenses = filterExpensesByPeriod(expenses, filterPeriod, dateRange.from, dateRange.to);

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

  const { currentWeekExpenses, lastWeekExpenses, percentageChange } = useMemo(() => calculateWeekOverWeekExpenseComparison(expenses), [expenses]);
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
    const headers = [
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
          <CardTitle className="text-2xl font-bold">Today's Expenses Summary ({format(new Date(), 'PPP')})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-semibold">Total Expenses:</p>
            <p className="text-3xl font-bold text-destructive">{formatNaira(totalTodayExpenses)}</p>
          </div>
          {todayExpensesExceedSales && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Today's expenses ({formatNaira(totalTodayExpenses)}) exceed today's sales ({formatNaira(totalTodaySales)}).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expense History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by expense name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select onValueChange={(value: typeof expenseCategories[number]) => setSelectedCategory(value)} defaultValue={selectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Today', 'This Week', 'This Month'] as FilterPeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={filterPeriod === period ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterPeriod(period);
                    setDateRange({}); // Clear custom range when selecting predefined period
                  }}
                  className="min-w-[100px]"
                >
                  {period}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full md:w-[200px] justify-start text-left font-normal',
                      !dateRange.from && 'text-muted-foreground',
                      filterPeriod === 'Custom' && 'bg-accent'
                    )}
                    onClick={() => setFilterPeriod('Custom')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Custom Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    Date {sortKey === 'date' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortKey === 'name' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                    Category {sortKey === 'category' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                    Amount {sortKey === 'amount' && <ArrowUpDown className={cn("ml-1 inline-block h-4 w-4", sortOrder === 'asc' ? 'rotate-180' : '')} />}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(parseISO(expense.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{expense.name}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">{formatNaira(expense.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No expenses found for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Expense Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4 p-4 border rounded-lg bg-muted/40">
            <h3 className="text-lg font-semibold mb-2">Weekly Overview (Last 7 Days)</h3>
            <p className="text-sm text-muted-foreground">
              Total Expenses: <span className="font-medium text-foreground">{formatNaira(totalExpensesLast7Days)}</span>
            </p>
            <h4 className="font-medium mt-3 mb-1">Top 3 Categories This Week:</h4>
            {top3ExpenseCategories.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {top3ExpenseCategories.map((cat, index) => (
                  <li key={index}>{cat.category}: {formatNaira(cat.amount)} ({cat.percentage?.toFixed(1)}%)</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No expenses recorded this week.</p>
            )}
          </div>

          <div className="mb-4 p-4 border rounded-lg bg-muted/40">
            <h3 className="text-lg font-semibold mb-2">Week-over-Week Expense Comparison</h3>
            <p className="text-sm text-muted-foreground">
              Current Week: <span className="font-medium text-foreground">{formatNaira(currentWeekExpenses)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Last Week: <span className="font-medium text-foreground">{formatNaira(lastWeekExpenses)}</span>
            </p>
            {percentageChange !== null && (
              <p className={cn(
                "text-sm font-semibold mt-1",
                percentageChange >= 0 ? "text-destructive" : "text-success"
              )}>
                {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(2)}% vs Last Week
              </p>
            )}
            {percentageChange === null && lastWeekExpenses === 0 && currentWeekExpenses > 0 && (
              <p className="text-sm font-semibold mt-1 text-destructive">
                ↑ 100% vs Last Week (No expenses last week)
              </p>
            )}
            {percentageChange === null && lastWeekExpenses === 0 && currentWeekExpenses === 0 && (
              <p className="text-sm font-semibold mt-1 text-muted-foreground">
                No expenses recorded for last two weeks.
              </p>
            )}
          </div>

          {personalUseWarning && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Personal Use Warning!</AlertTitle>
              <AlertDescription>
                Your "Personal Use" expenses exceed 20% of your total sales. Consider reviewing personal spending.
              </AlertDescription>
            </Alert>
          )}

          {categoryIncreaseWarnings.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expense Category Alert!</AlertTitle>
              <AlertDescription>
                <p>The following expense categories increased by more than 50% this week:</p>
                <ul className="list-disc list-inside mt-2">
                  {categoryIncreaseWarnings.map((warning, index) => (
                    <li key={index}>{warning.category}: Increased by {warning.increase.toFixed(2)}%</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseDisplay;