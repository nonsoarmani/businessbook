"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { Printer, Download, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira, exportReceiptToPDF } from '@/lib/utils';
import { Receipt } from '@/types';
import { useReactToPrint } from 'react-to-print';

const ReceiptDisplay = () => {
  const { state } = useBusiness();
  const { receipts, settings } = state; // Destructure settings from state

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredReceipts = useMemo(() => {
    let currentReceipts = [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

    if (searchTerm) {
      currentReceipts = currentReceipts.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.items.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return currentReceipts;
  }, [receipts, searchTerm]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: selectedReceipt ? `Receipt_${selectedReceipt.receiptNumber}` : 'Receipt',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-only {
        display: block !important;
      }
      .no-print {
        display: none !important;
      }
    `,
  });

  const handleDownloadPdf = async () => {
    if (selectedReceipt && receiptRef.current) {
      await exportReceiptToPDF(receiptRef.current, `Receipt_${selectedReceipt.receiptNumber}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Receipt History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Receipt History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number, customer, or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>{receipt.receiptNumber}</TableCell>
                      <TableCell>{format(parseISO(receipt.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{receipt.customerName}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{receipt.items}</TableCell>
                      <TableCell className="text-right">{formatNaira(receipt.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No receipts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Receipt Display */}
      {selectedReceipt && (
        <Card className="no-print"> {/* Add no-print class to hide this card when printing */}
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Receipt #{selectedReceipt.receiptNumber}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={receiptRef} className="p-8 border rounded-md bg-white text-gray-900 shadow-lg print:shadow-none print:border-0 print:bg-white print:text-black">
              <div className="text-center mb-8">
                {settings.businessLogoUrl && (
                  <img src={settings.businessLogoUrl} alt="Business Logo" className="mx-auto h-16 mb-4" />
                )}
                <h2 className="text-4xl font-extrabold text-primary mb-2">{settings.businessName || 'BUSINESS NAME'}</h2>
                <p className="text-md text-gray-700">{settings.businessAddress || 'Your Business Address, City, State'}</p>
                <p className="text-md text-gray-700">
                  Phone: {settings.businessPhone || '+234 800 123 4567'} | Email: {settings.businessEmail || 'info@business.com'}
                </p>
              </div>

              <Separator className="my-6 border-gray-300" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Receipt Number:</p>
                  <p className="text-xl font-bold text-gray-900">{selectedReceipt.receiptNumber}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-semibold text-gray-600">Date:</p>
                  <p className="text-xl font-bold text-gray-900">{format(parseISO(selectedReceipt.date), 'dd/MM/yyyy')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600">Bill To:</p>
                  <p className="text-lg font-medium text-gray-900">{selectedReceipt.customerName}</p>
                  {selectedReceipt.customerPhone && (
                    <p className="text-base text-gray-700">Phone: {selectedReceipt.customerPhone}</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Items/Services:</h3>
                <div className="prose prose-sm max-w-none text-gray-800">
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedReceipt.items}</p>
                </div>
              </div>

              <Separator className="my-6 border-gray-300" />

              <div className="flex flex-col items-end space-y-4 mb-8">
                <div className="flex justify-between w-full max-w-xs">
                  <p className="text-xl font-semibold text-gray-800">Total Amount:</p>
                  <p className="text-3xl font-bold text-primary">{formatNaira(selectedReceipt.amount)}</p>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                  <p className="text-base font-semibold text-gray-700">Payment Method:</p>
                  <p className="text-lg font-medium text-gray-800">{selectedReceipt.paymentMethod}</p>
                </div>
              </div>

              <Separator className="my-6 border-gray-300" />

              <div className="text-center text-sm text-gray-600 mt-8">
                <p>Thank you for your business!</p>
                <p>We appreciate your patronage.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceiptDisplay;