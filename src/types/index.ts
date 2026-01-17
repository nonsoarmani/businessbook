export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  item: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS' | 'Credit';
  note?: string;
  customerName?: string; // For credit sales
  customerPhone?: string; // For credit sales
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  amount: number;
  category: 'Stock/Inventory' | 'Transport' | 'Food/Lunch' | 'Airtime/Data' | 'Rent/Shop' | 'Staff Payment' | 'Personal Use' | 'Other';
}

export interface Debt {
  id: string;
  customerName: string;
  phone: string;
  originalAmount: number;
  amountOwed: number; // Remaining amount
  dateGiven: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  itemsSold: string;
  status: 'active' | 'overdue' | 'dueSoon' | 'paid' | 'partial';
  paidAmount?: number; // Total amount paid so far
  datePaid?: string; // YYYY-MM-DD, if status is 'paid'
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  items: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS';
  linkedSaleId?: string; // If generated from a sale
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location?: string;
  email?: string;
  dateAdded: string; // YYYY-MM-DD
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessLogoUrl?: string;
}

export interface BusinessState {
  sales: Sale[];
  expenses: Expense[];
  debts: Debt[];
  receipts: Receipt[];
  customers: Customer[]; // New customers array
  settings: BusinessSettings;
}

export type BusinessAction =
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'MARK_DEBT_PAID'; payload: { id: string; datePaid: string; paidAmount: number } }
  | { type: 'ADD_RECEIPT'; payload: Receipt }
  | { type: 'UPDATE_SETTINGS'; payload: BusinessSettings }
  | { type: 'ADD_CUSTOMER'; payload: Customer } // New action types
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'CLEAR_ALL_DATA' };