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
import { formatNaira } from '@/lib/utils';

interface MarkPaidDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarkPaidDialog = ({ debt, open, onOpenChange }: MarkPaidDialogProps) => {
  const { dispatch } = useBusiness();

  const handleMarkPaid = () => {
    dispatch({
      type: 'MARK_DEBT_PAID',
      payload: { id: debt.id, datePaid: new Date() },
    });
    toast.success(`Debt of ${formatNaira(debt.amountOwed)} from ${debt.customerName} marked as paid!`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Debt as Paid?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark the debt of <span className="font-semibold">{formatNaira(debt.amountOwed)}</span> from <span className="font-semibold">{debt.customerName}</span> as fully paid? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700 text-white">
              Mark Paid
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MarkPaidDialog;