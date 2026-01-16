"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useScriptConverter } from '@/state/scriptConverterStore';
import { analyzeScript } from '@/lib/shotGenerator';
import { generateUniqueId } from '@/lib/utils';

export const useScriptConverterLogic = () => {
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

  return {
    scriptInput: state.scriptInput,
    generatedShots: state.generatedShots,
    isLoading: state.isLoading,
    scriptTitle,
    estimatedFilmingTimeDisplay,
    handleScriptChange,
    handleGenerateShots,
    handleClearScript,
    handleLoadTemplate,
    handleLoadSavedScript,
  };
};