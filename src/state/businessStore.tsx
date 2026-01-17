"use client";
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { BusinessState, BusinessAction, Sale, Expense, Debt, Receipt, BusinessSettings, Customer } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';

// Import the useLocalStorage hook

const initialSettings: BusinessSettings = {
  businessName: 'BusinessBook',
  businessEmail: 'info@businessbook.com',
  businessPhone: '+234 800 123 4567',
  businessAddress: '123 Business Street, City, State',
  businessLogoUrl: '',
};

const initialState: BusinessState = {
  sales: [],
  expenses: [],
  debts: [],
  receipts: [],
  customers: [], // Initialize empty customers array
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
    case 'ADD_CUSTOMER': // New customer actions
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
  // Use useLocalStorage to persist the state
  const [persistedState, setPersistedState] = useLocalStorage<BusinessState>('businessBookState', initialState);
  const [state, dispatch] = useReducer(businessReducer, persistedState);

  // Update local storage whenever the state changes
  React.useEffect(() => {
    setPersistedState(state);
  }, [state, setPersistedState]);

  return (
    <BusinessContext.Provider value={{ state, dispatch }}>
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