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
import { Expense } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';

interface DeleteExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteExpenseDialog = ({ expense, open, onOpenChange }: DeleteExpenseDialogProps) => {
  const { dispatch } = useBusiness();

  const handleDeleteExpense = () => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: { id: expense.id },
    });
    toast.success(`Expense of ${formatNaira(expense.amount)} for "${expense.name}" deleted.`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the expense record for:
            <br />
            <span className="font-semibold">Name:</span> {expense.name}
            <br />
            <span className="font-semibold">Amount:</span> {formatNaira(expense.amount)}
            <br />
            <span className="font-semibold">Date:</span> {formatDate(expense.date)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDeleteExpense} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Expense
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExpenseDialog;