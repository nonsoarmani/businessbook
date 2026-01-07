"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn, isValidNigerianPhoneNumber } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Receipt } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const receiptFormSchema = z.object({
  receiptNumber: z.string().min(1, { message: 'Receipt number is required.' }),
  date: z.date({
    required_error: 'A date is required.',
  }),
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  customerPhone: z.string().optional().refine((phone) => !phone || isValidNigerianPhoneNumber(phone), {
    message: 'Valid Nigerian phone number (e.g., 08012345678) or leave empty.',
  }),
  items: z.string().min(1, { message: 'Items description is required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  paymentMethod: z.enum(['Cash', 'Transfer', 'POS'], {
    required_error: 'Payment method is required.',
  }),
  linkedSaleId: z.string().optional(), // Keep this for consistency, though not editable directly
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

interface EditReceiptDialogProps {
  receipt: Receipt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditReceiptDialog = ({ receipt, open, onOpenChange }: EditReceiptDialogProps) => {
  const { dispatch } = useBusiness();
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
  });

  useEffect(() => {
    if (receipt && open) {
      form.reset({
        receiptNumber: receipt.receiptNumber,
        date: new Date(receipt.date), // Ensure date is a Date object
        customerName: receipt.customerName,
        customerPhone: receipt.customerPhone || '',
        items: receipt.items,
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod,
        linkedSaleId: receipt.linkedSaleId,
      });
    }
  }, [receipt, open, form]);

  const onSubmit = (values: ReceiptFormValues) => {
    const updatedReceipt: Partial<Receipt> & { id: string } = {
      id: receipt.id,
      receiptNumber: values.receiptNumber,
      date: values.date,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: values.items,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      linkedSaleId: values.linkedSaleId,
    };

    dispatch({ type: 'UPDATE_RECEIPT', payload: updatedReceipt });
    toast.success(`Receipt ${updatedReceipt.receiptNumber} updated successfully!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Receipt</DialogTitle>
          <DialogDescription>
            Make changes to this receipt record. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="receiptNumber">Receipt Number</Label>
            <Input
              id="receiptNumber"
              {...form.register('receiptNumber')}
              placeholder="e.g., REC-0001"
            />
            {form.formState.errors.receiptNumber && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.receiptNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch('date') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('date') ? format(form.watch('date'), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch('date')}
                  onSelect={(date) => form.setValue('date', date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              {...form.register('customerName')}
              placeholder="e.g., John Doe"
            />
            {form.formState.errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
            <Input
              id="customerPhone"
              {...form.register('customerPhone')}
              placeholder="e.g., 08012345678"
            />
            {form.formState.errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerPhone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="items">Items/Services Description</Label>
            <Textarea
              id="items"
              {...form.register('items')}
              placeholder="e.g., 5 bags of rice, 2 cartons of milk"
            />
            {form.formState.errors.items && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.items.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="e.g., 50000"
              min="0"
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              onValueChange={(value: ReceiptFormValues['paymentMethod']) => form.setValue('paymentMethod', value)}
              value={form.watch('paymentMethod')}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.paymentMethod.message}</p>
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

export default EditReceiptDialog;