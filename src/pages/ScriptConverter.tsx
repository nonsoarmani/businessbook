"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useScriptConverter } from '@/state/scriptConverterStore';
import { analyzeScript } from '@/lib/shotGenerator';
import { generateUniqueId } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Import the new components
import ScriptInput from '@/components/script-converter/ScriptInput';
import ShotListDisplay from '@/components/script-converter/ShotListDisplay';
import ExportButtons from '@/components/script-converter/ExportButtons';
import TemplatesSection from '@/components/script-converter/TemplatesSection';
import SavedScriptsSection from '@/components/script-converter/SavedScriptsSection';
import ShotTypesGuide from '@/components/script-converter/ShotTypesGuide';
import UserTemplatesSection from '@/components/script-converter/UserTemplatesSection'; // Import the new UserTemplatesSection


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
    // For simplicity, we'll just set a generic title or leave it empty.
    setScriptTitle(`Template Loaded (${new Date().toLocaleTimeString()})`);
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
          <UserTemplatesSection onLoadTemplate={handleLoadTemplate} /> {/* New: User Templates Section */}
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