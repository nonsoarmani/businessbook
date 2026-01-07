import { Sale, Expense, Debt } from "@/types";
import { isSameDay, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, subWeeks, format, parseISO, addDays, differenceInDays, getMonth, getYear } from 'date-fns';

export const calculateTotalSales = (sales: Sale[], dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'all', customStartDate?: Date, customEndDate?: Date): number => {
  const now = new Date();
  return sales.filter(sale => {
    const saleDate = new Date(sale.date); // Ensure it's a Date object
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
    const saleDate = new Date(sale.date); // Ensure it's a Date object
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
    const expenseDate = new Date(expense.date); // Ensure it's a Date object
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
    const expenseDate = new Date(expense.date); // Ensure it's a Date object
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
  return expenses.filter(expense => new Date(expense.date) >= sevenDaysAgo && new Date(expense.date) <= now) // Ensure Date objects
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
    expense.category === 'Personal Use' && new Date(expense.date) >= startDate && new Date(expense.date) <= endDate // Ensure Date objects
  ).reduce((sum, expense) => sum + expense.amount, 0);

  if (totalSales === 0) return 0;
  return (personalUseExpenses / totalSales) * 100;
};

export const calculateOutstandingDebts = (debts: Debt[]): { totalAmount: number; numberOfPeople: number; overdueAmount: number } => {
  const activeDebts = debts.filter(debt => debt.status !== 'paid');
  const totalAmount = activeDebts.reduce((sum, debt) => sum + debt.amountOwed, 0);
  const numberOfPeople = new Set(activeDebts.map(debt => debt.customerName)).size;

  const now = new Date();
  const overdueAmount = activeDebts
    .filter(debt => new Date(debt.dueDate) < now) // Ensure Date object
    .reduce((sum, debt) => sum + debt.amountOwed, 0);

  return { totalAmount, numberOfPeople, overdueAmount };
};

export const getDebtStatus = (debt: Debt): 'overdue' | 'dueSoon' | 'notYetDue' | 'paid' => {
  if (debt.status === 'paid') return 'paid';
  const now = new Date();
  const dueDate = new Date(debt.dueDate);
  const daysUntilDue = differenceInDays(dueDate, now);

  if (daysUntilDue < 0) {
    return 'overdue';
  } else if (daysUntilDue <= 7) {
    return 'dueSoon';
  } else {
    return 'notYetDue';
  }
};

export const calculateDaysOverdue = (dueDate: Date): number => {
  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) {
    return differenceInDays(now, due);
  }
  return 0;
};

export const calculateDaysToCollect = (dateGiven: Date, datePaid: Date): number => {
  return differenceInDays(new Date(datePaid), new Date(dateGiven));
};

export const getMonthlySalesData = (sales: Sale[], numberOfMonths: number = 6) => {
  const monthlySales: { [key: string]: number } = {};
  const now = new Date();

  // Initialize for the last `numberOfMonths`
  for (let i = 0; i < numberOfMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthYear = format(date, 'MMM yyyy');
    monthlySales[monthYear] = 0;
  }

  sales.forEach(sale => {
    const saleDate = new Date(sale.date); // Ensure it's a Date object
    const monthYear = format(saleDate, 'MMM yyyy');
    if (monthlySales.hasOwnProperty(monthYear)) {
      monthlySales[monthYear] += sale.amount;
    }
  });

  // Convert to array and sort by date
  const sortedData = Object.keys(monthlySales)
    .map(key => ({
      name: key,
      sales: monthlySales[key],
      date: parseISO(key.replace(' ', ' 1, ')) // Create a comparable date object
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, sales }) => ({ name, sales })); // Remove temporary date field

  return sortedData;
};

