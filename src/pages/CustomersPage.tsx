"use client";
import React, { useState } from 'react';
import CustomerForm from '@/components/customers/CustomerForm';
import CustomerDisplay from '@/components/customers/CustomerDisplay';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const CustomersPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer contacts and their information.</p>
        </div>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(false)} className="w-full md:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="w-full">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Add New Customer</h2>
              <p className="text-sm text-muted-foreground">Enter the contact details of your new customer.</p>
            </div>
            <CustomerForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      ) : (
        <CustomerDisplay />
      )}
    </div>
  );
};

export default CustomersPage;