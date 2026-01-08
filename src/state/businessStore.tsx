"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { BusinessState, BusinessAction, Sale, Expense, Debt, Receipt } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { supabase } from '@/lib/supabase';
import { useUser } from './userStore'; // Import useUser

const initialState: BusinessState = {
  sales: [],
  expenses: [],
  debts: [],
  receipts: [],
  businessName: "My Business",
  businessPhone: "08012345678",
  businessLocation: "Lagos, Nigeria",
  isDataLoaded: false, // Initialize as false
};

const businessReducer = (state: BusinessState, action: BusinessAction): BusinessState => {
  switch (action.type) {
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id ? { ...sale, ...action.payload } : sale
        ),
      };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(sale => sale.id !== action.payload.id),
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? { ...expense, ...action.payload } : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload.id),
      };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.payload] };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map(debt =>
          debt.id === action.payload.id ? { ...debt, ...action.payload } : debt
        ),
      };
    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter(debt => debt.id !== action.payload.id),
      };
    case 'MARK_DEBT_PAID':
      return {
        ...state,
        debts: state.debts.map(debt =>
          debt.id === action.payload.id
            ? { ...debt, status: 'paid', datePaid: action.payload.datePaid }
            : debt
        ),
      };
    case 'ADD_RECEIPT':
      return { ...state, receipts: [...state.receipts, action.payload] };
    case 'UPDATE_RECEIPT':
      return {
        ...state,
        receipts: state.receipts.map(receipt =>
          receipt.id === action.payload.id ? { ...receipt, ...action.payload } : receipt
        ),
      };
    case 'DELETE_RECEIPT':
      return {
        ...state,
        receipts: state.receipts.filter(receipt => receipt.id !== action.payload.id),
      };
    case 'SET_BUSINESS_INFO':
      return {
        ...state,
        businessName: action.payload.businessName,
        businessPhone: action.payload.businessPhone,
        businessLocation: action.payload.businessLocation,
      };
    case 'UPDATE_CUSTOMER_DETAILS':
      const { oldName, oldPhone, newName, newPhone } = action.payload;
      return {
        ...state,
        sales: state.sales.map(sale =>
          (sale.customerName === oldName && sale.customerPhone === oldPhone) ||
          (sale.customerName === oldName && !oldPhone && !sale.customerPhone)
            ? { ...sale, customerName: newName, customerPhone: newPhone }
            : sale
        ),
        debts: state.debts.map(debt =>
          (debt.customerName === oldName && debt.phone === oldPhone)
            ? { ...debt, customerName: newName, phone: newPhone }
            : debt
        ),
        receipts: state.receipts.map(receipt =>
          (receipt.customerName === oldName && receipt.customerPhone === oldPhone) ||
          (receipt.customerName === oldName && !oldPhone && !receipt.customerPhone)
            ? { ...receipt, customerName: newName, customerPhone: newPhone }
            : receipt
        ),
      };
    case 'DELETE_CUSTOMER_DATA':
      const { customerName, customerPhone } = action.payload;
      return {
        ...state,
        sales: state.sales.filter(sale =>
          !(sale.customerName === customerName && (sale.customerPhone === customerPhone || (!customerPhone && !sale.customerPhone)))
        ),
        debts: state.debts.filter(debt =>
          !(debt.customerName === customerName && debt.phone === customerPhone)
        ),
        receipts: state.receipts.filter(receipt =>
          !(receipt.customerName === customerName && (receipt.customerPhone === customerPhone || (!customerPhone && !receipt.customerPhone)))
        ),
      };
    case 'RESET_ALL_DATA':
      return {
        ...initialState,
        businessName: state.businessName,
        businessPhone: state.businessPhone,
        businessLocation: state.businessLocation,
        isDataLoaded: true, // Data is reset, so it's "loaded"
      };
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        sales: action.payload.sales,
        expenses: action.payload.expenses,
        debts: action.payload.debts,
        receipts: action.payload.receipts,
        businessName: action.payload.businessName,
        businessPhone: action.payload.businessPhone,
        businessLocation: action.payload.businessLocation,
        isDataLoaded: true,
      };
    case 'SET_DATA_LOADED':
      return { ...state, isDataLoaded: action.payload };
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
  const { user, session, loading: userLoading } = useUser();
  const [businessName, setBusinessName] = useLocalStorage<string>('businessName', initialState.businessName);
  const [businessPhone, setBusinessPhone] = useLocalStorage<string>('businessPhone', initialState.businessPhone);
  const [businessLocation, setBusinessLocation] = useLocalStorage<string>('businessLocation', initialState.businessLocation);

  const [state, dispatch] = useReducer(businessReducer, {
    ...initialState,
    businessName,
    businessPhone,
    businessLocation,
  });

  // Effect to update local storage for business info when state changes
  useEffect(() => {
    setBusinessName(state.businessName);
    setBusinessPhone(state.businessPhone);
    setBusinessLocation(state.businessLocation);
  }, [state.businessName, state.businessPhone, state.businessLocation, setBusinessName, setBusinessPhone, setBusinessLocation]);

  // Effect to load data from Supabase when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (user && session && !state.isDataLoaded) {
        console.log("Loading user data from Supabase for user:", user.id);
        const userId = user.id;

        // Fetch sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId);
        if (salesError) console.error("Error fetching sales:", salesError);

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId);
        if (expensesError) console.error("Error fetching expenses:", expensesError);

        // Fetch debts
        const { data: debtsData, error: debtsError } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', userId);
        if (debtsError) console.error("Error fetching debts:", debtsError);

        // Fetch receipts
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', userId);
        if (receiptsError) console.error("Error fetching receipts:", receiptsError);

        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            ...state, // Keep existing business info from local storage
            sales: salesData || [],
            expenses: expensesData || [],
            debts: debtsData || [],
            receipts: receiptsData || [],
            isDataLoaded: true,
          },
        });
      } else if (!user && state.isDataLoaded) {
        // Clear data if user logs out
        dispatch({ type: 'RESET_ALL_DATA' });
        dispatch({ type: 'SET_DATA_LOADED', payload: false });
      }
    };

    if (!userLoading) {
      loadUserData();
    }
  }, [user, session, userLoading, state.isDataLoaded]); // Depend on user, session, and isDataLoaded

  // Middleware to sync actions with Supabase
  const supabaseDispatch: React.Dispatch<BusinessAction> = async (action) => {
    const userId = user?.id;
    if (!userId && action.type !== 'SET_BUSINESS_INFO' && action.type !== 'SET_INITIAL_DATA' && action.type !== 'SET_DATA_LOADED' && action.type !== 'RESET_ALL_DATA') {
      console.warn("Attempted Supabase action without authenticated user:", action.type);
      return;
    }

    switch (action.type) {
      case 'ADD_SALE': {
        const newSale = { ...action.payload, user_id: userId };
        const { error } = await supabase.from('sales').insert(newSale);
        if (error) console.error("Error adding sale to Supabase:", error);
        break;
      }
      case 'UPDATE_SALE': {
        const { error } = await supabase.from('sales').update(action.payload).eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error updating sale in Supabase:", error);
        break;
      }
      case 'DELETE_SALE': {
        const { error } = await supabase.from('sales').delete().eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error deleting sale from Supabase:", error);
        break;
      }
      case 'ADD_EXPENSE': {
        const newExpense = { ...action.payload, user_id: userId };
        const { error } = await supabase.from('expenses').insert(newExpense);
        if (error) console.error("Error adding expense to Supabase:", error);
        break;
      }
      case 'UPDATE_EXPENSE': {
        const { error } = await supabase.from('expenses').update(action.payload).eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error updating expense in Supabase:", error);
        break;
      }
      case 'DELETE_EXPENSE': {
        const { error } = await supabase.from('expenses').delete().eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error deleting expense from Supabase:", error);
        break;
      }
      case 'ADD_DEBT': {
        const newDebt = { ...action.payload, user_id: userId };
        const { error } = await supabase.from('debts').insert(newDebt);
        if (error) console.error("Error adding debt to Supabase:", error);
        break;
      }
      case 'UPDATE_DEBT': {
        const { error } = await supabase.from('debts').update(action.payload).eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error updating debt in Supabase:", error);
        break;
      }
      case 'DELETE_DEBT': {
        const { error } = await supabase.from('debts').delete().eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error deleting debt from Supabase:", error);
        break;
      }
      case 'MARK_DEBT_PAID': {
        const { error } = await supabase.from('debts').update({ status: 'paid', datePaid: action.payload.datePaid }).eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error marking debt paid in Supabase:", error);
        break;
      }
      case 'ADD_RECEIPT': {
        const newReceipt = { ...action.payload, user_id: userId };
        const { error } = await supabase.from('receipts').insert(newReceipt);
        if (error) console.error("Error adding receipt to Supabase:", error);
        break;
      }
      case 'UPDATE_RECEIPT': {
        const { error } = await supabase.from('receipts').update(action.payload).eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error updating receipt in Supabase:", error);
        break;
      }
      case 'DELETE_RECEIPT': {
        const { error } = await supabase.from('receipts').delete().eq('id', action.payload.id).eq('user_id', userId);
        if (error) console.error("Error deleting receipt from Supabase:", error);
        break;
      }
      case 'UPDATE_CUSTOMER_DETAILS': {
        // This action requires updating multiple tables.
        // Supabase RLS will ensure only the user's data is affected.
        const { oldName, oldPhone, newName, newPhone } = action.payload;

        // Update sales
        await supabase.from('sales')
          .update({ customerName: newName, customerPhone: newPhone })
          .eq('customerName', oldName)
          .eq('customerPhone', oldPhone || null) // Handle null/undefined phones
          .eq('user_id', userId);

        // Update debts
        await supabase.from('debts')
          .update({ customerName: newName, phone: newPhone })
          .eq('customerName', oldName)
          .eq('phone', oldPhone)
          .eq('user_id', userId);

        // Update receipts
        await supabase.from('receipts')
          .update({ customerName: newName, customerPhone: newPhone })
          .eq('customerName', oldName)
          .eq('customerPhone', oldPhone || null)
          .eq('user_id', userId);
        break;
      }
      case 'DELETE_CUSTOMER_DATA': {
        const { customerName, customerPhone } = action.payload;

        // Delete sales
        await supabase.from('sales')
          .delete()
          .eq('customerName', customerName)
          .eq('customerPhone', customerPhone || null)
          .eq('user_id', userId);

        // Delete debts
        await supabase.from('debts')
          .delete()
          .eq('customerName', customerName)
          .eq('phone', customerPhone)
          .eq('user_id', userId);

        // Delete receipts
        await supabase.from('receipts')
          .delete()
          .eq('customerName', customerName)
          .eq('customerPhone', customerPhone || null)
          .eq('user_id', userId);
        break;
      }
      case 'RESET_ALL_DATA': {
        // This action should only clear local state, Supabase data is handled by RLS on delete
        // If you wanted to delete all user data from Supabase, you'd need a server-side function.
        break;
      }
      default:
        break;
    }
    // After attempting Supabase action, dispatch to local reducer to update UI
    dispatch(action);
  };

  // If user data is still loading, show a loading indicator or null
  if (userLoading || (user && !state.isDataLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading your business data...</p>
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{ state, dispatch: supabaseDispatch }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};