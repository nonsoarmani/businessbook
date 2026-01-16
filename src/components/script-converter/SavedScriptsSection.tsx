"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useScriptConverter } from '@/state/scriptConverterStore';
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

interface SavedScriptsSectionProps {
  onLoadScript: (script: string) => void;
}

const SavedScriptsSection = ({ onLoadScript }: SavedScriptsSectionProps) => {
  const { state, dispatch } = useScriptConverter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setScriptToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scriptToDelete) {
      dispatch({ type: 'DELETE_SAVED_SCRIPT', payload: scriptToDelete });
      toast.success('Script deleted successfully!');
      setScriptToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (state.savedScripts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Saved Scripts</CardTitle>
          <CardDescription>Your recently saved scripts will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No saved scripts yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Saved Scripts</CardTitle>
        <CardDescription>Your last 3 scripts are saved automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {state.savedScripts.map((savedScript) => (
          <div key={savedScript.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
            <div className="flex-1 truncate">
              <p className="font-semibold">{savedScript.name}</p>
              <p className="text-sm text-muted-foreground">{new Date(savedScript.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => onLoadScript(savedScript.script)}>
                Load
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(savedScript.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your saved script.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SavedScriptsSection;