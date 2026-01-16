"use client";

import React from 'react';
import BusinessSettingsForm from '@/components/settings/BusinessSettingsForm';

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your business information and application settings.</p>

      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        <BusinessSettingsForm />
      </div>
    </div>
  );
};

export default SettingsPage;