"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, generateUniqueId } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
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
    required_error: 'Expense category is required.',
  }),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const ExpenseForm = () => {
  const { dispatch } = useBusiness();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      category: 'Other',
      date: new Date(),
    },
  });

  const onSubmit = (values: ExpenseFormValues) => {
    try {
      const newExpense: Expense = {
        id: generateUniqueId(),
        date: format(values.date, 'yyyy-MM-dd'),
        name: values.name,
        amount: values.amount,
        category: values.category,
      };

      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      showSuccess('Expense recorded successfully!');
      form.reset({
        name: '',
        amount: undefined,
        category: 'Other',
        date: new Date(),
      });
    } catch (error) {
      console.error('Failed to save expense:', error);
      showError('Failed to record expense. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fuel for generator" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an expense category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Record Expense
        </Button>
      </form>
    </Form>
  );
};

export default ExpenseForm;