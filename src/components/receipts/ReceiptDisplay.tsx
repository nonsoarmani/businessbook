"use client";

import React, { useState, useRef } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO } from 'date-fns';
import { Printer, Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatNaira, exportReceiptToPDF } from '@/lib/utils';
import { Receipt } from '@/types';
import { useReactToPrint } from 'react-to-print';

const ReceiptDisplay = () => {
  const { state } = useBusiness();
  const { receipts, settings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredReceipts = React.useMemo(() => {
    let currentReceipts = [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        print-color-adjust: exact !important;
      }
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
            <div className="overflow-x-auto">
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
          </div>
        </CardContent>
      </Card>

      {/* Selected Receipt Display */}
      {selectedReceipt && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Receipt Preview */}
          <div className="flex-1 border rounded-lg p-8 bg-white text-black shadow-sm" ref={receiptRef}>
            <div className="flex justify-between items-start mb-8">
              <div>
                {settings.businessLogoUrl ? (
                  <img 
                    src={settings.businessLogoUrl} 
                    alt="Logo" 
                    className="h-16 w-auto mb-4 object-contain" 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-16 w-16 bg-primary/10 rounded flex items-center justify-center mb-4">
                    <span className="text-primary font-bold text-2xl">{settings.businessName?.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">{settings.businessName}</h2>
                <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  <p>{settings.businessAddress}</p>
                  <p>{settings.businessPhone}</p>
                  <p>{settings.businessEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black text-primary/20 uppercase tracking-widest mb-4">Receipt</h1>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Receipt Number</p>
                  <p className="text-lg font-mono font-bold">#{selectedReceipt.receiptNumber}</p>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-4">Date</p>
                  <p className="text-base font-medium">{format(parseISO(selectedReceipt.date), 'PPP')}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 mb-8 flex justify-between items-center border border-primary/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Billed To</p>
                <p className="text-lg font-bold">{selectedReceipt.customerName}</p>
                {selectedReceipt.customerPhone && (
                  <p className="text-sm text-muted-foreground">{selectedReceipt.customerPhone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Payment Method</p>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {selectedReceipt.paymentMethod}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</th>
                    <th className="text-right py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-6 text-base font-medium leading-relaxed">{selectedReceipt.items}</td>
                    <td className="py-6 text-right text-lg font-bold align-top">{formatNaira(selectedReceipt.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t-2 border-primary pt-6">
              <div className="w-full max-w-[250px] space-y-3">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-sm font-semibold uppercase tracking-wider">Subtotal</span>
                  <span className="text-base font-medium">{formatNaira(selectedReceipt.amount)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                  <span className="text-lg font-black uppercase tracking-tighter text-primary">Total Paid</span>
                  <span className="text-2xl font-black text-primary">{formatNaira(selectedReceipt.amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm font-bold text-primary/40 uppercase tracking-widest italic mb-2">Thank you for your business!</p>
              <p className="text-xs text-muted-foreground">Generated by BusinessBook Jotter</p>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="w-full md:w-64 space-y-4 no-print">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handlePrint} className="w-full shadow-lg shadow-primary/20">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={handleDownloadPdf} className="w-full bg-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Separator className="my-4 bg-primary/10" />
                <Button variant="ghost" onClick={() => setSelectedReceipt(null)} className="w-full">
                  Back to History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptDisplay;