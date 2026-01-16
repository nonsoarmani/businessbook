import { Sale, Expense } from '@/types';
import { parseISO, format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

// Helper to parse date strings to Date objects
const parseDate = (dateString: string): Date => parseISO(dateString);

// Filter sales and expenses by a given date range
const filterDataByDateRange = <T extends { date: string }>(data: T[], startDate?: Date, endDate?: Date): T[] => {
  if (!startDate || !endDate) {
    return data;
  }
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  return data.filter(item => {
    const itemDate = parseDate(item.date);
    return isWithinInterval(itemDate, { start, end });
  });
};

// Calculate total income from sales for a given array of sales
export const calculateTotalIncome = (sales: Sale[]): number => {
  return sales.reduce((sum, sale) => sum + sale.amount, 0);
};

// Calculate total expenses for a given array of expenses
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Calculate net cash flow for a given period
export const calculateNetCashFlow = (sales: Sale[], expenses: Expense[], startDate?: Date, endDate?: Date): number => {
  const filteredSales = filterDataByDateRange(sales, startDate, endDate);
  const filteredExpenses = filterDataByDateRange(expenses, startDate, endDate);
  const totalIncome = calculateTotalIncome(filteredSales);
  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  return totalIncome - totalExpenses;
};

// Get income breakdown by payment method for a given period
export const getIncomeByPaymentMethod = (sales: Sale[], startDate?: Date, endDate?: Date): { Cash: number; Transfer: number; POS: number; Credit: number } => {
  const filteredSales = filterDataByDateRange(sales, startDate, endDate);
  return filteredSales.reduce(
    (acc, sale) => {
      // Only count non-credit sales as immediate cash flow
      if (sale.paymentMethod !== 'Credit') {
        acc[sale.paymentMethod] += sale.amount;
      }
      return acc;
    },
    { Cash: 0, Transfer: 0, POS: 0, Credit: 0 } // Credit is included for completeness but will be 0 for immediate cash flow
  );
};

// Get expenses breakdown by category for a given period
export const getExpensesByCategory = (expenses: Expense[], startDate?: Date, endDate?: Date): { category: string; amount: number }[] => {
  const filteredExpenses = filterDataByDateRange(expenses, startDate, endDate);
  const categoryMap = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

// Get daily cash flow summary for a given date range
export const getCashFlowSummaryByDay = (sales: Sale[], expenses: Expense[], startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dailySales = filterDataByDateRange(sales, dayStart, dayEnd);
    const dailyExpenses = filterDataByDateRange(expenses, dayStart, dayEnd);

    const income = calculateTotalIncome(dailySales);
    const expense = calculateTotalExpenses(dailyExpenses);
    const netFlow = income - expense;

    return {
      date: format(day, 'yyyy-MM-dd'),
      income,
      expense,
      netFlow,
    };
  });
};

// Get monthly cash flow summary for a given date range
export const getCashFlowSummaryByMonth = (sales: Sale[], expenses: Expense[], startDate: Date, endDate: Date) => {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  return months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthlySales = filterDataByDateRange(sales, monthStart, monthEnd);
    const monthlyExpenses = filterDataByDateRange(expenses, monthStart, monthEnd);

    const income = calculateTotalIncome(monthlySales);
    const expense = calculateTotalExpenses(monthlyExpenses);
    const netFlow = income - expense;

    return {
      date: format(month, 'yyyy-MM-dd'), // Use first day of month for consistent charting
      income,
      expense,
      netFlow,
    };
  });
};