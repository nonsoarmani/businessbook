"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { isValidNigerianPhoneNumber } from '@/lib/utils';

const businessInfoSchema = z.object({
  businessName: z.string().min(1, { message: 'Business name is required.' }),
  businessPhone: z.string().refine(isValidNigerianPhoneNumber, {
    message: 'Valid Nigerian phone number (e.g., 08012345678) is required.',
  }),
  businessLocation: z.string().min(1, { message: 'Business location is required.' }),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

const BusinessInfoForm = () => {
  const { state, dispatch } = useBusiness();

  const form = useForm<BusinessInfoFormValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: state.businessName,
      businessPhone: state.businessPhone,
      businessLocation: state.businessLocation,
    },
  });

  React.useEffect(() => {
    // Update form defaults if state changes externally (e.g., initial load)
    form.reset({
      businessName: state.businessName,
      businessPhone: state.businessPhone,
      businessLocation: state.businessLocation,
    });
  }, [state.businessName, state.businessPhone, state.businessLocation, form]);

  const onSubmit = (values: BusinessInfoFormValues) => {
    dispatch({ type: 'SET_BUSINESS_INFO', payload: values });
    toast.success('Business information updated successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your business name, phone number, and location.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              {...form.register('businessName')}
              placeholder="e.g., My Local Shop"
            />
            {form.formState.errors.businessName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="businessPhone">Business Phone Number</Label>
            <Input
              id="businessPhone"
              {...form.register('businessPhone')}
              placeholder="e.g., 08012345678"
            />
            {form.formState.errors.businessPhone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessPhone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="businessLocation">Business Location</Label>
            <Input
              id="businessLocation"
              {...form.register('businessLocation')}
              placeholder="e.g., Shop 12, Main Market, Lagos"
            />
            {form.formState.errors.businessLocation && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessLocation.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoForm;