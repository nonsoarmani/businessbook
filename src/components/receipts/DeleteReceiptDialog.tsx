"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Receipt } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';

interface DeleteReceiptDialogProps {
  receipt: Receipt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteReceiptDialog = ({ receipt, open, onOpenChange }: DeleteReceiptDialogProps) => {
  const { dispatch } = useBusiness();

  const handleDeleteReceipt = () => {
    dispatch({
      type: 'DELETE_RECEIPT',
      payload: { id: receipt.id },
    });
    toast.success(`Receipt ${receipt.receiptNumber} for ${formatNaira(receipt.amount)} deleted.`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the receipt record for:
            <br />
            <span className="font-semibold">Receipt No:</span> {receipt.receiptNumber}
            <br />
            <span className="font-semibold">Customer:</span> {receipt.customerName}
            <br />
            <span className="font-semibold">Amount:</span> {formatNaira(receipt.amount)}
            <br />
            <span className="font-semibold">Date:</span> {formatDate(receipt.date)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDeleteReceipt} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Receipt
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteReceiptDialog;