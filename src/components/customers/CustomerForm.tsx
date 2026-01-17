"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { generateUniqueId } from '@/lib/utils';
import { Customer } from '@/types';

const customerFormSchema = z.object({
  name: z.string().min(1, { message: 'Customer name is required.' }),
  phone: z.string().regex(/^0\d{10}$/, { message: 'Phone number must be 11 digits starting with 0.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  location: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const CustomerForm = () => {
  const { dispatch } = useBusiness();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      location: '',
    },
  });

  const onSubmit = (values: CustomerFormValues) => {
    try {
      const newCustomer: Customer = {
        id: generateUniqueId(),
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        location: values.location || undefined,
        dateAdded: format(new Date(), 'yyyy-MM-dd'),
      };

      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      showSuccess('Customer added successfully!');
      form.reset();
    } catch (error) {
      console.error('Failed to add customer:', error);
      showError('Failed to add customer. Please try again.');
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
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 Main Street, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add Customer
        </Button>
      </form>
    </Form>
  );
};

export default CustomerForm;