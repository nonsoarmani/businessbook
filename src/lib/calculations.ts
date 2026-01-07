import { Sale, Expense } from "@/types";
import { isSameDay, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, subWeeks, format, parseISO, addDays } from 'date-fns';

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

export const calculateExpensesByCategory = (expenses: Expense[], startDate: Date, endDate: Date): Record<string, number> => {
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = expense.date;
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  return filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
};

export const calculateWeeklyExpenses = (expenses: Expense[]): number => {
  const now = new Date();
  const sevenDaysAgo = addDays(now, -7);
  return expenses.filter(expense => expense.date >= sevenDaysAgo && expense.date <= now)
                 .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateWeekOverWeekExpensesChange = (expenses: Expense[]): { change: number; categoryChanges: Record<string, number> } => {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const thisWeekExpenses = calculateTotalExpenses(expenses, 'all', thisWeekStart, thisWeekEnd);
  const lastWeekExpenses = calculateTotalExpenses(expenses, 'all', lastWeekStart, lastWeekEnd);

  const change = lastWeekExpenses === 0 ? (thisWeekExpenses > 0 ? 100 : 0) : ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;

  const thisWeekCategoryExpenses = calculateExpensesByCategory(expenses, thisWeekStart, thisWeekEnd);
  const lastWeekCategoryExpenses = calculateExpensesByCategory(expenses, lastWeekStart, lastWeekEnd);

  const categoryChanges: Record<string, number> = {};
  for (const category in thisWeekCategoryExpenses) {
    const thisWeekAmount = thisWeekCategoryExpenses[category];
    const lastWeekAmount = lastWeekCategoryExpenses[category] || 0;
    if (lastWeekAmount === 0) {
      categoryChanges[category] = thisWeekAmount > 0 ? 100 : 0;
    } else {
      categoryChanges[category] = ((thisWeekAmount - lastWeekAmount) / lastWeekAmount) * 100;
    }
  }
  for (const category in lastWeekCategoryExpenses) {
    if (!(category in thisWeekCategoryExpenses)) {
      categoryChanges[category] = -100; // Category existed last week but not this week
    }
  }

  return { change, categoryChanges };
};

export const calculatePersonalUsePercentage = (sales: Sale[], expenses: Expense[], startDate: Date, endDate: Date): number => {
  const totalSales = calculateTotalSales(sales, 'all', startDate, endDate);
  const personalUseExpenses = expenses.filter(expense =>
    expense.category === 'Personal Use' && expense.date >= startDate && expense.date <= endDate
  ).reduce((sum, expense) => sum + expense.amount, 0);

  if (totalSales === 0) return 0;
  return (personalUseExpenses / totalSales) * 100;
};