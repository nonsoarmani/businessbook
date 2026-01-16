"use client";

import React from 'react';
import ReceiptForm from '@/components/receipts/ReceiptForm';
import ReceiptDisplay from '@/components/receipts/ReceiptDisplay';

const ReceiptsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Receipt Generator</h1>
      <p className="text-muted-foreground">Generate and share professional receipts for your customers.</p>
      {/* Receipt Form */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Receipt</h2>
        <ReceiptForm />
      </div>
      {/* Receipt Display */}
      <div className="mt-8">
        <ReceiptDisplay />
      </div>
    </div>
  );
};

export default ReceiptsPage;