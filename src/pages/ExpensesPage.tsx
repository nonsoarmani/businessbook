"use client";
import React from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseDisplay from '@/components/expenses/ExpenseDisplay';

const ExpensesPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Expense Tracking</h1>
      <p className="text-muted-foreground mb-6">Record and monitor your business expenses.</p>
      
      {/* Expense Entry Form */}
      <div className="mb-8 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Record New Expense</h2>
        <ExpenseForm />
      </div>
      
      {/* Expense Display */}
      <div>
        <ExpenseDisplay />
      </div>
    </div>
  );
};

export default ExpensesPage;