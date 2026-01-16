"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { ScriptConverterState, ScriptConverterAction, SavedScript, Template } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { generateUniqueId } from '@/lib/utils';

const initialState: ScriptConverterState = {
  scriptInput: '',
  generatedShots: [],
  savedScripts: [],
  userTemplates: [], // Initialize userTemplates
  isLoading: false,
};

const scriptConverterReducer = (state: ScriptConverterState, action: ScriptConverterAction): ScriptConverterState => {
  switch (action.type) {
    case 'SET_SCRIPT_INPUT':
      return { ...state, scriptInput: action.payload };
    case 'SET_GENERATED_SHOTS':
      return { ...state, generatedShots: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_SAVED_SCRIPT':
      // Ensure only the last 3 scripts are kept
      const newSavedScripts = [action.payload, ...state.savedScripts].slice(0, 3);
      return { ...state, savedScripts: newSavedScripts };
    case 'DELETE_SAVED_SCRIPT':
      return {
        ...state,
        savedScripts: state.savedScripts.filter(script => script.id !== action.payload),
      };
    case 'LOAD_SAVED_SCRIPT':
      return {
        ...state,
        scriptInput: action.payload.script,
        // When loading a saved script, clear generated shots until re-generated
        generatedShots: [],
      };
    case 'SET_SAVED_SCRIPTS':
      return { ...state, savedScripts: action.payload };
    case 'ADD_TEMPLATE':
      return { ...state, userTemplates: [...state.userTemplates, action.payload] };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        userTemplates: state.userTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        userTemplates: state.userTemplates.filter(template => template.id !== action.payload),
      };
    case 'SET_USER_TEMPLATES':
      return { ...state, userTemplates: action.payload };
    case 'CLEAR_ALL_DATA':
      return { ...initialState, savedScripts: [], userTemplates: [] }; // Clear saved scripts and user templates
    default:
      return state;
  }
};

interface ScriptConverterContextType {
  state: ScriptConverterState;
  dispatch: React.Dispatch<ScriptConverterAction>;
}

const ScriptConverterContext = createContext<ScriptConverterContextType | undefined>(undefined);

export const ScriptConverterProvider = ({ children }: { ReactNode }) => {
  const [storedSavedScripts, setStoredSavedScripts] = useLocalStorage<SavedScript[]>('savedScripts', []);
  const [storedUserTemplates, setStoredUserTemplates] = useLocalStorage<Template[]>('userTemplates', []); // New: Local storage for user templates

  const [state, dispatch] = useReducer(scriptConverterReducer, {
    ...initialState,
    savedScripts: storedSavedScripts,
    userTemplates: storedUserTemplates, // Load user templates from local storage
  });

  // Sync saved scripts to local storage whenever they change in state
  useEffect(() => {
    setStoredSavedScripts(state.savedScripts);
  }, [state.savedScripts, setStoredSavedScripts]);

  // New: Sync user templates to local storage whenever they change in state
  useEffect(() => {
    setStoredUserTemplates(state.userTemplates);
  }, [state.userTemplates, setStoredUserTemplates]);

  return (
    <ScriptConverterContext.Provider value={{ state, dispatch }}>
      {children}
    </ScriptConverterContext.Provider>
  );
};

export const useScriptConverter = () => {
  const context = useContext(ScriptConverterContext);
  if (context === undefined) {
    throw new Error('useScriptConverter must be used within a ScriptConverterProvider');
  }
  return context;
};