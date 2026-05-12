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
import { InventoryItem } from '@/types';

const inventoryFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Item name is required.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative({ message: 'Quantity must be a non-negative number.' })
  ),
  unit: z.string().min(1, { message: 'Unit is required.' }),
  costPrice: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative({ message: 'Cost price must be a non-negative number.' })
  ),
  sellingPrice: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Selling price must be a positive number.' })
  ),
  lowStockThreshold: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative({ message: 'Low stock threshold must be a non-negative number.' })
  ).optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSuccess?: () => void;
}

const InventoryForm = ({ initialData, onSuccess }: InventoryFormProps) => {
  const { addInventoryItem, updateInventoryItem } = useBusiness();
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      name: initialData.name,
      category: initialData.category,
      quantity: initialData.quantity,
      unit: initialData.unit,
      costPrice: initialData.costPrice,
      sellingPrice: initialData.sellingPrice,
      lowStockThreshold: initialData.lowStockThreshold || 0,
      supplier: initialData.supplier || '',
      notes: initialData.notes || '',
    } : {
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: 0,
      supplier: '',
      notes: '',
    },
  });

  const onSubmit = async (values: InventoryFormValues) => {
    try {
      if (initialData) {
        const updatedItem: InventoryItem = {
          ...initialData,
          name: values.name,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          costPrice: values.costPrice,
          sellingPrice: values.sellingPrice,
          lowStockThreshold: values.lowStockThreshold || 0,
          supplier: values.supplier || undefined,
          notes: values.notes || undefined,
          lastUpdated: format(new Date(), 'yyyy-MM-dd'),
        };
        await updateInventoryItem(updatedItem);
        showSuccess('Inventory item updated successfully!');
      } else {
        const newInventoryItem: InventoryItem = {
          id: generateUniqueId(),
          name: values.name,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          costPrice: values.costPrice,
          sellingPrice: values.sellingPrice,
          lowStockThreshold: values.lowStockThreshold || 0,
          supplier: values.supplier || undefined,
          notes: values.notes || undefined,
          dateAdded: format(new Date(), 'yyyy-MM-dd'),
          lastUpdated: format(new Date(), 'yyyy-MM-dd'),
        };

        await addInventoryItem(newInventoryItem);
        showSuccess('Inventory item added successfully!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      showError('Failed to record inventory item. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Rice, Milk, etc." {...field} />
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
                <FormControl>
                  <Input placeholder="e.g., Groceries, Beverages, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50" {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., pieces, kg, liters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (₦)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 1500.00" {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (₦)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 2000.00" {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Supplier Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this item..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Add Inventory Item
        </Button>
      </form>
    </Form>
  );
};

export default InventoryForm;