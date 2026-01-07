"use client";

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { BusinessState, BusinessAction, Sale, Expense, Debt, Receipt } from '@/types';

const initialState: BusinessState = {
  sales: [],
  expenses: [],
  debts: [],
  receipts: [],
  businessName: "My Business", // Default values
  businessPhone: "08012345678",
  businessLocation: "Lagos, Nigeria",
};

const businessReducer = (state: BusinessState, action: BusinessAction): BusinessState => {
  switch (action.type) {
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.payload] };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map(debt =>
          debt.id === action.payload.id ? { ...debt, ...action.payload } : debt
        ),
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
    case 'SET_BUSINESS_INFO':
      return {
        ...state,
        businessName: action.payload.businessName,
        businessPhone: action.payload.businessPhone,
        businessLocation: action.payload.businessLocation,
      };
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
  const [state, dispatch] = useReducer(businessReducer, initialState);

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