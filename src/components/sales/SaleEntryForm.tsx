"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn, generateUniqueId, isValidNigerianPhoneNumber } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Sale, Debt } from '@/types';

const saleFormSchema = z.object({
  item: z.string().min(1, { message: 'Item/Service name is required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  paymentMethod: z.enum(['Cash', 'Transfer', 'POS', 'Credit'], {
    required_error: 'Payment method is required.',
  }),
  date: z.date({
    required_error: 'A date is required.',
  }),
  note: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'Credit') {
    if (!data.customerName || data.customerName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Customer name is required for credit sales.',
        path: ['customerName'],
      });
    }
    if (!data.customerPhone || !isValidNigerianPhoneNumber(data.customerPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid Nigerian phone number (e.g., 08012345678) is required for credit sales.',
        path: ['customerPhone'],
      });
    }
  }
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

const SaleEntryForm = () => {
  const { dispatch } = useBusiness();
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      item: '',
      amount: 0,
      paymentMethod: 'Cash',
      date: new Date(),
      note: '',
      customerName: '',
      customerPhone: '',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const onSubmit = (values: SaleFormValues) => {
    const newSale: Sale = {
      id: generateUniqueId(),
      date: values.date,
      item: values.item,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      note: values.note,
      customerName: values.paymentMethod === 'Credit' ? values.customerName : undefined,
      customerPhone: values.paymentMethod === 'Credit' ? values.customerPhone : undefined,
    };

    dispatch({ type: 'ADD_SALE', payload: newSale });

    if (values.paymentMethod === 'Credit') {
      const newDebt: Debt = {
        id: generateUniqueId(),
        customerName: values.customerName!,
        phone: values.customerPhone!,
        originalAmount: values.amount,
        amountOwed: values.amount,
        dateGiven: values.date,
        dueDate: new Date(values.date.getTime() + 7 * 24 * 60 * 60 * 1000), // Default due in 7 days
        itemsSold: values.item,
        status: 'active',
      };
      dispatch({ type: 'ADD_DEBT', payload: newDebt });
      toast.success(`Credit sale recorded and debt created for ${values.customerName}.`);
    } else {
      toast.success('Sale recorded successfully!');
    }

    form.reset({
      item: '',
      amount: 0,
      paymentMethod: 'Cash',
      date: new Date(),
      note: '',
      customerName: '',
      customerPhone: '',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="item">Item/Service Name</Label>
        <Input
          id="item"
          {...form.register('item')}
          placeholder="e.g., 5 bags of rice"
          autoFocus
        />
        {form.formState.errors.item && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.item.message}</p>
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
        <Label>Payment Method</Label>
        <RadioGroup
          onValueChange={(value: SaleFormValues['paymentMethod']) => form.setValue('paymentMethod', value)}
          value={paymentMethod}
          className="flex flex-wrap gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Cash" id="cash" />
            <Label htmlFor="cash">Cash</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Transfer" id="transfer" />
            <Label htmlFor="transfer">Transfer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="POS" id="pos" />
            <Label htmlFor="pos">POS</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Credit" id="credit" />
            <Label htmlFor="credit">Credit</Label>
          </div>
        </RadioGroup>
        {form.formState.errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.paymentMethod.message}</p>
        )}
      </div>

      {paymentMethod === 'Credit' && (
        <>
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
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              {...form.register('customerPhone')}
              placeholder="e.g., 08012345678"
            />
            {form.formState.errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerPhone.message}</p>
            )}
          </div>
        </>
      )}

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
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          {...form.register('note')}
          placeholder="Add any relevant notes about the sale"
        />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Save Sale</Button>
    </form>
  );
};

export default SaleEntryForm;