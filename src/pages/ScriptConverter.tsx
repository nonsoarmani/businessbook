"use client";

import React from 'react';
import { Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Import the new components
import ScriptInput from '@/components/script-converter/ScriptInput';
import ShotListDisplay from '@/components/script-converter/ShotListDisplay';
import ExportButtons from '@/components/script-converter/ExportButtons';
import TemplatesSection from '@/components/script-converter/TemplatesSection';
import SavedScriptsSection from '@/components/script-converter/SavedScriptsSection';
import ShotTypesGuide from '@/components/script-converter/ShotTypesGuide';
import UserTemplatesSection from '@/components/script-converter/UserTemplatesSection';
import { useScriptConverterLogic } from '@/hooks/useScriptConverterLogic'; // Import the new hook


// --- Main ScriptConverterPage ---

const ScriptConverterPage = () => {
  const {
    scriptInput,
    generatedShots,
    isLoading,
    scriptTitle,
    estimatedFilmingTimeDisplay,
    handleScriptChange,
    handleGenerateShots,
    handleClearScript,
    handleLoadTemplate,
    handleLoadSavedScript,
  } = useScriptConverterLogic();

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
            script={scriptInput}
            onScriptChange={handleScriptChange}
            onGenerate={handleGenerateShots}
            onClear={handleClearScript}
            isLoading={isLoading}
          />
          <TemplatesSection onLoadTemplate={handleLoadTemplate} />
          <UserTemplatesSection onLoadTemplate={handleLoadTemplate} />
          <SavedScriptsSection onLoadScript={handleLoadSavedScript} />
        </div>

        {/* Right Column: Shot List Display & Tools */}
        <div className="flex flex-col space-y-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                Generated Shot List
                <span className="text-sm font-normal text-muted-foreground">
                  {generatedShots.length > 0 ? `${generatedShots.length} shots` : ''}
                </span>
              </CardTitle>
              <CardDescription>Your script converted into actionable camera angles.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <ShotListDisplay shots={generatedShots} isLoading={isLoading} />
            </CardContent>
            {generatedShots.length > 0 && (
              <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  <span>Estimated Filming Time:</span>
                </div>
                <span className="font-semibold text-foreground">{estimatedFilmingTimeDisplay}</span>
              </div>
            )}
          </Card>

          {generatedShots.length > 0 && (
            <ExportButtons shots={generatedShots} scriptTitle={scriptTitle} />
          )}

          <ShotTypesGuide />
        </div>
      </div>
    </div>
  );
};

export default ScriptConverterPage;