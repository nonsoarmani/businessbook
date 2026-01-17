"use client";
import React from 'react';
import SaleForm from '@/components/sales/SaleForm';
import SalesDisplay from '@/components/sales/SalesDisplay';

const SalesPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Sales Tracking</h1>
      <p className="text-muted-foreground mb-6">Manage your sales records here.</p>
      
      {/* Sales Entry Form */}
      <div className="mb-8 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Record New Sale</h2>
        <SaleForm />
      </div>
      
      {/* Sales Display */}
      <div>
        <SalesDisplay />
      </div>
    </div>
  );
};

export default SalesPage;