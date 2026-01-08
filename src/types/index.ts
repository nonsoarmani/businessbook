export interface Sale {
  id: string;
  user_id: string; // Added for Supabase RLS
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
  user_id: string; // Added for Supabase RLS
  date: Date;
  name: string;
  amount: number;
  category: 'Stock/Inventory' | 'Transport' | 'Food/Lunch' | 'Airtime/Data' | 'Rent/Shop' | 'Staff Payment' | 'Personal Use' | 'Other';
}

export interface Debt {
  id: string;
  user_id: string; // Added for Supabase RLS
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
  user_id: string; // Added for Supabase RLS
  receiptNumber: string;
  date: Date;
  customerName: string;
  customerPhone?: string;
  items: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS';
  linkedSaleId?: string; // If generated from a sale
}

// Derived Customer interface for display purposes
export interface Customer {
  id: string; // A unique ID for the customer, derived from their name/phone
  name: string;
  phone: string;
  totalSalesAmount: number;
  totalDebtsAmount: number;
  activeDebtsCount: number;
}

export interface BusinessState {
  sales: Sale[];
  expenses: Expense[];
  debts: Debt[];
  receipts: Receipt[];
  businessName: string;
  businessPhone: string;
  businessLocation: string;
  isDataLoaded: boolean; // New state to track if data has been loaded from Supabase
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
  | { type: 'DELETE_DEBT'; payload: { id: string } }
  | { type: 'MARK_DEBT_PAID'; payload: { id: string; datePaid: Date } }
  | { type: 'ADD_RECEIPT'; payload: Receipt }
  | { type: 'UPDATE_RECEIPT'; payload: Partial<Receipt> & { id: string } }
  | { type: 'DELETE_RECEIPT'; payload: { id: string } }
  | { type: 'SET_BUSINESS_INFO'; payload: { businessName: string; businessPhone: string; businessLocation: string } }
  | { type: 'UPDATE_CUSTOMER_DETAILS'; payload: { oldName: string; oldPhone: string; newName: string; newPhone: string } }
  | { type: 'DELETE_CUSTOMER_DATA'; payload: { customerName: string; customerPhone: string } }
  | { type: 'RESET_ALL_DATA' }
  | { type: 'SET_INITIAL_DATA'; payload: BusinessState } // New action for initial data load
  | { type: 'SET_DATA_LOADED'; payload: boolean }; // New action to set data loaded status