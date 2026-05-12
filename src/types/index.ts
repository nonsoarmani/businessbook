export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  item: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'POS' | 'Credit';
  note?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
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

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessLogoUrl?: string;
}

// New Inventory interface
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // e.g., 'pieces', 'kg', 'liters'
  costPrice: number;
  sellingPrice: number;
  dateAdded: string; // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
  lowStockThreshold?: number;
  supplier?: string;
  notes?: string;
}

export interface BusinessState {
  sales: Sale[];
  expenses: Expense[];
  debts: Debt[];
  receipts: Receipt[];
  customers: Customer[];
  tasks: Task[];
  settings: BusinessSettings;
  // New inventory array
  inventory: InventoryItem[];
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
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'CLEAR_ALL_DATA' }
  // New inventory actions
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'UPDATE_INVENTORY_QUANTITY'; payload: { id: string; quantity: number; lastUpdated: string } }
  | { type: 'SET_STATE'; payload: BusinessState };