"use client";

import React from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseDisplay from '@/components/expenses/ExpenseDisplay';

const ExpensesPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Expense Tracking</h1>
      <p className="text-muted-foreground">Record and monitor your business expenses.</p>
      {/* Expense Entry Form */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Record New Expense</h2>
        <ExpenseForm />
      </div>
      {/* Expense Display */}
      <div className="mt-8">
        <ExpenseDisplay />
      </div>
    </div>
  );
};

export default ExpensesPage;