"use client";
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { BusinessState, BusinessAction, BusinessSettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { businessService } from '@/integrations/supabase/service';
import { toast } from 'sonner';

// Re-export toast for convenience if needed or use directly
const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-center',
  });
};

const showError = (message: string) => {
  toast.error(message, {
    position: 'top-center',
  });
};

const initialSettings: BusinessSettings = {
  businessName: 'My Business Jotter',
  businessEmail: 'info@businessjotter.com',
  businessPhone: '+234 800 123 4567',
  businessAddress: '123 Business Street, City, State',
  businessLogoUrl: 'https://kugxbisasbylnnzpvrzw.supabase.co/storage/v1/object/public/user_uploads/Jotter%20Logo%203_2.png',
};

const initialState: BusinessState = {
  sales: [],
  expenses: [],
  debts: [],
  receipts: [],
  customers: [],
  tasks: [],
  inventory: [],
  settings: initialSettings,
};

const businessReducer = (state: BusinessState, action: BusinessAction): BusinessState => {
  switch (action.type) {
    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload],
      };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? action.payload : sale
        ),
      };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter((sale) => sale.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      };
    case 'ADD_DEBT':
      return {
        ...state,
        debts: [...state.debts, action.payload],
      };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map((debt) =>
          debt.id === action.payload.id ? action.payload : debt
        ),
      };
    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter((debt) => debt.id !== action.payload),
      };
    case 'MARK_DEBT_PAID':
      return {
        ...state,
        debts: state.debts.map((debt) =>
          debt.id === action.payload.id
            ? {
                ...debt,
                status: 'paid',
                datePaid: action.payload.datePaid,
                paidAmount: debt.originalAmount,
              }
            : debt
        ),
      };
    case 'ADD_RECEIPT':
      return {
        ...state,
        receipts: [...state.receipts, action.payload],
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload],
      };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter((customer) => customer.id !== action.payload),
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      };
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_INVENTORY_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity, lastUpdated: action.payload.lastUpdated }
            : item
        ),
      };
    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'CLEAR_ALL_DATA':
      return initialState;
    default:
      return state;
  }
};

interface BusinessContextType {
  state: BusinessState;
  dispatch: React.Dispatch<BusinessAction>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [state, dispatch] = useReducer(businessReducer, initialState);

