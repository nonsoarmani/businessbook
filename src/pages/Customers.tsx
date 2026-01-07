"use client";

import React from 'react';
import CustomerListTable from '@/components/customers/CustomerListTable';
import { Separator } from '@/components/ui/separator';

const Customers = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Customer Management</h1>
      <p className="text-gray-600">View and manage details for all your customers.</p>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold">All Customers</h2>
        <CustomerListTable />
      </div>
    </div>
  );
};

export default Customers;