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
import { Upload, ImageIcon, Loader2 } from 'lucide-react';

const businessSettingsSchema = z.object({
  businessName: z.string().min(1, { message: 'Business name is required.' }),
  businessEmail: z.string().email({ message: 'Invalid email address.' }).min(1, { message: 'Email is required.' }),
  businessPhone: z.string().regex(/^0\d{10}$/, { message: 'Phone number must be 11 digits starting with 0.' }).min(1, { message: 'Phone number is required.' }),
  businessAddress: z.string().min(1, { message: 'Business address is required.' }),
  businessLogoUrl: z.string().url({ message: 'Invalid URL for logo.' }).optional().or(z.literal('')),
});

type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;

const BusinessSettingsForm = () => {
  const { state, updateSettings, updateLogo } = useBusiness();
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Provide fallback values in case settings is undefined
  const settings = state.settings || {
    businessName: 'BusinessBook',
    businessEmail: 'info@businessbook.com',
    businessPhone: '+234 800 123 4567',
    businessAddress: '123 Business Street, City, State',
    businessLogoUrl: '',
  };

  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: settings.businessName || '',
      businessEmail: settings.businessEmail || '',
      businessPhone: settings.businessPhone || '',
      businessAddress: settings.businessAddress || '',
      businessLogoUrl: settings.businessLogoUrl || '',
    },
  });

  const onSubmit = async (values: BusinessSettingsFormValues) => {
    try {
      const updatedSettings = {
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        businessPhone: values.businessPhone,
        businessAddress: values.businessAddress,
        businessLogoUrl: values.businessLogoUrl || undefined,
      };
      
      await updateSettings(updatedSettings);
      showSuccess('Business settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showError('Failed to update settings. Please try again.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file.');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image size should be less than 2MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      // Cloudinary configuration
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please check your .env file.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        await updateLogo(data.secure_url);
        form.setValue('businessLogoUrl', data.secure_url);
        showSuccess('Logo uploaded and saved successfully!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Logo upload error:', error);
      showError(error.message || 'Failed to upload logo. Check your connection or settings.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center p-6 border rounded-xl bg-card shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/20">
            {settings.businessLogoUrl ? (
              <img src={settings.businessLogoUrl} alt="Business Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all">
            <Upload className="w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
          </label>
        </div>
        <div className="mt-4 text-center">
          <h3 className="font-semibold text-lg">Business Logo</h3>
          <p className="text-sm text-muted-foreground">Upload your logo for branded receipts</p>
        </div>
      </div>

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
          <Button type="submit" className="w-full">
            Save All Settings
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BusinessSettingsForm;