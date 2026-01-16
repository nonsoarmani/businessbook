"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Eraser, Play, Copy, Download, Printer, ChevronDown, ChevronUp, Save, Trash2, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useScriptConverter } from '@/state/scriptConverterStore';
import { analyzeScript } from '@/lib/shotGenerator';
import { cn, generateUniqueId, exportToTXT } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

// Import the new components
import ScriptInput from '@/components/script-converter/ScriptInput';
import ShotListDisplay from '@/components/script-converter/ShotListDisplay';
import ExportButtons from '@/components/script-converter/ExportButtons';


// --- Components for Script Converter ---

// Moved to src/components/script-converter/ScriptInput.tsx
// interface ScriptInputProps {
//   script: string;
//   onScriptChange: (script: string) => void;
//   onGenerate: (script: string) => void;
//   onClear: () => void;
//   isLoading: boolean;
// }

// const scriptInputSchema = z.object({
//   script: z.string()
//     .min(10, { message: "Script too short - try adding more detail." })
//     .max(5000, { message: "Script is too long (max 5000 characters)." }),
// });

// const ScriptInput = ({ script, onScriptChange, onGenerate, onClear, isLoading }: ScriptInputProps) => {
//   const { register, handleSubmit, formState: { errors }, setValue } = useForm({
//     resolver: zodResolver(scriptInputSchema),
//     defaultValues: { script: script },
//   });

//   useEffect(() => {
//     setValue('script', script);
//   }, [script, setValue]);

//   const onSubmit = (data: { script: string }) => {
//     onGenerate(data.script);
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader>
//         <CardTitle className="text-xl">Script Input</CardTitle>
//         <CardDescription>Paste or type your script here. Max 5000 characters.</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 flex flex-col">
//         <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-4">
//           <div className="flex-1 relative">
//             <Textarea
//               {...register('script')}
//               placeholder={`[SCENE: Kitchen]\nPERSON A: "Did you eat my leftovers?"\nPERSON B: (nervously) "No..."\n[Person A opens fridge, it's empty]\nPERSON A: "BRUH."`}
//               className="min-h-[200px] h-full resize-none"
//               value={script}
//               onChange={(e) => onScriptChange(e.target.value)}
//             />
//             <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
//               {script.length} / 5000
//             </div>
//           </div>
//           {errors.script && (
//             <p className="text-red-500 text-sm mt-1">{errors.script.message}</p>
//           )}
//           <div className="flex gap-2 mt-4">
//             <Button type="submit" className="flex-1" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Generate Shot List
//             </Button>
//             <Button type="button" variant="outline" onClick={onClear} disabled={isLoading}>
//               <Eraser className="mr-2 h-4 w-4" /> Clear
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// Moved to src/components/script-converter/ShotListDisplay.tsx
// interface ShotListDisplayProps {
//   shots: { number: number; type: string; description: string }[];
//   isLoading: boolean;
// }

// const ShotListDisplay = ({ shots, isLoading }: ShotListDisplayProps) => {
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//         <Loader2 className="h-8 w-8 animate-spin mb-2" />
//         <p>Generating shots...</p>
//       </div>
//     );
//   }

//   if (shots.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//         <Play className="h-12 w-12 mb-4" />
//         <p className="text-lg font-semibold">No shots generated yet.</p>
//         <p className="text-sm">Enter your script and click "Generate Shot List".</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       {shots.map((shot) => (
//         <div key={shot.number} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
//           <span className="font-bold text-primary w-6 flex-shrink-0">{shot.number}.</span>
//           <div>
//             <span className="font-semibold">{shot.type}</span> - <span className="text-muted-foreground">{shot.description}</span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

const ShotTypesGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const shotTypes = [
    { name: 'Establishing Shot', description: 'Shows location/setting (wide view)' },
    { name: 'Wide Shot', description: 'Shows full body and surroundings' },
    { name: 'Medium Shot', description: 'Shows from waist up' },
    { name: 'Medium Close-Up', description: 'Shows from chest up' },
    { name: 'Close-Up', description: 'Shows face/head' },
    { name: 'Tight Close-Up', description: 'Shows eyes/specific detail' },
    { name: 'Over-Shoulder Shot', description: 'Camera behind one person looking at another' },
    { name: 'Insert Shot', description: 'Close-up of object or detail' },
    { name: 'Reaction Shot', description: 'Shows character reacting' },
    { name: 'Cutaway', description: 'Brief shot away from the main action' },
    { name: 'Transition Shot', description: 'Connects two scenes or moments' },
    { name: 'POV Shot', description: 'What character sees' },
    { name: 'Dutch Angle', description: 'Tilted camera (for dramatic/comedy effect)' },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Shot Types Guide
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 p-4 border rounded-md mt-2 bg-background">
        {shotTypes.map((type, index) => (
          <div key={index}>
            <h4 className="font-semibold">{type.name}</h4>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Moved to src/components/script-converter/ExportButtons.tsx
// interface ExportButtonsProps {
//   shots: { number: number; type: string; description: string }[];
//   scriptTitle: string;
// }

// const ExportButtons = ({ shots, scriptTitle }: ExportButtonsProps) => {
//   const formatShotList = () => {
//     return shots.map(shot => `${shot.number}. ${shot.type} - ${shot.description}`).join('\n');
//   };

//   const handleCopyToClipboard = () => {
//     navigator.clipboard.writeText(formatShotList());
//     toast.success('Shot list copied to clipboard!');
//   };

//   const handleDownloadTXT = () => {
//     const filename = scriptTitle ? `ShotList_${scriptTitle.replace(/\s/g, '_')}` : 'ShotList';
//     exportToTXT(filename, formatShotList());
//     toast.success('Shot list downloaded as TXT!');
//   };

//   const handlePrint = () => {
//     const printContent = `
//       <style>
//         body { font-family: sans-serif; margin: 20px; }
//         h1 { text-align: center; margin-bottom: 20px; }
//         .shot-item { margin-bottom: 10px; }
//         .shot-number { font-weight: bold; margin-right: 5px; }
//         .shot-type { font-weight: bold; }
//         .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #666; }
//       </style>
//       <h1>Shot List for "${scriptTitle || 'Untitled Script'}"</h1>
//       ${shots.map(shot => `
//         <div class="shot-item">
//           <span class="shot-number">${shot.number}.</span>
//           <span class="shot-type">${shot.type}</span> - <span>${shot.description}</span>
//         </div>
//       `).join('')}
//       <div class="footer">Generated on ${new Date().toLocaleDateString()} with ShotList Pro</div>
//     `;

//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(printContent);
//       printWindow.document.close();
//       printWindow.print();
//       printWindow.close();
//     } else {
//       toast.error('Could not open print window. Please allow pop-ups.');
//     }
//   };

//   return (
//     <div className="flex flex-wrap gap-2">
//       <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1 min-w-[120px]">
//         <Copy className="mr-2 h-4 w-4" /> Copy
//       </Button>
//       <Button onClick={handleDownloadTXT} variant="outline" className="flex-1 min-w-[120px]">
//         <Download className="mr-2 h-4 w-4" /> Download TXT
//       </Button>
//       <Button onClick={handlePrint} variant="outline" className="flex-1 min-w-[120px]">
//         <Printer className="mr-2 h-4 w-4" /> Print / PDF
//       </Button>
//     </div>
//   );
// };

interface TemplatesSectionProps {
  onLoadTemplate: (script: string) => void;
}

const templates = [
  {
    name: "Comedy Skit Template",
    script: `[SCENE: Living Room - Day]
SARAH: "Hey Mark, have you seen my lucky socks?"
MARK: (from behind the couch, muffled) "Uh... no? Why?"
[Sarah walks over to the couch, Mark is wearing her tiny, rainbow-striped socks on his ears]
SARAH: "MARK!"
MARK: (sheepishly) "They help me hear better!"
[Sarah facepalms, Mark winks at camera]`,
  },
  {
    name: "POV Video Template",
    script: `[SCENE: Coffee Shop - Morning]
[POV: You walk into a bustling coffee shop, the aroma of coffee fills the air]
BARISTA: "Welcome! What can I get for you?"
[POV: You glance at the menu, then back at the barista, smiling]
BARISTA: (blushing) "Just let me know when you're ready."
[POV: You pick up a pastry, then look for a seat]`,
  },
  {
    name: "Storytime Template",
    script: `[SCENE: Bedroom - Night]
[Person sits on bed, looking thoughtful]
PERSON: "So, you'll never believe what happened to me last Tuesday."
[Flashback: Person is at a grocery store, looking confused at a pineapple]
PERSON: "I was just trying to buy some fruit..."
[A squirrel suddenly jumps onto the pineapple, startling the person]
PERSON: (screams) "AHH!"
[Back to bedroom, person shivers]
PERSON: "And that's why I only eat bananas now."`,
  },
  {
    name: "Before & After Template",
    script: `[SCENE: Messy Desk - Day]
[Wide shot of a very cluttered desk: papers everywhere, old coffee cups, tangled wires]
[Insert shot: A single, dusty keyboard]
[Transition shot: Fast-forward effect]
[SCENE: Clean Desk - Day]
[Wide shot of the same desk, now perfectly organized, minimalist setup]
[Close-up: A sparkling clean monitor]
[Person smiles, satisfied]`,
  },
];

const TemplatesSection = ({ onLoadTemplate }: TemplatesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Templates</CardTitle>
        <CardDescription>Load pre-built scripts to get started quickly.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.name}
            variant="outline"
            onClick={() => onLoadTemplate(template.script)}
            className="flex-1 min-w-[150px]"
          >
            {template.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

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


// --- Main ScriptConverterPage ---

const ScriptConverterPage = () => {
  const { state, dispatch } = useScriptConverter();
  const [scriptTitle, setScriptTitle] = useState('');

  const handleScriptChange = (newScript: string) => {
    dispatch({ type: 'SET_SCRIPT_INPUT', payload: newScript });
  };

  const handleGenerateShots = (script: string) => {
    if (script.length < 10) {
      toast.error("Script too short - try adding more detail.");
      return;
    }
    dispatch({ type: 'SET_IS_LOADING', payload: true });
    setTimeout(() => { // Simulate loading for better UX
      const generated = analyzeScript(script);
      dispatch({ type: 'SET_GENERATED_SHOTS', payload: generated });
      dispatch({ type: 'SET_IS_LOADING', payload: false });
      toast.success('Shot list generated!');

      // Auto-save script
      const title = scriptTitle || `Script ${new Date().toLocaleString()}`;
      dispatch({
        type: 'ADD_SAVED_SCRIPT',
        payload: {
          id: generateUniqueId(),
          name: title,
          script: script,
          timestamp: new Date(),
        },
      });
    }, 500);
  };

  const handleClearScript = () => {
    dispatch({ type: 'SET_SCRIPT_INPUT', payload: '' });
    dispatch({ type: 'SET_GENERATED_SHOTS', payload: [] });
    setScriptTitle('');
    toast.info('Script input cleared.');
  };

  const handleLoadTemplate = (script: string) => {
    dispatch({ type: 'SET_SCRIPT_INPUT', payload: script });
    setScriptTitle(templates.find(t => t.script === script)?.name || '');
    handleGenerateShots(script);
  };

  const handleLoadSavedScript = (script: string) => {
    dispatch({ type: 'LOAD_SAVED_SCRIPT', payload: { id: '', name: '', script, timestamp: new Date() } });
    setScriptTitle(state.savedScripts.find(s => s.script === script)?.name || '');
    handleGenerateShots(script);
  };

  // Calculate estimated filming time
  const estimatedFilmingTimeMinutes = state.generatedShots.length * 0.25; // 15 seconds per shot
  const estimatedFilmingTimeDisplay = estimatedFilmingTimeMinutes < 1
    ? `${Math.round(estimatedFilmingTimeMinutes * 60)} seconds`
    : `${estimatedFilmingTimeMinutes.toFixed(1)} minutes`;


  return (
    <div className="min-h-full flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">Turn Scripts into Shot Lists in Seconds</h1>
        <p className="text-lg text-muted-foreground mt-2">Plan your camera angles before you film. Professional shot lists for TikTok, YouTube & Instagram creators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Script Input & Templates */}
        <div className="flex flex-col space-y-6">
          <ScriptInput
            script={state.scriptInput}
            onScriptChange={handleScriptChange}
            onGenerate={handleGenerateShots}
            onClear={handleClearScript}
            isLoading={state.isLoading}
          />
          <TemplatesSection onLoadTemplate={handleLoadTemplate} />
          <SavedScriptsSection onLoadScript={handleLoadSavedScript} />
        </div>

        {/* Right Column: Shot List Display & Tools */}
        <div className="flex flex-col space-y-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                Generated Shot List
                <span className="text-sm font-normal text-muted-foreground">
                  {state.generatedShots.length > 0 ? `${state.generatedShots.length} shots` : ''}
                </span>
              </CardTitle>
              <CardDescription>Your script converted into actionable camera angles.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <ShotListDisplay shots={state.generatedShots} isLoading={state.isLoading} />
            </CardContent>
            {state.generatedShots.length > 0 && (
              <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  <span>Estimated Filming Time:</span>
                </div>
                <span className="font-semibold text-foreground">{estimatedFilmingTimeDisplay}</span>
              </div>
            )}
          </Card>

          {state.generatedShots.length > 0 && (
            <ExportButtons shots={state.generatedShots} scriptTitle={scriptTitle} />
          )}

          <ShotTypesGuide />
        </div>
      </div>
    </div>
  );
};

export default ScriptConverterPage;