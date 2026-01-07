"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Receipt } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptCardProps {
  receipt: Receipt;
}

const ReceiptCard = ({ receipt }: ReceiptCardProps) => {
  const { state: { businessName, businessPhone, businessLocation } } = useBusiness();

  const handlePrint = () => {
    const printContent = document.getElementById(`receipt-print-${receipt.id}`);
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printArea = printContent.innerHTML;

      document.body.innerHTML = printArea;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore original page state and scripts
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div id={`receipt-print-${receipt.id}`} className="p-6">
        <CardHeader className="text-center pb-4 border-b border-dashed border-gray-300">
          <CardTitle className="text-2xl font-bold text-gray-800">{businessName}</CardTitle>
          <p className="text-sm text-gray-600">{businessLocation}</p>
          <p className="text-sm text-gray-600">{businessPhone}</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Receipt No:</span>
            <span>{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Date:</span>
            <span>{formatDate(receipt.date)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Customer:</span>
            <span>{receipt.customerName}</span>
          </div>
          {receipt.customerPhone && (
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Phone:</span>
              <span>{receipt.customerPhone}</span>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <p className="font-semibold text-sm">Items/Services:</p>
            <p className="text-sm pl-2">{receipt.items}</p>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-bold mt-4">
            <span>Total Amount:</span>
            <span>{formatNaira(receipt.amount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="font-semibold">Payment Method:</span>
            <span>{receipt.paymentMethod}</span>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Thank you for your business!</p>
        </CardContent>
      </div>
      <div className="p-4 border-t flex justify-center">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>
    </Card>
  );
};

export default ReceiptCard;