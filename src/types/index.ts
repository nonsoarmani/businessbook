export interface Sale {
  id: string;
  date: Date;
  item: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS' | 'Credit';
  note?: string;
  customerName?: string; // For credit sales
  customerPhone?: string; // For credit sales
}

export interface Expense {
  id: string;
  date: Date;
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
  dateGiven: Date;
  dueDate: Date;
  itemsSold: string;
  status: 'active' | 'paid' | 'partial';
  paidAmount?: number; // Total amount paid so far
  datePaid?: Date; // For paid debts
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: Date;
  customerName: string;
  customerPhone?: string;
  items: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS';
  linkedSaleId?: string; // If generated from a sale
}

export interface BusinessState {
  sales: Sale[];
  expenses: Expense[];
  debts: Debt[];
  receipts: Receipt[];
  businessName: string;
  businessPhone: string;
  businessLocation: string;
}

export type BusinessAction =
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Partial<Sale> & { id: string } }
  | { type: 'DELETE_SALE'; payload: { id: string } }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Partial<Expense> & { id: string } }
  | { type: 'DELETE_EXPENSE'; payload: { id: string } }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Partial<Debt> & { id: string } }
  | { type: 'DELETE_DEBT'; payload: { id: string } } // New action for deleting debts
  | { type: 'MARK_DEBT_PAID'; payload: { id: string; datePaid: Date } }
  | { type: 'ADD_RECEIPT'; payload: Receipt }
  | { type: 'SET_BUSINESS_INFO'; payload: { businessName: string; businessPhone: string; businessLocation: string } };