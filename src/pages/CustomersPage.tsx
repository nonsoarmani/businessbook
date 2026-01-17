"use client";
import React from 'react';
import CustomerForm from '@/components/customers/CustomerForm';
import CustomerDisplay from '@/components/customers/CustomerDisplay';

const CustomersPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
      <p className="text-muted-foreground mb-8">Manage your customer contacts and export their information.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Add New Customer</h2>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <CustomerForm />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Customer Contacts</h2>
          <CustomerDisplay />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;