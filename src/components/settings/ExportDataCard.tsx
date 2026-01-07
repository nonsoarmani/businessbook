"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { exportAllBusinessDataToCSV } from '@/lib/utils';

const ExportDataCard = () => {
  const { state } = useBusiness();

  const handleExport = () => {
    exportAllBusinessDataToCSV(state);
    toast.success('All business data exported successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export All Data</CardTitle>
        <CardDescription>
          Download all your sales, expenses, debts, and receipt records as CSV files.
          This is useful for backups or external analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} className="w-full flex items-center gap-2">
          <Download className="h-4 w-4" /> Export All Data to CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportDataCard;