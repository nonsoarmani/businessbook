import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from 'date-fns';
import { BusinessState } from '@/types'; // Import BusinessState

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy');
}

export function isValidNigerianPhoneNumber(phone: string): boolean {
  // Nigerian phone numbers are typically 11 digits, starting with 0
  return /^0[7-9][0-1]\d{8}$/.test(phone);
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function exportToCSV<T extends Record<string, any>>(filename: string, data: T[], headers: string[] = []) {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const actualHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(actualHeaders.map(header => `"${header}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = actualHeaders.map(header => {
      let value = row[header];
      if (value instanceof Date) {
        value = formatDate(value);
      } else if (typeof value === 'number' && header.toLowerCase().includes('amount')) {
        value = value.toFixed(2); // Format numbers to 2 decimal places
      }
      return `"${String(value).replace(/"/g, '""')}"`; // Escape double quotes
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportAllBusinessDataToCSV(state: BusinessState) {
  const now = new Date();
  const timestamp = format(now, 'yyyyMMdd_HHmmss');

  // Export Sales
  const salesHeaders = ['ID', 'Date', 'Item', 'Amount', 'Payment Method', 'Customer Name', 'Customer Phone', 'Note'];
  const salesData = state.sales.map(sale => ({
    ID: sale.id,
    Date: formatDate(sale.date),
    Item: sale.item,
    Amount: sale.amount,
    'Payment Method': sale.paymentMethod,
    'Customer Name': sale.customerName || '',
    'Customer Phone': sale.customerPhone || '',
    Note: sale.note || '',
  }));
  exportToCSV(`sales_data_${timestamp}`, salesData, salesHeaders);

  // Export Expenses
  const expensesHeaders = ['ID', 'Date', 'Name', 'Amount', 'Category'];
  const expensesData = state.expenses.map(expense => ({
    ID: expense.id,
    Date: formatDate(expense.date),
    Name: expense.name,
    Amount: expense.amount,
    Category: expense.category,
  }));
  exportToCSV(`expenses_data_${timestamp}`, expensesData, expensesHeaders);

  // Export Debts
  const debtsHeaders = ['ID', 'Customer Name', 'Phone', 'Original Amount', 'Amount Owed', 'Date Given', 'Due Date', 'Items Sold', 'Status', 'Paid Amount', 'Date Paid'];
  const debtsData = state.debts.map(debt => ({
    ID: debt.id,
    'Customer Name': debt.customerName,
    Phone: debt.phone,
    'Original Amount': debt.originalAmount,
    'Amount Owed': debt.amountOwed,
    'Date Given': formatDate(debt.dateGiven),
    'Due Date': formatDate(debt.dueDate),
    'Items Sold': debt.itemsSold,
    Status: debt.status,
    'Paid Amount': debt.paidAmount || 0,
    'Date Paid': debt.datePaid ? formatDate(debt.datePaid) : '',
  }));
  exportToCSV(`debts_data_${timestamp}`, debtsData, debtsHeaders);

  // Export Receipts
  const receiptsHeaders = ['ID', 'Receipt Number', 'Date', 'Customer Name', 'Customer Phone', 'Items', 'Amount', 'Payment Method', 'Linked Sale ID'];
  const receiptsData = state.receipts.map(receipt => ({
    ID: receipt.id,
    'Receipt Number': receipt.receiptNumber,
    Date: formatDate(receipt.date),
    'Customer Name': receipt.customerName,
    'Customer Phone': receipt.customerPhone || '',
    Items: receipt.items,
    Amount: receipt.amount,
    'Payment Method': receipt.paymentMethod,
    'Linked Sale ID': receipt.linkedSaleId || '',
  }));
  exportToCSV(`receipts_data_${timestamp}`, receiptsData, receiptsHeaders);
}