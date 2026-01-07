"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn, generateUniqueId } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Expense } from '@/types';

const expenseCategories = [
  'Stock/Inventory',
  'Transport',
  'Food/Lunch',
  'Airtime/Data',
  'Rent/Shop',
  'Staff Payment',
  'Personal Use',
  'Other',
] as const;

const expenseFormSchema = z.object({
  name: z.string().min(1, { message: 'Expense name is required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  category: z.enum(expenseCategories, {
    required_error: 'Category is required.',
  }),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const ExpenseEntryForm = () => {
  const { dispatch } = useBusiness();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: 'Other',
      date: new Date(),
    },
  });

  const onSubmit = (values: ExpenseFormValues) => {
    const newExpense: Expense = {
      id: generateUniqueId(),
      date: values.date,
      name: values.name,
      amount: values.amount,
      category: values.category,
    };

    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    toast.success('Expense recorded successfully!');

    form.reset({
      name: '',
      amount: 0,
      category: 'Other',
      date: new Date(),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Expense Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="e.g., Fuel for generator"
          autoFocus
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount (₦)</Label>
        <Input
          id="amount"
          type="number"
          {...form.register('amount', { valueAsNumber: true })}
          placeholder="e.g., 15000"
          min="0"
        />
        {form.formState.errors.amount && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          onValueChange={(value: ExpenseFormValues['category']) => form.setValue('category', value)}
          value={form.watch('category')}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
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

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Record Expense</Button>
    </form>
  );
};

export default ExpenseEntryForm;