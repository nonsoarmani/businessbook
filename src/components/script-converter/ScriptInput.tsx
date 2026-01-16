"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Eraser } from 'lucide-react';

interface ScriptInputProps {
  script: string;
  onScriptChange: (script: string) => void;
  onGenerate: (script: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

const scriptInputSchema = z.object({
  script: z.string()
    .min(10, { message: "Script too short - try adding more detail." })
    .max(5000, { message: "Script is too long (max 5000 characters)." }),
});

const ScriptInput = ({ script, onScriptChange, onGenerate, onClear, isLoading }: ScriptInputProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(scriptInputSchema),
    defaultValues: { script: script },
  });

  useEffect(() => {
    setValue('script', script);
  }, [script, setValue]);

  const onSubmit = (data: { script: string }) => {
    onGenerate(data.script);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Script Input</CardTitle>
        <CardDescription>Paste or type your script here. Max 5000 characters.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 relative">
            <Textarea
              {...register('script')}
              placeholder={`[SCENE: Kitchen]\nPERSON A: "Did you eat my leftovers?"\nPERSON B: (nervously) "No..."\n[Person A opens fridge, it's empty]\nPERSON A: "BRUH."`}
              className="min-h-[200px] h-full resize-none"
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {script.length} / 5000
            </div>
          </div>
          {errors.script && (
            <p className="text-red-500 text-sm mt-1">{errors.script.message}</p>
          )}
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Shot List
            </Button>
            <Button type="button" variant="outline" onClick={onClear} disabled={isLoading}>
              <Eraser className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScriptInput;