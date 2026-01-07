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
import { Sale } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';

interface DeleteSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteSaleDialog = ({ sale, open, onOpenChange }: DeleteSaleDialogProps) => {
  const { dispatch } = useBusiness();

  const handleDeleteSale = () => {
    dispatch({
      type: 'DELETE_SALE',
      payload: { id: sale.id },
    });
    toast.success(`Sale of ${formatNaira(sale.amount)} for "${sale.item}" deleted.`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the sale record for:
            <br />
            <span className="font-semibold">Item:</span> {sale.item}
            <br />
            <span className="font-semibold">Amount:</span> {formatNaira(sale.amount)}
            <br />
            <span className="font-semibold">Date:</span> {formatDate(sale.date)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDeleteSale} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Sale
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSaleDialog;