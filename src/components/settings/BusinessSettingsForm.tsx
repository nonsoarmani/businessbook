"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBusiness } from '@/state/businessStore';
import { showSuccess, showError } from '@/utils/toast';
import { BusinessSettings } from '@/types';

const businessSettingsSchema = z.object({
  businessName: z.string().min(1, { message: 'Business name is required.' }),
  businessEmail: z.string().email({ message: 'Invalid email address.' }).min(1, { message: 'Email is required.' }),
  businessPhone: z.string().regex(/^0\d{10}$/, { message: 'Phone number must be 11 digits starting with 0.' }).min(1, { message: 'Phone number is required.' }),
  businessAddress: z.string().min(1, { message: 'Business address is required.' }),
  businessLogoUrl: z.string().url({ message: 'Invalid URL for logo.' }).optional().or(z.literal('')),
});

type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;

const BusinessSettingsForm = () => {
  const { state, dispatch } = useBusiness();
  const { settings } = state;
  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: settings.businessName,
      businessEmail: settings.businessEmail,
      businessPhone: settings.businessPhone,
      businessAddress: settings.businessAddress,
      businessLogoUrl: settings.businessLogoUrl || '',
    },
  });

  const onSubmit = (values: BusinessSettingsFormValues) => {
    try {
      const updatedSettings: BusinessSettings = {
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        businessPhone: values.businessPhone,
        businessAddress: values.businessAddress,
        businessLogoUrl: values.businessLogoUrl || undefined,
      };
      dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
      showSuccess('Business settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showError('Failed to update settings. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Awesome Business" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., contact@mybusiness.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Phone</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 Main Street, City, State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessLogoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default BusinessSettingsForm;