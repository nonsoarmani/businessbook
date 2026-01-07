import { Sale, Expense } from "@/types";
import { isSameDay, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, subWeeks } from 'date-fns';

export const calculateTotalSales = (sales: Sale[], dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'all', customStartDate?: Date, customEndDate?: Date): number => {
  const now = new Date();
  return sales.filter(sale => {
    const saleDate = sale.date;
    if (dateRange === 'today') return isSameDay(saleDate, now);
    if (dateRange === 'thisWeek') return isThisWeek(saleDate, { weekStartsOn: 1 }); // Monday as start of week
    if (dateRange === 'thisMonth') return isThisMonth(saleDate);
    if (customStartDate && customEndDate) return saleDate >= customStartDate && saleDate <= customEndDate;
    return true; // 'all' or no specific range
  }).reduce((sum, sale) => sum + sale.amount, 0);
};

export const calculateSalesBreakdown = (sales: Sale[], dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'all'): Record<Sale['paymentMethod'], number> => {
  const filteredSales = sales.filter(sale => {
    const now = new Date();
    const saleDate = sale.date;
    if (dateRange === 'today') return isSameDay(saleDate, now);
    if (dateRange === 'thisWeek') return isThisWeek(saleDate, { weekStartsOn: 1 });
    if (dateRange === 'thisMonth') return isThisMonth(saleDate);
    return true;
  });

  return filteredSales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.amount;
    return acc;
  }, { Cash: 0, Transfer: 0, POS: 0, Credit: 0 });
};

export const calculateTotalExpenses = (expenses: Expense[], dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'all', customStartDate?: Date, customEndDate?: Date): number => {
  const now = new Date();
  return expenses.filter(expense => {
    const expenseDate = expense.date;
    if (dateRange === 'today') return isSameDay(expenseDate, now);
    if (dateRange === 'thisWeek') return isThisWeek(expenseDate, { weekStartsOn: 1 });
    if (dateRange === 'thisMonth') return isThisMonth(expenseDate);
    if (customStartDate && customEndDate) return expenseDate >= customStartDate && expenseDate <= customEndDate;
    return true; // 'all' or no specific range
  }).reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateDailySummary = (sales: Sale[], expenses: Expense[], date: Date) => {
  const totalSales = calculateTotalSales(sales, 'all', date, date);
  const totalExpenses = calculateTotalExpenses(expenses, 'all', date, date);
  const profitLoss = totalSales - totalExpenses;
  return { totalSales, totalExpenses, profitLoss };
};

export const calculateWeekOverWeekSalesChange = (sales: Sale[]): number => {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const thisWeekSales = calculateTotalSales(sales, 'all', thisWeekStart, thisWeekEnd);
  const lastWeekSales = calculateTotalSales(sales, 'all', lastWeekStart, lastWeekEnd);

  if (lastWeekSales === 0) {
    return thisWeekSales > 0 ? 100 : 0; // If last week was 0, and this week is >0, it's 100% increase. If both 0, 0% change.
  }

  return ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;
};