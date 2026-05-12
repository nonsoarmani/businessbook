"use client";
import React, { useState } from 'react';
import ReceiptForm from '@/components/receipts/ReceiptForm';
import ReceiptDisplay from '@/components/receipts/ReceiptDisplay';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const ReceiptsPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Generator</h1>
          <p className="text-muted-foreground">Generate and share professional receipts for your customers.</p>
        </div>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Receipt
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(false)} className="w-full md:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="w-full">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Create New Receipt</h2>
              <p className="text-sm text-muted-foreground">Select a sale or enter details to generate a receipt.</p>
            </div>
            <ReceiptForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      ) : (
        <ReceiptDisplay />
      )}
    </div>
  );
};

export default ReceiptsPage;