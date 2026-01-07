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
import { Debt } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';

interface DeleteDebtDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteDebtDialog = ({ debt, open, onOpenChange }: DeleteDebtDialogProps) => {
  const { dispatch } = useBusiness();

  const handleDeleteDebt = () => {
    dispatch({
      type: 'DELETE_DEBT',
      payload: { id: debt.id },
    });
    toast.success(`Debt of ${formatNaira(debt.amountOwed)} from "${debt.customerName}" deleted.`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the debt record for:
            <br />
            <span className="font-semibold">Customer:</span> {debt.customerName}
            <br />
            <span className="font-semibold">Amount Owed:</span> {formatNaira(debt.amountOwed)}
            <br />
            <span className="font-semibold">Items Sold:</span> {debt.itemsSold}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDeleteDebt} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Debt
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDebtDialog;