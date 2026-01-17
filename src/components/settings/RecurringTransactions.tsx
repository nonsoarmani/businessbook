"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { generateUniqueId } from '@/lib/utils';

// Define types for recurring transactions
interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
  category?: string;
  description?: string;
}

const recurringTransactionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  type: z.enum(['expense', 'income'], { required_error: 'Type is required.' }),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], { required_error: 'Frequency is required.' }),
  startDate: z.string().min(1, { message: 'Start date is required.' }),
  category: z.string().optional(),
  description: z.string().optional(),
});

type RecurringTransactionFormValues = z.infer<typeof recurringTransactionSchema>;

const RecurringTransactions = () => {
  const { state, dispatch } = useBusiness();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  
  const form = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      name: '',
      amount: 0,
      type: 'expense',
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
    },
  });

  const onSubmit = (values: RecurringTransactionFormValues) => {
    try {
      const newTransaction: RecurringTransaction = {
        id: generateUniqueId(),
        name: values.name,
        amount: values.amount,
        type: values.type,
        frequency: values.frequency,
        startDate: values.startDate,
        nextDate: values.startDate, // For simplicity, we'll use start date as next date
        category: values.category,
        description: values.description,
      };

      setRecurringTransactions([...recurringTransactions, newTransaction]);
      showSuccess('Recurring transaction added successfully!');
      form.reset();
    } catch (error) {
      console.error('Failed to add recurring transaction:', error);
      showError('Failed to add recurring transaction. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    try {
      setRecurringTransactions(recurringTransactions.filter(transaction => transaction.id !== id));
      showSuccess('Recurring transaction deleted successfully!');
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error);
      showError('Failed to delete recurring transaction. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Add New Recurring Transaction</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rent, Salary, Subscription" {...field} />
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
                          placeholder="e.g., 50000" 
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Category (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rent, Utilities, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional details about this transaction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full md:w-auto">
                Add Recurring Transaction
              </Button>
            </form>
          </Form>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Recurring Transactions</h3>
          {recurringTransactions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.name}</TableCell>
                      <TableCell>₦{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'income' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">{transaction.frequency}</TableCell>
                      <TableCell>{format(new Date(transaction.nextDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recurring transactions added yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringTransactions;