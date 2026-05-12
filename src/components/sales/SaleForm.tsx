"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn, generateUniqueId, formatNaira } from '@/lib/utils';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { Sale } from '@/types';

const saleFormSchema = z.object({
  id: z.string().optional(),
  item: z.string().min(1, { message: 'Item name is required.' }),
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
  existingCustomerId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'Credit') {
    if (!data.customerName || data.customerName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Customer name is required for credit sales.',
        path: ['customerName'],
      });
    }
    if (!data.customerPhone || !/^0\d{10}$/.test(data.customerPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number must be 11 digits starting with 0 for credit sales.',
        path: ['customerPhone'],
      });
    }
  }
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface SaleFormProps {
  initialData?: Sale;
  onSuccess?: () => void;
}

const SaleForm = ({ initialData, onSuccess }: SaleFormProps) => {
  const { state, addSale, addDebt, updateSale } = useBusiness();
  const { customers } = state;
  const [openCustomerSelect, setOpenCustomerSelect] = React.useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      item: initialData.item,
      amount: initialData.amount,
      paymentMethod: initialData.paymentMethod,
      date: parseISO(initialData.date),
      note: initialData.note || '',
      customerName: initialData.customerName || '',
      customerPhone: initialData.customerPhone || '',
      existingCustomerId: initialData.customerId || '',
    } : {
      item: '',
      amount: undefined,
      paymentMethod: 'Cash',
      date: new Date(),
      note: '',
      customerName: '',
      customerPhone: '',
      existingCustomerId: '',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue('existingCustomerId', customer.id);
      form.setValue('customerName', customer.name);
      form.setValue('customerPhone', customer.phone);
    }
    setOpenCustomerSelect(false);
  };

  const onSubmit = async (values: SaleFormValues) => {
    try {
      if (initialData) {
        const updatedSale: Sale = {
          ...initialData,
          date: format(values.date, 'yyyy-MM-dd'),
          item: values.item,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          note: values.note,
          customerName: values.customerName || undefined,
          customerPhone: values.customerPhone || undefined,
          customerId: values.existingCustomerId || undefined,
        };
        await updateSale(updatedSale);
        showSuccess('Sale updated successfully!');
      } else {
        const newSale: Sale = {
          id: generateUniqueId(),
          date: format(values.date, 'yyyy-MM-dd'),
          item: values.item,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          note: values.note,
          customerName: values.customerName || undefined,
          customerPhone: values.customerPhone || undefined,
          customerId: values.existingCustomerId || undefined,
        };

        await addSale(newSale);

        if (values.paymentMethod === 'Credit') {
          const newDebt = {
            id: generateUniqueId(),
            customerName: values.customerName!,
            phone: values.customerPhone!,
            originalAmount: values.amount,
            amountOwed: values.amount,
            dateGiven: format(values.date, 'yyyy-MM-dd'),
            dueDate: format(values.date, 'yyyy-MM-dd'), // Default due date to same day, can be edited later
            itemsSold: values.item,
            status: 'active' as const,
          };
          await addDebt(newDebt);
          showSuccess('Sale recorded and new debt created!');
        } else {
          showSuccess('Sale recorded successfully!');
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset({
          item: '',
          amount: undefined,
          paymentMethod: 'Cash',
          date: new Date(),
          note: '',
          customerName: '',
          customerPhone: '',
          existingCustomerId: '',
        });
      }
    } catch (error) {
      console.error('Failed to save sale:', error);
      showError('Failed to record sale. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item/Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 bags of rice" {...field} />
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
            <FormItem className="space-y-3">
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Cash" />
                    </FormControl>
                    <FormLabel className="font-normal">Cash</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Transfer" />
                    </FormControl>
                    <FormLabel className="font-normal">Transfer</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="POS" />
                    </FormControl>
                    <FormLabel className="font-normal">POS</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Credit" />
                    </FormControl>
                    <FormLabel className="font-normal">Credit</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Customer Information {paymentMethod === 'Credit' ? '(Required)' : '(Optional)'}
            </h3>
          </div>
          
          <FormField
            control={form.control}
            name="existingCustomerId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select Existing Customer</FormLabel>
                <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCustomerSelect}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? customers.find((c) => c.id === field.value)?.name
                          : "Select a customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search customers..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              value={customer.name}
                              key={customer.id}
                              onSelect={() => handleCustomerSelect(customer.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  customer.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {customer.name} ({customer.phone})
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 08012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any relevant notes here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save Sale
        </Button>
      </form>
    </Form>
  );
};

export default SaleForm;