"use client";

import React from 'react';

const ReceiptsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Receipt Generator</h1>
      <p className="text-muted-foreground">Generate and share professional receipts for your customers.</p>
      {/* Receipt Form */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Receipt</h2>
        {/* Form will go here */}
        <p>Receipt form coming soon...</p>
      </div>
      {/* Receipt Display */}
      <div className="mt-8 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Generated Receipt</h2>
        {/* Receipt display and actions will go here */}
        <p>Receipt display coming soon...</p>
      </div>
    </div>
  );
};

export default ReceiptsPage;