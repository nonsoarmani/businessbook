
import { supabase } from './client';
import { 
  Sale, Expense, Debt, Receipt, Customer, Task, InventoryItem, BusinessSettings 
} from '@/types';

// Helper to handle mapping between camelCase and snake_case if necessary
// For now, I'll keep the Supabase table columns matching the frontend types as much as possible, 
// but use snake_case for consistency with SQL standards.

export const businessService = {
  // Sales
  async getSales(userId: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      paymentMethod: item.payment_method,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      customerId: item.customer_id
    })) as Sale[];
  },
  async addSale(userId: string, sale: Sale) {
    const { error } = await supabase.from('sales').insert({
      id: sale.id,
      user_id: userId,
      date: sale.date,
      item: sale.item,
      amount: sale.amount,
      payment_method: sale.paymentMethod,
      note: sale.note,
      customer_name: sale.customerName,
      customer_phone: sale.customerPhone,
      customer_id: sale.customerId
    });
    if (error) throw error;
  },
  async updateSale(userId: string, sale: Sale) {
    const { error } = await supabase.from('sales').update({
      date: sale.date,
      item: sale.item,
      amount: sale.amount,
      payment_method: sale.paymentMethod,
      note: sale.note,
      customer_name: sale.customerName,
      customer_phone: sale.customerPhone,
      customer_id: sale.customerId
    }).eq('id', sale.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteSale(userId: string, id: string) {
    const { error } = await supabase.from('sales').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Expenses
  async getExpenses(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data as Expense[];
  },
  async addExpense(userId: string, expense: Expense) {
    const { error } = await supabase.from('expenses').insert({
      id: expense.id,
      user_id: userId,
      date: expense.date,
      name: expense.name,
      amount: expense.amount,
      category: expense.category
    });
    if (error) throw error;
  },
  async updateExpense(userId: string, expense: Expense) {
    const { error } = await supabase.from('expenses').update({
      date: expense.date,
      name: expense.name,
      amount: expense.amount,
      category: expense.category
    }).eq('id', expense.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteExpense(userId: string, id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Debts
  async getDebts(userId: string) {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      customerName: item.customer_name,
      originalAmount: item.original_amount,
      amountOwed: item.amount_owed,
      dateGiven: item.date_given,
      dueDate: item.due_date,
      itemsSold: item.items_sold,
      paidAmount: item.paid_amount,
      datePaid: item.date_paid
    })) as Debt[];
  },
  async addDebt(userId: string, debt: Debt) {
    const { error } = await supabase.from('debts').insert({
      id: debt.id,
      user_id: userId,
      customer_name: debt.customerName,
      phone: debt.phone,
      original_amount: debt.originalAmount,
      amount_owed: debt.amountOwed,
      date_given: debt.dateGiven,
      due_date: debt.dueDate,
      items_sold: debt.itemsSold,
      status: debt.status,
      paid_amount: debt.paidAmount || 0,
      date_paid: debt.datePaid
    });
    if (error) throw error;
  },
  async updateDebt(userId: string, debt: Debt) {
    const { error } = await supabase.from('debts').update({
      customer_name: debt.customerName,
      phone: debt.phone,
      original_amount: debt.originalAmount,
      amount_owed: debt.amountOwed,
      date_given: debt.dateGiven,
      due_date: debt.dueDate,
      items_sold: debt.itemsSold,
      status: debt.status,
      paid_amount: debt.paidAmount,
      date_paid: debt.datePaid
    }).eq('id', debt.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteDebt(userId: string, id: string) {
    const { error } = await supabase.from('debts').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Receipts
  async getReceipts(userId: string) {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      receiptNumber: item.receipt_number,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      paymentMethod: item.payment_method,
      linkedSaleId: item.linked_sale_id
    })) as Receipt[];
  },
  async addReceipt(userId: string, receipt: Receipt) {
    const { error } = await supabase.from('receipts').insert({
      id: receipt.id,
      user_id: userId,
      receipt_number: receipt.receiptNumber,
      date: receipt.date,
      customer_name: receipt.customerName,
      customer_phone: receipt.customerPhone,
      items: receipt.items,
      amount: receipt.amount,
      payment_method: receipt.paymentMethod,
      linked_sale_id: receipt.linkedSaleId
    });
    if (error) throw error;
  },

  // Customers
  async getCustomers(userId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      dateAdded: item.date_added
    })) as Customer[];
  },
  async addCustomer(userId: string, customer: Customer) {
    const { error } = await supabase.from('customers').insert({
      id: customer.id,
      user_id: userId,
      name: customer.name,
      phone: customer.phone,
      location: customer.location,
      email: customer.email,
      date_added: customer.dateAdded
    });
    if (error) throw error;
  },
  async updateCustomer(userId: string, customer: Customer) {
    const { error } = await supabase.from('customers').update({
      name: customer.name,
      phone: customer.phone,
      location: customer.location,
      email: customer.email,
      date_added: customer.dateAdded
    }).eq('id', customer.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteCustomer(userId: string, id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Tasks
  async getTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      dueDate: item.due_date,
      createdAt: item.created_at,
      completedAt: item.completed_at
    })) as Task[];
  },
  async addTask(userId: string, task: Task) {
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      user_id: userId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      created_at: task.createdAt,
      completed_at: task.completedAt
    });
    if (error) throw error;
  },
  async updateTask(userId: string, task: Task) {
    const { error } = await supabase.from('tasks').update({
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      created_at: task.createdAt,
      completed_at: task.completedAt
    }).eq('id', task.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteTask(userId: string, id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Inventory
  async getInventory(userId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => ({
      ...item,
      costPrice: item.cost_price,
      sellingPrice: item.selling_price,
      dateAdded: item.date_added,
      lastUpdated: item.last_updated,
      lowStockThreshold: item.low_stock_threshold
    })) as InventoryItem[];
  },
  async addInventoryItem(userId: string, item: InventoryItem) {
    const { error } = await supabase.from('inventory').insert({
      id: item.id,
      user_id: userId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      cost_price: item.costPrice,
      selling_price: item.sellingPrice,
      date_added: item.dateAdded,
      last_updated: item.lastUpdated,
      low_stock_threshold: item.lowStockThreshold,
      supplier: item.supplier,
      notes: item.notes
    });
    if (error) throw error;
  },
  async updateInventoryItem(userId: string, item: InventoryItem) {
    const { error } = await supabase.from('inventory').update({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      cost_price: item.costPrice,
      selling_price: item.sellingPrice,
      date_added: item.dateAdded,
      last_updated: item.lastUpdated,
      low_stock_threshold: item.lowStockThreshold,
      supplier: item.supplier,
      notes: item.notes
    }).eq('id', item.id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteInventoryItem(userId: string, id: string) {
    const { error } = await supabase.from('inventory').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Settings
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    if (!data) return null;
    return {
      businessName: data.business_name,
      businessEmail: data.business_email,
      businessPhone: data.business_phone,
      businessAddress: data.business_address,
      businessLogoUrl: data.business_logo_url
    } as BusinessSettings;
  },
  async updateSettings(userId: string, settings: BusinessSettings) {
    const { error } = await supabase.from('business_settings').upsert({
      user_id: userId,
      business_name: settings.businessName,
      business_email: settings.businessEmail,
      business_phone: settings.businessPhone,
      business_address: settings.businessAddress,
      business_logo_url: settings.businessLogoUrl,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  }
};
