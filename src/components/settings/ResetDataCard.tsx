"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const ResetDataCard = () => {
  const { dispatch } = useBusiness();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const handleResetData = () => {
    dispatch({ type: 'RESET_ALL_DATA' });
    toast.success('All sales, expenses, debts, and receipts have been cleared.');
    setIsAlertDialogOpen(false);
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Reset All Data</CardTitle>
        <CardDescription className="text-red-700">
          Permanently delete all sales, expenses, debts, and receipt records. Your business information will remain.
          This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={() => setIsAlertDialogOpen(true)}
          className="w-full flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" /> Reset All Data
        </Button>

        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your sales, expenses, debts, and receipt records.
                Your core business information (name, phone, location) will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={handleResetData} className="bg-red-600 hover:bg-red-700 text-white">
                  Confirm Reset
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ResetDataCard;