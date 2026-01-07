"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn, generateUniqueId, isValidNigerianPhoneNumber } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Debt } from '@/types';

const debtFormSchema = z.object({
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  phone: z.string().refine(isValidNigerianPhoneNumber, {
    message: 'Valid Nigerian phone number (e.g., 08012345678) is required.',
  }),
  amountOwed: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  dateGiven: z.date({
    required_error: 'Date given is required.',
  }),
  dueDate: z.date({
    required_error: 'Due date is required.',
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Due date cannot be in the past.",
  }),
  itemsSold: z.string().min(1, { message: 'Items sold description is required.' }),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

const DebtEntryForm = () => {
  const { dispatch } = useBusiness();
  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      amountOwed: 0,
      dateGiven: new Date(),
      dueDate: addDays(new Date(), 7), // Default due in 7 days
      itemsSold: '',
    },
  });

  const onSubmit = (values: DebtFormValues) => {
    const newDebt: Debt = {
      id: generateUniqueId(),
      customerName: values.customerName,
      phone: values.phone,
      originalAmount: values.amountOwed,
      amountOwed: values.amountOwed,
      dateGiven: values.dateGiven,
      dueDate: values.dueDate,
      itemsSold: values.itemsSold,
      status: 'active',
    };

    dispatch({ type: 'ADD_DEBT', payload: newDebt });
    toast.success(`Debt recorded for ${values.customerName}.`);

    form.reset({
      customerName: '',
      phone: '',
      amountOwed: 0,
      dateGiven: new Date(),
      dueDate: addDays(new Date(), 7),
      itemsSold: '',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          {...form.register('customerName')}
          placeholder="e.g., Aisha Bello"
          autoFocus
        />
        {form.formState.errors.customerName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="e.g., 08012345678"
        />
        {form.formState.errors.phone && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amountOwed">Amount Owed (₦)</Label>
        <Input
          id="amountOwed"
          type="number"
          {...form.register('amountOwed', { valueAsNumber: true })}
          placeholder="e.g., 25000"
          min="0"
        />
        {form.formState.errors.amountOwed && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountOwed.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dateGiven">Date Given</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch('dateGiven') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('dateGiven') ? format(form.watch('dateGiven'), 'PPP') : <span>Pick date debt was given</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch('dateGiven')}
              onSelect={(date) => form.setValue('dateGiven', date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.dateGiven && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateGiven.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch('dueDate') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('dueDate') ? format(form.watch('dueDate'), 'PPP') : <span>Pick due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch('dueDate')}
              onSelect={(date) => form.setValue('dueDate', date || addDays(new Date(), 7))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.dueDate && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.dueDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="itemsSold">What was sold (description)</Label>
        <Textarea
          id="itemsSold"
          {...form.register('itemsSold')}
          placeholder="e.g., 2 cartons of soft drinks, 1 bag of sugar"
        />
        {form.formState.errors.itemsSold && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.itemsSold.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Save Debt Record</Button>
    </form>
  );
};

export default DebtEntryForm;