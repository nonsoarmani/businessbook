"use client";

import React, { useState } from 'react';
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { cn, generateUniqueId, isValidNigerianPhoneNumber, formatNaira } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Receipt, Sale } from '@/types';

const receiptFormSchema = z.object({
  linkedSaleId: z.string().optional(),
  receiptNumber: z.string().optional(),
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
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

const ReceiptEntryForm = () => {
  const { state, dispatch } = useBusiness();
  const [useExistingSale, setUseExistingSale] = useState(false);

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receiptNumber: `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
      date: new Date(),
      customerName: '',
      customerPhone: '',
      items: '',
      amount: 0,
      paymentMethod: 'Cash',
      linkedSaleId: '',
    },
  });

  const handleSaleSelect = (saleId: string) => {
    const selectedSale = state.sales.find(sale => sale.id === saleId);
    if (selectedSale) {
      form.setValue('linkedSaleId', selectedSale.id);
      form.setValue('date', selectedSale.date);
      form.setValue('customerName', selectedSale.customerName || 'Walk-in Customer');
      form.setValue('customerPhone', selectedSale.customerPhone || '');
      form.setValue('items', selectedSale.item);
      form.setValue('amount', selectedSale.amount);
      // Only set payment method if it's one of the valid receipt types
      if (['Cash', 'Transfer', 'POS'].includes(selectedSale.paymentMethod)) {
        form.setValue('paymentMethod', selectedSale.paymentMethod as 'Cash' | 'Transfer' | 'POS');
      } else {
        form.setValue('paymentMethod', 'Cash'); // Default for credit sales or other non-receiptable methods
      }
      form.setValue('receiptNumber', `REC-${selectedSale.id.substring(0, 8).toUpperCase()}`);
      toast.info(`Details pre-filled from sale: ${selectedSale.item}`);
    }
  };

  const onSubmit = (values: ReceiptFormValues) => {
    const newReceipt: Receipt = {
      id: generateUniqueId(),
      receiptNumber: values.receiptNumber || `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
      date: values.date,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: values.items,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      linkedSaleId: values.linkedSaleId,
    };

    dispatch({ type: 'ADD_RECEIPT', payload: newReceipt });
    toast.success(`Receipt ${newReceipt.receiptNumber} generated successfully!`);

    form.reset({
      receiptNumber: `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
      date: new Date(),
      customerName: '',
      customerPhone: '',
      items: '',
      amount: 0,
      paymentMethod: 'Cash',
      linkedSaleId: '',
    });
    setUseExistingSale(false); // Reset toggle
  };

  const availableSalesForReceipt = state.sales.filter(sale =>
    !state.receipts.some(receipt => receipt.linkedSaleId === sale.id)
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useExistingSale"
          checked={useExistingSale}
          onChange={(e) => {
            setUseExistingSale(e.target.checked);
            if (!e.target.checked) {
              form.reset({
                receiptNumber: `REC-${generateUniqueId().substring(0, 8).toUpperCase()}`,
                date: new Date(),
                customerName: '',
                customerPhone: '',
                items: '',
                amount: 0,
                paymentMethod: 'Cash',
                linkedSaleId: '',
              });
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <Label htmlFor="useExistingSale">Generate from existing sale</Label>
      </div>

      {useExistingSale && (
        <div>
          <Label htmlFor="selectSale">Select Sale</Label>
          <Select onValueChange={handleSaleSelect} value={form.watch('linkedSaleId')}>
            <SelectTrigger id="selectSale">
              <SelectValue placeholder="Select a sale to generate receipt from" />
            </SelectTrigger>
            <SelectContent>
              {availableSalesForReceipt.length > 0 ? (
                availableSalesForReceipt.map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {formatDate(sale.date)} - {sale.item} ({formatNaira(sale.amount)})
                  </SelectItem>
                ))
              ) : (
                <p className="p-2 text-muted-foreground">No unreceipted sales available.</p>
              )}
            </SelectContent>
          </Select>
          {form.formState.errors.linkedSaleId && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.linkedSaleId.message}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="receiptNumber">Receipt Number</Label>
        <Input
          id="receiptNumber"
          {...form.register('receiptNumber')}
          placeholder="e.g., REC-0001"
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
              disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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
          disabled={useExistingSale && !!form.watch('linkedSaleId')}
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

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <PlusCircle className="h-4 w-4 mr-2" /> Generate Receipt
      </Button>
    </form>
  );
};

export default ReceiptEntryForm;