"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { isValidNigerianPhoneNumber } from '@/lib/utils';

const customerFormSchema = z.object({
  name: z.string().min(1, { message: 'Customer name is required.' }),
  phone: z.string().optional().refine((phone) => !phone || isValidNigerianPhoneNumber(phone), {
    message: 'Valid Nigerian phone number (e.g., 08012345678) or leave empty.',
  }),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerDetailsDialog = ({ customer, open, onOpenChange }: CustomerDetailsDialogProps) => {
  const { dispatch } = useBusiness();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  useEffect(() => {
    if (customer && open) {
      form.reset({
        name: customer.name,
        phone: customer.phone || '',
      });
    }
  }, [customer, open, form]);

  const onSubmit = (values: CustomerFormValues) => {
    if (values.name === customer.name && values.phone === customer.phone) {
      toast.info('No changes detected.');
      onOpenChange(false);
      return;
    }

    dispatch({
      type: 'UPDATE_CUSTOMER_DETAILS',
      payload: {
        oldName: customer.name,
        oldPhone: customer.phone,
        newName: values.name,
        newPhone: values.phone || '',
      },
    });
    toast.success(`Customer "${customer.name}" updated to "${values.name}".`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Details</DialogTitle>
          <DialogDescription>
            Update the name and phone number for <span className="font-semibold">{customer.name}</span>. This will update all associated sales, debts, and receipts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="e.g., John Doe"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="e.g., 08012345678"
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;