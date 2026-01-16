import { Debt } from '@/types';
import { parseISO, isPast, isBefore, addDays, format, isToday } from 'date-fns';

// Helper to parse date strings to Date objects
const parseDate = (dateString: string): Date => parseISO(dateString);

// Function to update debt status based on due date
export const updateDebtStatus = (debt: Debt): Debt => {
  if (debt.status === 'paid') {
    return debt; // If already paid, status doesn't change
  }

  const today = new Date();
  const dueDate = parseDate(debt.dueDate);

  if (isPast(dueDate) && !isToday(dueDate)) {
    return { ...debt, status: 'overdue' };
  } else if (isBefore(dueDate, addDays(today, 7))) { // Due within the next 7 days
    return { ...debt, status: 'dueSoon' };
  } else {
    return { ...debt, status: 'active' };
  }
};

// Filter debts by status
export const filterDebtsByStatus = (debts: Debt[], status: 'active' | 'overdue' | 'dueSoon' | 'paid' | 'partial'): Debt[] => {
  return debts.filter(debt => debt.status === status);
};

// Calculate total outstanding amount for a given array of debts
export const calculateTotalOutstandingDebts = (debts: Debt[]): number => {
  return debts.filter(debt => debt.status !== 'paid').reduce((sum, debt) => sum + debt.amountOwed, 0);
};

// Calculate total paid amount for a given array of debts
export const calculateTotalPaidDebts = (debts: Debt[]): number => {
  return debts.filter(debt => debt.status === 'paid' || debt.status === 'partial').reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
};

// Get debts due today
export const getDebtsDueToday = (debts: Debt[]): Debt[] => {
  const todayFormatted = format(new Date(), 'yyyy-MM-dd');
  return debts.filter(debt => debt.status !== 'paid' && debt.dueDate === todayFormatted);
};

// Get debts due in the next 7 days (excluding today)
export const getDebtsDueSoon = (debts: Debt[]): Debt[] => {
  const today = new Date();
  return debts.filter(debt => {
    const debtDueDate = parseDate(debt.dueDate);
    return debt.status !== 'paid' && debtDueDate > today && isBefore(debtDueDate, addDays(today, 7));
  });
};

// Get overdue debts
export const getOverdueDebts = (debts: Debt[]): Debt[] => {
  const today = new Date();
  return debts.filter(debt => debt.status !== 'paid' && isPast(parseDate(debt.dueDate)) && !isToday(parseDate(debt.dueDate)));
};