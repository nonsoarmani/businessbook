import React from 'react';
import ReceiptEntryForm from '@/components/receipts/ReceiptEntryForm';
import ReceiptListTable from '@/components/receipts/ReceiptListTable';
import { Separator } from '@/components/ui/separator';

const Receipts = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Receipt Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Generate New Receipt</h2>
          <ReceiptEntryForm />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-semibold">Receipt History</h2>
          <ReceiptListTable />
        </div>
      </div>
    </div>
  );
};

export default Receipts;