"use client";

import React, { useEffect } from 'react';
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
import { cn, isValidNigerianPhoneNumber } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Sale } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface EditSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSaleDialog = ({ sale, open, onOpenChange }: EditSaleDialogProps) => {
  const { dispatch } = useBusiness();
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
  });

  useEffect(() => {
    if (sale && open) {
      form.reset({
        item: sale.item,
        amount: sale.amount,
        paymentMethod: sale.paymentMethod,
        date: new Date(sale.date), // Ensure date is a Date object
        note: sale.note || '',
        customerName: sale.customerName || '',
        customerPhone: sale.customerPhone || '',
      });
    }
  }, [sale, open, form]);

  const paymentMethod = form.watch('paymentMethod');

  const onSubmit = (values: SaleFormValues) => {
    const updatedSale: Partial<Sale> & { id: string } = {
      id: sale.id,
      date: values.date,
      item: values.item,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      note: values.note,
      customerName: values.paymentMethod === 'Credit' ? values.customerName : undefined,
      customerPhone: values.paymentMethod === 'Credit' ? values.customerPhone : undefined,
    };

    dispatch({ type: 'UPDATE_SALE', payload: updatedSale });
    toast.success('Sale updated successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Make changes to this sale. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="item">Item/Service Name</Label>
            <Input
              id="item"
              {...form.register('item')}
              placeholder="e.g., 5 bags of rice"
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
                <RadioGroupItem value="Cash" id="edit-cash" />
                <Label htmlFor="edit-cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Transfer" id="edit-transfer" />
                <Label htmlFor="edit-transfer">Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POS" id="edit-pos" />
                <Label htmlFor="edit-pos">POS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Credit" id="edit-credit" />
                <Label htmlFor="edit-credit">Credit</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;