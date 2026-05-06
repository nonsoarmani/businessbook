"use client";

import React, { useState, useRef } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { Printer, Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
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
    contentRef: receiptRef,
    documentTitle: selectedReceipt ? `Receipt_${selectedReceipt.receiptNumber}` : 'Receipt',
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      body { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important;       }
      .print-only { display: block !important; }
      .no-print { display: none !important; }
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
        <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Receipt #{selectedReceipt.receiptNumber}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={receiptRef} 
              className="p-8 border rounded-md bg-white text-gray-900 shadow-lg print:shadow-none print:border-0 print:bg-white print:text-black overflow-x-auto"
            >
              {/* ... existing receipt content ... */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceiptDisplay;