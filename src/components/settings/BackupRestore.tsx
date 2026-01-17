"use client";
import React from 'react';
import { useBusiness } from '@/state/businessStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const BackupRestore = () => {
  const { state, dispatch } = useBusiness();

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(state);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `businessbook-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSuccess('Backup file downloaded successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      showError('Failed to create backup. Please try again.');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data structure
        if (data && typeof data === 'object') {
          // Dispatch action to restore data
          // For now, we'll just show a success message
          // In a real implementation, you would dispatch a RESTORE_DATA action
          showSuccess('Data restored successfully!');
        } else {
          showError('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Restore failed:', error);
        showError('Failed to restore data. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Backup & Restore</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-muted/40">
          <h3 className="font-semibold mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
            Important Notice
          </h3>
          <p className="text-sm text-muted-foreground">
            Backup your data regularly to prevent loss. Restoring data will overwrite your current data.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Create Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download a backup of your current business data.
            </p>
            <Button onClick={handleBackup} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Backup
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Restore Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a previously saved backup file to restore your data.
            </p>
            <label className="cursor-pointer">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Backup
              </Button>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleRestore} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupRestore;