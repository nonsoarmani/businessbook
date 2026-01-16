"use client";

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn, generateUniqueId } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { Receipt, Sale } from '@/types';

const paymentMethods = ['Cash', 'Transfer', 'POS'] as const;

const receiptFormSchema = z.object({
  receiptNumber: z.string().min(1, { message: 'Receipt number is required.' }),
  date: z.date({
    required_error: 'A date is required.',
  }),
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  customerPhone: z.string().optional().refine((val) => !val || /^0\d{10}$/.test(val), {
    message: 'Phone number must be 11 digits starting with 0, or empty.',
  }),
  items: z.string().min(1, { message: 'Items sold are required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Amount must be a positive number.' })
  ),
  paymentMethod: z.enum(paymentMethods, {
    required_error: 'Payment method is required.',
  }),
  linkedSaleId: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

const ReceiptForm = () => {
  const { state, dispatch } = useBusiness();
  const { sales } = state;

  const [openSaleSelect, setOpenSaleSelect] = useState(false);

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receiptNumber: `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
      date: new Date(),
      customerName: '',
      customerPhone: '',
      items: '',
      amount: undefined,
      paymentMethod: 'Cash',
      linkedSaleId: '',
    },
  });

  const handleSaleSelect = (saleId: string | undefined) => {
    const selectedSale = sales.find(sale => sale.id === saleId);
    if (selectedSale) {
      form.setValue('items', selectedSale.item);
      form.setValue('amount', selectedSale.amount);
      form.setValue('paymentMethod', selectedSale.paymentMethod === 'Credit' ? 'Cash' : selectedSale.paymentMethod); // Default to Cash if credit
      form.setValue('customerName', selectedSale.customerName || '');
      form.setValue('customerPhone', selectedSale.customerPhone || '');
      form.setValue('linkedSaleId', selectedSale.id);
      showSuccess(`Sale #${selectedSale.id.substring(0, 6)} loaded.`);
    } else {
      form.setValue('linkedSaleId', '');
      // Optionally clear other fields if sale is unselected
      form.setValue('items', '');
      form.setValue('amount', undefined);
      form.setValue('customerName', '');
      form.setValue('customerPhone', '');
    }
    setOpenSaleSelect(false);
  };

  const onSubmit = (values: ReceiptFormValues) => {
    try {
      const newReceipt: Receipt = {
        id: generateUniqueId(),
        receiptNumber: values.receiptNumber,
        date: format(values.date, 'yyyy-MM-dd'),
        customerName: values.customerName,
        customerPhone: values.customerPhone || undefined,
        items: values.items,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        linkedSaleId: values.linkedSaleId || undefined,
      };

      dispatch({ type: 'ADD_RECEIPT', payload: newReceipt });
      showSuccess('Receipt generated successfully!');
      form.reset({
        receiptNumber: `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
        date: new Date(),
        customerName: '',
        customerPhone: '',
        items: '',
        amount: undefined,
        paymentMethod: 'Cash',
        linkedSaleId: '',
      });
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      showError('Failed to generate receipt. Please try again.');
    }
  };

  const availableSales = useMemo(() => {
    // Filter out credit sales as they are handled by debts, and already linked sales
    return sales.filter(sale =>
      sale.paymentMethod !== 'Credit' &&
      !state.receipts.some(receipt => receipt.linkedSaleId === sale.id)
    ).map(sale => ({
      label: `${sale.item} - ${format(new Date(sale.date), 'dd/MM/yyyy')} - ${sale.paymentMethod} - ₦${sale.amount.toLocaleString()}`,
      value: sale.id,
    }));
  }, [sales, state.receipts]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="linkedSaleId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Link to Existing Sale (Optional)</FormLabel>
              <Popover open={openSaleSelect} onOpenChange={setOpenSaleSelect}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSaleSelect}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? availableSales.find((sale) => sale.value === field.value)?.label
                        : "Select a sale..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search sales..." />
                    <CommandList>
                      <CommandEmpty>No sales found.</CommandEmpty>
                      <CommandGroup>
                        {availableSales.map((sale) => (
                          <CommandItem
                            value={sale.label}
                            key={sale.value}
                            onSelect={() => handleSaleSelect(sale.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                sale.value === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {sale.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiptNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., REC-001" {...field} />
              </FormControl>
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

        <FormField
          control={form.control}
          name="customerName"
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
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Phone (Optional, e.g., 08012345678)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items/Services Sold</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 2 bags of rice, 1 carton of milk" {...field} />
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
                  placeholder="e.g., 15000"
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
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Generate Receipt
        </Button>
      </form>
    </Form>
  );
};

export default ReceiptForm;