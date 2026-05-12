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
import { Textarea } from '@/components/ui/textarea';
import { cn, generateUniqueId } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { Debt } from '@/types';

const debtFormSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  phone: z.string().regex(/^0\d{10}$/, { message: 'Phone number must be 11 digits starting with 0.' }),
  originalAmount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  itemsSold: z.string().min(1, { message: 'Items sold is required.' }),
  dateGiven: z.date({
    required_error: 'Date given is required.',
  }),
  dueDate: z.date({
    required_error: 'Due date is required.',
  }),
}).superRefine((data, ctx) => {
  if (data.dueDate < data.dateGiven) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Due date cannot be before the date debt was given.',
      path: ['dueDate'],
    });
  }
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

interface DebtFormProps {
  initialData?: Debt;
  onSuccess?: () => void;
}

const DebtForm = ({ initialData, onSuccess }: DebtFormProps) => {
  const { addDebt, updateDebt } = useBusiness();

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      customerName: initialData.customerName,
      phone: initialData.phone,
      originalAmount: initialData.originalAmount,
      itemsSold: initialData.itemsSold,
      dateGiven: parseISO(initialData.dateGiven),
      dueDate: parseISO(initialData.dueDate),
    } : {
      customerName: '',
      phone: '',
      originalAmount: undefined,
      itemsSold: '',
      dateGiven: new Date(),
      dueDate: new Date(),
    },
  });

  const onSubmit = async (values: DebtFormValues) => {
    try {
      if (initialData) {
        const updatedDebt: Debt = {
          ...initialData,
          customerName: values.customerName,
          phone: values.phone,
          originalAmount: values.originalAmount,
          // If editing original amount, we should probably update amountOwed too, 
          // but for simplicity let's just keep the existing amountOwed logic or reset it if no payments were made
          amountOwed: initialData.paidAmount ? (values.originalAmount - initialData.paidAmount) : values.originalAmount,
          dateGiven: format(values.dateGiven, 'yyyy-MM-dd'),
          dueDate: format(values.dueDate, 'yyyy-MM-dd'),
          itemsSold: values.itemsSold,
        };
        await updateDebt(updatedDebt);
        showSuccess('Debt updated successfully!');
      } else {
        const newDebt: Debt = {
          id: generateUniqueId(),
          customerName: values.customerName,
          phone: values.phone,
          originalAmount: values.originalAmount,
          amountOwed: values.originalAmount,
          dateGiven: format(values.dateGiven, 'yyyy-MM-dd'),
          dueDate: format(values.dueDate, 'yyyy-MM-dd'),
          itemsSold: values.itemsSold,
          status: 'active',
        };

        await addDebt(newDebt);
        showSuccess('Debt recorded successfully!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset({
          customerName: '',
          phone: '',
          originalAmount: undefined,
          itemsSold: '',
          dateGiven: new Date(),
          dueDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to save debt:', error);
      showError('Failed to record debt. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Phone (e.g., 08012345678)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Amount (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 25000"
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
          name="itemsSold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items Sold (e.g., 2 bags of beans)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 2 bags of beans, 1 carton of milk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateGiven"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Debt Given</FormLabel>
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

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
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
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Record Debt
        </Button>
      </form>
    </Form>
  );
};

export default DebtForm;