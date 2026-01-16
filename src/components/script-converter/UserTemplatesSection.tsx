"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useScriptConverter } from '@/state/scriptConverterStore';
import { generateUniqueId } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Template } from '@/types';

interface UserTemplatesSectionProps {
  onLoadTemplate: (script: string) => void;
}

const UserTemplatesSection = ({ onLoadTemplate }: UserTemplatesSectionProps) => {
  const { state, dispatch } = useScriptConverter();
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateScript, setTemplateScript] = useState('');

  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name);
      setTemplateScript(currentTemplate.script);
    } else {
      setTemplateName('');
      setTemplateScript('');
    }
  }, [currentTemplate]);

  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteClick = (template: Template) => {
    setCurrentTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentTemplate) {
      dispatch({ type: 'DELETE_TEMPLATE', payload: currentTemplate.id });
      toast.success(`Template "${currentTemplate.name}" deleted!`);
      setCurrentTemplate(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !templateScript.trim()) {
      toast.error('Template name and script cannot be empty.');
      return;
    }

    if (currentTemplate) {
      // Update existing template
      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: { ...currentTemplate, name: templateName, script: templateScript },
      });
      toast.success(`Template "${templateName}" updated!`);
    } else {
      // Add new template
      dispatch({
        type: 'ADD_TEMPLATE',
        payload: { id: generateUniqueId(), name: templateName, script: templateScript },
      });
      toast.success(`Template "${templateName}" added!`);
    }
    setIsAddEditDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Your Templates</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {state.userTemplates.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No custom templates yet. Click "Add New" to create one!</p>
        ) : (
          state.userTemplates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
              <div className="flex-1 truncate">
                <p className="font-semibold">{template.name}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => onLoadTemplate(template.script)}>
                  Load
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(template)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Add/Edit Template Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTemplate ? 'Edit Template' : 'Add New Template'}</DialogTitle>
            <DialogDescription>
              {currentTemplate ? 'Make changes to your template here.' : 'Create a new script template.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="templateName" className="text-right">
                Name
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="templateScript" className="text-right pt-2">
                Script
              </Label>
              <Textarea
                id="templateScript"
                value={templateScript}
                onChange={(e) => setTemplateScript(e.target.value)}
                className="col-span-3 min-h-[150px] resize-y"
                placeholder="[SCENE: Your Scene]\nCHARACTER: 'Your dialogue...'"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template "
              {currentTemplate?.name}".
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

export default UserTemplatesSection;