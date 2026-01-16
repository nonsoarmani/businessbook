"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { Printer, Download, Search, FileText } from 'lucide-react';
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
import { cn, formatNaira, exportToTXT } from '@/lib/utils';
import { Receipt } from '@/types';
import { useReactToPrint } from 'react-to-print';

const ReceiptDisplay = () => {
  const { state } = useBusiness();
  const { receipts } = state;

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
  });

  const handleDownload = () => {
    if (selectedReceipt) {
      const receiptContent = `
        --- OFFICIAL RECEIPT ---
        Receipt Number: ${selectedReceipt.receiptNumber}
        Date: ${format(parseISO(selectedReceipt.date), 'dd/MM/yyyy')}
        Customer Name: ${selectedReceipt.customerName}
        Customer Phone: ${selectedReceipt.customerPhone || 'N/A'}
        ------------------------
        Items/Services:
        ${selectedReceipt.items}
        ------------------------
        Amount: ${formatNaira(selectedReceipt.amount)}
        Payment Method: ${selectedReceipt.paymentMethod}
        ------------------------
        Thank you for your business!
        ---
      `;
      exportToTXT(`Receipt_${selectedReceipt.receiptNumber}`, receiptContent);
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Receipt #{selectedReceipt.receiptNumber}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download TXT
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={receiptRef} className="p-6 border rounded-md bg-white text-gray-900 print:shadow-none print:border-0">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">BUSINESS NAME</h2> {/* Placeholder for business name */}
                <p className="text-sm text-gray-600">Your Business Address, City, State</p>
                <p className="text-sm text-gray-600">Phone: +234 800 123 4567 | Email: info@business.com</p>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold">Receipt No:</p>
                  <p className="text-lg font-bold">{selectedReceipt.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">Date:</p>
                  <p className="text-lg font-bold">{format(parseISO(selectedReceipt.date), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold">Customer Name:</p>
                <p className="text-base">{selectedReceipt.customerName}</p>
                {selectedReceipt.customerPhone && (
                  <>
                    <p className="text-sm font-semibold mt-2">Customer Phone:</p>
                    <p className="text-base">{selectedReceipt.customerPhone}</p>
                  </>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Items/Services:</h3>
                <p className="whitespace-pre-wrap">{selectedReceipt.items}</p>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <p className="text-xl font-semibold">Total Amount:</p>
                <p className="text-3xl font-bold text-primary">{formatNaira(selectedReceipt.amount)}</p>
              </div>

              <div className="text-right mb-6">
                <p className="text-sm font-semibold">Payment Method:</p>
                <p className="text-base">{selectedReceipt.paymentMethod}</p>
              </div>

              <div className="text-center text-sm text-gray-600 mt-8">
                <p>Thank you for your business!</p>
                <p>Please come again.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceiptDisplay;