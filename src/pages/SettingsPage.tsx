"use client";
import React from 'react';
import BusinessSettingsForm from '../components/settings/BusinessSettingsForm';
import BackupRestore from '../components/settings/BackupRestore';
import RecurringTransactions from '../components/settings/RecurringTransactions';
import NotificationsManager from '../components/notifications/NotificationsManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const { profile } = useAuth();
  const isPro = profile?.subscription_status === 'pro';

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your business information and application settings.</p>
      
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Subscription Status Card */}
        <Card className={isPro ? "border-primary/50 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Subscription Plan</CardTitle>
                <CardDescription>Manage your current plan and billing</CardDescription>
              </div>
              <Badge variant={isPro ? "default" : "secondary"} className={isPro ? "bg-primary" : ""}>
                {isPro ? "PRO PLAN" : "FREE PLAN"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">You have full access to all Pro features</p>
                  <p className="text-sm text-muted-foreground">Thank you for supporting BusinessBook!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to unlock advanced reports, unlimited inventory tracking, and priority support.
                </p>
                <Button asChild className="w-full">
                  <Link to="/subscription">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Business Information</h2>
          <BusinessSettingsForm />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Notifications & Reminders</h2>
          <NotificationsManager />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Recurring Transactions</h2>
          <RecurringTransactions />
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Backup & Restore</h2>
          <BackupRestore />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;