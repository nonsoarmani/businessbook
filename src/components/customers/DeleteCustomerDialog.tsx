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
import { Customer } from '@/types';

interface DeleteCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCustomerDialog = ({ customer, open, onOpenChange }: DeleteCustomerDialogProps) => {
  const { dispatch } = useBusiness();

  const handleDeleteCustomer = () => {
    dispatch({
      type: 'DELETE_CUSTOMER_DATA',
      payload: { customerName: customer.name, customerPhone: customer.phone },
    });
    toast.success(`All data for customer "${customer.name}" deleted.`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ALL associated sales, debts, and receipts for:
            <br />
            <span className="font-semibold">Customer Name:</span> {customer.name}
            <br />
            <span className="font-semibold">Phone:</span> {customer.phone || 'N/A'}
            <br />
            This is a destructive action. Please confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700 text-white">
              Delete All Customer Data
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerDialog;