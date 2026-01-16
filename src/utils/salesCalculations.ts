import { Sale } from '@/types';
import { isToday, isThisWeek, isThisMonth, format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, addDays } from 'date-fns';

// Helper to parse date strings to Date objects
const parseDate = (dateString: string): Date => parseISO(dateString);

// Filter sales by date period
export const filterSalesByPeriod = (sales: Sale[], period: 'All' | 'Today' | 'This Week' | 'This Month'): Sale[] => {
  const today = new Date();
  return sales.filter(sale => {
    const saleDate = parseDate(sale.date);
    switch (period) {
      case 'Today':
        return isToday(saleDate);
      case 'This Week':
        return isThisWeek(saleDate, { weekStartsOn: 1 }); // Monday as start of week
      case 'This Month':
        return isThisMonth(saleDate);
      case 'All':
      default:
        return true;
    }
  });
};

// Calculate total sales for a given array of sales
export const calculateTotalSales = (sales: Sale[]): number => {
  return sales.reduce((sum, sale) => sum + sale.amount, 0);
};

// Calculate sales breakdown by payment method
export const calculatePaymentMethodBreakdown = (sales: Sale[]): { Cash: number; Transfer: number; POS: number; Credit: number } => {
  return sales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] += sale.amount;
      return acc;
    },
    { Cash: 0, Transfer: 0, POS: 0, Credit: 0 }
  );
};

// Calculate week-over-week sales comparison
export const calculateWeekOverWeekComparison = (allSales: Sale[]): { currentWeekSales: number; lastWeekSales: number; percentageChange: number | null } => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const currentWeekSalesData = allSales.filter(sale => {
    const saleDate = parseDate(sale.date);
    return saleDate >= startOfCurrentWeek && saleDate <= endOfCurrentWeek;
  });

  const lastWeekSalesData = allSales.filter(sale => {
    const saleDate = parseDate(sale.date);
    return saleDate >= startOfLastWeek && saleDate <= endOfLastWeek;
  });

  const currentWeekSales = calculateTotalSales(currentWeekSalesData);
  const lastWeekSales = calculateTotalSales(lastWeekSalesData);

  let percentageChange: number | null = null;
  if (lastWeekSales > 0) {
    percentageChange = ((currentWeekSales - lastWeekSales) / lastWeekSales) * 100;
  } else if (currentWeekSales > 0) {
    percentageChange = 100; // Sales increased from zero
  }

  return { currentWeekSales, lastWeekSales, percentageChange };
};

// Get sales for a specific day
export const getSalesForDay = (sales: Sale[], date: Date): Sale[] => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return sales.filter(sale => sale.date === formattedDate);
};