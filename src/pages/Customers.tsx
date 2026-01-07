"use client";

import React from 'react';
import CustomerListTable from '@/components/customers/CustomerListTable';
import { Separator } from '@/components/ui/separator';
import CustomerAnalyticsCard from '@/components/customers/CustomerAnalyticsCard'; // Import the new card

const Customers = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Customer Management</h1>
      <p className="text-gray-600">View and manage details for all your customers.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* Adjusted grid layout */}
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-semibold">Customer Insights</h2>
          <CustomerAnalyticsCard /> {/* Add the new analytics card here */}
        </div>
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-semibold">All Customers</h2>
          <CustomerListTable />
        </div>
      </div>
    </div>
  );
};

export default Customers;