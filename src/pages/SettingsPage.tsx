"use client";
import React from 'react';
import BusinessSettingsForm from '../components/settings/BusinessSettingsForm';
import BackupRestore from '../components/settings/BackupRestore';
import RecurringTransactions from '../components/settings/RecurringTransactions';
import NotificationsManager from '../components/notifications/NotificationsManager';

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your business information and application settings.</p>
      
      <div className="space-y-6">
        <div className="bg-card p-4 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Business Information</h2>
          <BusinessSettingsForm />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Notifications & Reminders</h2>
          <NotificationsManager />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Recurring Transactions</h2>
          <RecurringTransactions />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Backup & Restore</h2>
          <BackupRestore />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;