export const calculateCurrentCashBalance = (sales: Sale[], expenses: Expense[]): number => {
  const totalSalesCashAndTransfer = sales
    .filter(sale => sale.paymentMethod === 'Cash' || sale.paymentMethod === 'Transfer' || sale.paymentMethod === 'POS')
    .reduce((sum, sale) => sum + sale.amount, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return totalSalesCashAndTransfer - totalExpenses;
};

export const getMonthlyCashFlowData = (sales: Sale[], expenses: Expense[], numberOfMonths: number = 6) => {
  const monthlyCashFlow: { [key: string]: { sales: number; expenses: number; netFlow: number; date: Date } } = {};
  const now = new Date();

  // Initialize for the last `numberOfMonths`
  for (let i = 0; i < numberOfMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthYear = format(date, 'MMM yyyy');
    monthlyCashFlow[monthYear] = { sales: 0, expenses: 0, netFlow: 0, date: date };
  }

  sales.forEach(sale => {
    const saleDate = new Date(sale.date); // Ensure it's a Date object
    const monthYear = format(saleDate, 'MMM yyyy');
    if (monthlyCashFlow.hasOwnProperty(monthYear) && (sale.paymentMethod === 'Cash' || sale.paymentMethod === 'Transfer' || sale.paymentMethod === 'POS')) {
      monthlyCashFlow[monthYear].sales += sale.amount;
    }
  });

  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date); // Ensure it's a Date object
    const monthYear = format(expenseDate, 'MMM yyyy');
    if (monthlyCashFlow.hasOwnProperty(monthYear)) {
      monthlyCashFlow[monthYear].expenses += expense.amount;
    }
  });

  // Calculate net flow and convert to array
  const sortedData = Object.keys(monthlyCashFlow)
    .map(key => {
      const data = monthlyCashFlow[key];
      return {
        name: key,
        sales: data.sales,
        expenses: data.expenses,
        netFlow: data.sales - data.expenses,
        date: data.date
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, sales, expenses, netFlow }) => ({ name, sales, expenses, netFlow })); // Remove temporary date field

  return sortedData;
};

export const calculateTopSellingItems = (sales: Sale[], startDate: Date, endDate: Date, limit: number = 5) => {
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date); // Ensure it's a Date object
    return saleDate >= startDate && saleDate <= endDate;
  });

  const itemSales: { [item: string]: number } = {};
  filteredSales.forEach(sale => {
    itemSales[sale.item] = (itemSales[sale.item] || 0) + sale.amount;
  });

  return Object.entries(itemSales)
    .map(([item, totalAmount]) => ({ item, totalAmount }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
};

export const calculateTopCustomersBySales = (sales: Sale[], limit: number = 3) => {
  const customerSales: { [key: string]: { name: string; phone: string; totalSales: number } } = {};

  sales.forEach(sale => {
    if (sale.customerName) {
      const key = `${sale.customerName}|${sale.customerPhone || ''}`;
      if (!customerSales[key]) {
        customerSales[key] = { name: sale.customerName, phone: sale.customerPhone || 'N/A', totalSales: 0 };
      }
      customerSales[key].totalSales += sale.amount;
    }
  });

  return Object.values(customerSales)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
};

export const calculateTopCustomersByOutstandingDebt = (debts: Debt[], limit: number = 3) => {
  const customerDebts: { [key: string]: { name: string; phone: string; totalDebt: number } } = {};

  debts.filter(debt => debt.status !== 'paid').forEach(debt => {
    const key = `${debt.customerName}|${debt.phone}`;
    if (!customerDebts[key]) {
      customerDebts[key] = { name: debt.customerName, phone: debt.phone, totalDebt: 0 };
    }
    customerDebts[key].totalDebt += debt.amountOwed;
  });

  return Object.values(customerDebts)
    .sort((a, b) => b.totalDebt - a.totalDebt)
    .slice(0, limit);
};

export const calculateAverageDebtCollectionTime = (debts: Debt[]): number => {
  const collectedTimes = debts
    .filter(debt => debt.status === 'paid' && debt.datePaid && debt.dateGiven)
    .map(debt => calculateDaysToCollect(debt.dateGiven, debt.datePaid!));

  if (collectedTimes.length === 0) return 0;
  const totalDays = collectedTimes.reduce((sum, days) => sum + days, 0);
  return totalDays / collectedTimes.length;
};

export const calculateProfitLossStatement = (sales: Sale[], expenses: Expense[], startDate: Date, endDate: Date) => {
  const totalSales = sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    })
    .reduce((sum, sale) => sum + sale.amount, 0);

  const totalExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const netProfitLoss = totalSales - totalExpenses;

  return { totalSales, totalExpenses, netProfitLoss };
};