  // Fetch data from Supabase when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [
          sales,
          expenses,
          debts,
          receipts,
          customers,
          tasks,
          inventory,
          settings
        ] = await Promise.all([
          businessService.getSales(user.id),
          businessService.getExpenses(user.id),
          businessService.getDebts(user.id),
          businessService.getReceipts(user.id),
          businessService.getCustomers(user.id),
          businessService.getTasks(user.id),
          businessService.getInventory(user.id),
          businessService.getSettings(user.id)
        ]);

        dispatch({
          type: 'SET_STATE',
          payload: {
            sales,
            expenses,
            debts,
            receipts,
            customers,
            tasks,
            inventory,
            settings: settings || state.settings
          }
        });
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Failed to sync data with Supabase');
      }
    };

    fetchData();
  }, [user]);

  return (
    <BusinessContext.Provider value={{ state, dispatch }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  const { user } = useAuth();

  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }

  const { state, dispatch } = context;

  // Enhanced dispatchers that also sync with Supabase
  const addSale = async (sale: any) => {
    dispatch({ type: 'ADD_SALE', payload: sale });
    if (user) {
      try {
        await businessService.addSale(user.id, sale);
      } catch (error) {
        console.error('Error adding sale to Supabase:', error);
        toast.error('Failed to save sale to cloud');
      }
    }
  };

  const updateSale = async (sale: any) => {
    dispatch({ type: 'UPDATE_SALE', payload: sale });
    if (user) {
      try {
        await businessService.updateSale(user.id, sale);
      } catch (error) {
        console.error('Error updating sale in Supabase:', error);
        toast.error('Failed to update sale in cloud');
      }
    }
  };

  const deleteSale = async (id: string) => {
    dispatch({ type: 'DELETE_SALE', payload: id });
    if (user) {
      try {
        await businessService.deleteSale(user.id, id);
      } catch (error) {
        console.error('Error deleting sale from Supabase:', error);
        toast.error('Failed to delete sale from cloud');
      }
    }
  };

  const addExpense = async (expense: any) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    if (user) {
      try {
        await businessService.addExpense(user.id, expense);
      } catch (error) {
        console.error('Error adding expense to Supabase:', error);
        toast.error('Failed to save expense to cloud');
      }
    }
  };

  const updateExpense = async (expense: any) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    if (user) {
      try {
        await businessService.updateExpense(user.id, expense);
      } catch (error) {
        console.error('Error updating expense in Supabase:', error);
        toast.error('Failed to update expense in cloud');
      }
    }
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    if (user) {
      try {
        await businessService.deleteExpense(user.id, id);
      } catch (error) {
        console.error('Error deleting expense from Supabase:', error);
        toast.error('Failed to delete expense from cloud');
      }
    }
  };

  const addDebt = async (debt: any) => {
    dispatch({ type: 'ADD_DEBT', payload: debt });
    if (user) {
      try {
        await businessService.addDebt(user.id, debt);
      } catch (error) {
        console.error('Error adding debt to Supabase:', error);
        toast.error('Failed to save debt to cloud');
      }
    }
  };

  const updateDebt = async (debt: any) => {
    dispatch({ type: 'UPDATE_DEBT', payload: debt });
    if (user) {
      try {
        await businessService.updateDebt(user.id, debt);
      } catch (error) {
        console.error('Error updating debt in Supabase:', error);
        toast.error('Failed to update debt in cloud');
      }
    }
  };

  const deleteDebt = async (id: string) => {
    dispatch({ type: 'DELETE_DEBT', payload: id });
    if (user) {
      try {
        await businessService.deleteDebt(user.id, id);
      } catch (error) {
        console.error('Error deleting debt from Supabase:', error);
        toast.error('Failed to delete debt from cloud');
      }
    }
  };

  const markDebtPaid = async (payload: { id: string; datePaid: string; paidAmount: number }) => {
    dispatch({ type: 'MARK_DEBT_PAID', payload });
    if (user) {
      try {
        const debt = state.debts.find(d => d.id === payload.id);
        if (debt) {
          await businessService.updateDebt(user.id, {
            ...debt,
            status: 'paid',
            datePaid: payload.datePaid,
            paidAmount: debt.originalAmount,
            amountOwed: 0
          });
        }
      } catch (error) {
        console.error('Error marking debt as paid in Supabase:', error);
        toast.error('Failed to update debt in cloud');
      }
    }
  };

  const addReceipt = async (receipt: any) => {
    dispatch({ type: 'ADD_RECEIPT', payload: receipt });
    if (user) {
      try {
        await businessService.addReceipt(user.id, receipt);
      } catch (error) {
        console.error('Error adding receipt to Supabase:', error);
        toast.error('Failed to save receipt to cloud');
      }
    }
  };

  const addCustomer = async (customer: any) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    if (user) {
      try {
        await businessService.addCustomer(user.id, customer);
      } catch (error) {
        console.error('Error adding customer to Supabase:', error);
        toast.error('Failed to save customer to cloud');
      }
    }
  };

  const updateCustomer = async (customer: any) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
    if (user) {
      try {
        await businessService.updateCustomer(user.id, customer);
      } catch (error) {
        console.error('Error updating customer in Supabase:', error);
        toast.error('Failed to update customer in cloud');
      }
    }
  };

  const deleteCustomer = async (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    if (user) {
      try {
        await businessService.deleteCustomer(user.id, id);
      } catch (error) {
        console.error('Error deleting customer from Supabase:', error);
        toast.error('Failed to delete customer from cloud');
      }
    }
  };

  const addTask = async (task: any) => {
    dispatch({ type: 'ADD_TASK', payload: task });
    if (user) {
      try {
        await businessService.addTask(user.id, task);
      } catch (error) {
        console.error('Error adding task to Supabase:', error);
        toast.error('Failed to save task to cloud');
      }
    }
  };

  const updateTask = async (task: any) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
    if (user) {
      try {
        await businessService.updateTask(user.id, task);
      } catch (error) {
        console.error('Error updating task in Supabase:', error);
        toast.error('Failed to update task in cloud');
      }
    }
  };

  const deleteTask = async (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    if (user) {
      try {
        await businessService.deleteTask(user.id, id);
      } catch (error) {
        console.error('Error deleting task from Supabase:', error);
        toast.error('Failed to delete task from cloud');
      }
    }
  };

  const addInventoryItem = async (item: any) => {
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
    if (user) {
      try {
        await businessService.addInventoryItem(user.id, item);
      } catch (error) {
        console.error('Error adding inventory item to Supabase:', error);
        toast.error('Failed to save inventory item to cloud');
      }
    }
  };

  const updateInventoryItem = async (item: any) => {
    dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: item });
    if (user) {
      try {
        await businessService.updateInventoryItem(user.id, item);
      } catch (error) {
        console.error('Error updating inventory item in Supabase:', error);
        toast.error('Failed to update inventory item in cloud');
      }
    }
  };

  const deleteInventoryItem = async (id: string) => {
    dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: id });
    if (user) {
      try {
        await businessService.deleteInventoryItem(user.id, id);
      } catch (error) {
        console.error('Error deleting inventory item from Supabase:', error);
        toast.error('Failed to delete inventory item from cloud');
      }
    }
  };

  const updateInventoryQuantity = async (payload: { id: string; quantity: number; lastUpdated: string }) => {
    dispatch({ type: 'UPDATE_INVENTORY_QUANTITY', payload });
    if (user) {
      try {
        const item = state.inventory.find(i => i.id === payload.id);
        if (item) {
          await businessService.updateInventoryItem(user.id, {
            ...item,
            quantity: item.quantity + payload.quantity,
            lastUpdated: payload.lastUpdated
          });
        }
      } catch (error) {
        console.error('Error updating inventory quantity in Supabase:', error);
        toast.error('Failed to update inventory quantity in cloud');
      }
    }
  };

  const updateSettings = async (settings: BusinessSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    if (user) {
      try {
        await businessService.updateSettings(user.id, settings);
      } catch (error) {
        console.error('Error updating settings in Supabase:', error);
        showError('Failed to save settings to cloud');
      }
    }
  };

  const updateLogo = async (logoUrl: string) => {
    if (state.settings) {
      const updatedSettings = { ...state.settings, businessLogoUrl: logoUrl };
      await updateSettings(updatedSettings);
    }
  };

  return {
    state,
    dispatch,
    addSale,
    updateSale,
    deleteSale,
    addExpense,
    updateExpense,
    deleteExpense,
    addDebt,
    updateDebt,
    deleteDebt,
    markDebtPaid,
    addReceipt,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTask,
    updateTask,
    deleteTask,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateInventoryQuantity,
    updateSettings,
    updateLogo
  };
};