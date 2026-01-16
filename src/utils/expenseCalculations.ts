import { Expense, Sale } from '@/types';
import { isToday, isThisWeek, isThisMonth, format, parseISO, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';

// Helper to parse date strings to Date objects
const parseDate = (dateString: string): Date => parseISO(dateString);

// Filter expenses by date period
export const filterExpensesByPeriod = (expenses: Expense[], period: 'All' | 'Today' | 'This Week' | 'This Month', startDate?: Date, endDate?: Date): Expense[] => {
  const today = new Date();
  return expenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    switch (period) {
      case 'Today':
        return isToday(expenseDate);
      case 'This Week':
        return isThisWeek(expenseDate, { weekStartsOn: 1 }); // Monday as start of week
      case 'This Month':
        return isThisMonth(expenseDate);
      case 'All':
        return true;
      default:
        if (startDate && endDate) {
          return expenseDate >= startOfDay(startDate) && expenseDate <= endOfDay(endDate);
        }
        return true;
    }
  });
};

// Calculate total expenses for a given array of expenses
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Get expenses for a specific day
export const getExpensesForDay = (expenses: Expense[], date: Date): Expense[] => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return expenses.filter(expense => expense.date === formattedDate);
};

// Group expenses by category and calculate total for each
export const groupExpensesByCategory = (expenses: Expense[]): { category: string; amount: number; percentage?: number }[] => {
  const categoryMap = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = calculateTotalExpenses(expenses);

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
};

// Calculate week-over-week expense comparison
export const calculateWeekOverWeekExpenseComparison = (allExpenses: Expense[]): { currentWeekExpenses: number; lastWeekExpenses: number; percentageChange: number | null } => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const currentWeekExpensesData = allExpenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    return expenseDate >= startOfCurrentWeek && expenseDate <= endOfCurrentWeek;
  });

  const lastWeekExpensesData = allExpenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    return expenseDate >= startOfLastWeek && expenseDate <= endOfLastWeek;
  });

  const currentWeekExpenses = calculateTotalExpenses(currentWeekExpensesData);
  const lastWeekExpenses = calculateTotalExpenses(lastWeekExpensesData);

  let percentageChange: number | null = null;
  if (lastWeekExpenses > 0) {
    percentageChange = ((currentWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;
  } else if (currentWeekExpenses > 0) {
    percentageChange = 100; // Expenses increased from zero
  }

  return { currentWeekExpenses, lastWeekExpenses, percentageChange };
};

// Calculate total sales for a given array of sales (re-using from salesCalculations if available, or defining here)
export const calculateTotalSales = (sales: Sale[]): number => {
  return sales.reduce((sum, sale) => sum + sale.amount, 0);
};

// Get total expenses for the last 7 days
export const getTotalExpensesLast7Days = (expenses: Expense[]): number => {
  const today = new Date();
  const sevenDaysAgo = startOfDay(subWeeks(today, 1)); // Start of day 7 days ago

  const recentExpenses = expenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    return expenseDate >= sevenDaysAgo && expenseDate <= today;
  });

  return calculateTotalExpenses(recentExpenses);
};

// Check if "Personal Use" expenses exceed 20% of total sales
export const checkPersonalUseWarning = (expenses: Expense[], sales: Sale[]): boolean => {
  const totalSales = calculateTotalSales(sales);
  const personalUseExpenses = expenses.filter(exp => exp.category === 'Personal Use');
  const totalPersonalUse = calculateTotalExpenses(personalUseExpenses);

  if (totalSales === 0) return false; // Cannot calculate percentage if no sales
  return (totalPersonalUse / totalSales) * 100 > 20;
};

// Check if any expense category increased by more than 50% week-over-week
export const checkCategoryIncreaseWarning = (allExpenses: Expense[]): { category: string; increase: number }[] => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const currentWeekExpenses = allExpenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    return expenseDate >= startOfCurrentWeek && expenseDate <= endOfCurrentWeek;
  });

  const lastWeekExpenses = allExpenses.filter(expense => {
    const expenseDate = parseDate(expense.date);
    return expenseDate >= startOfLastWeek && expenseDate <= endOfLastWeek;
  });

  const currentWeekCategories = groupExpensesByCategory(currentWeekExpenses);
  const lastWeekCategories = groupExpensesByCategory(lastWeekExpenses);

  const warnings: { category: string; increase: number }[] = [];

  currentWeekCategories.forEach(currentCat => {
    const lastCat = lastWeekCategories.find(lc => lc.category === currentCat.category);
    if (lastCat) {
      if (lastCat.amount > 0) {
        const increase = ((currentCat.amount - lastCat.amount) / lastCat.amount) * 100;
        if (increase > 50) {
          warnings.push({ category: currentCat.category, increase });
        }
      } else if (currentCat.amount > 0) {
        // Category had no expenses last week but has some this week
        warnings.push({ category: currentCat.category, increase: 100 }); // Treat as 100% increase from zero
      }
    } else if (currentCat.amount > 0) {
      // New category this week
      warnings.push({ category: currentCat.category, increase: 100 });
    }
  });

  return warnings;
};