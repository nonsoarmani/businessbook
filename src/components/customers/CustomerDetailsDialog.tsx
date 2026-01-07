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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { isValidNigerianPhoneNumber } from '@/lib/utils';
import CustomerTransactionHistory from './CustomerTransactionHistory'; // Import new component

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col"> {/* Adjusted max-w and added flex-col for tabs */}
        <DialogHeader>
          <DialogTitle>Customer Details: {customer.name}</DialogTitle>
          <DialogDescription>
            View and manage details for <span className="font-semibold">{customer.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="flex-1 overflow-auto p-4 space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-auto p-4">
            <CustomerTransactionHistory customer={customer} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;