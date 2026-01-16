export interface Shot {
  number: number;
  type: string;
  description: string;
}

export interface Template {
  name: string;
  script: string;
}

export interface SavedScript {
  id: string;
  name: string;
  script: string;
  timestamp: Date;
}

export interface ScriptConverterState {
  scriptInput: string;
  generatedShots: Shot[];
  savedScripts: SavedScript[];
  isLoading: boolean;
}

export type ScriptConverterAction =
  | { type: 'SET_SCRIPT_INPUT'; payload: string }
  | { type: 'SET_GENERATED_SHOTS'; payload: Shot[] }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'ADD_SAVED_SCRIPT'; payload: SavedScript }
  | { type: 'DELETE_SAVED_SCRIPT'; payload: string }
  | { type: 'LOAD_SAVED_SCRIPT'; payload: SavedScript }
  | { type: 'SET_SAVED_SCRIPTS'; payload: SavedScript[] }
  | { type: 'CLEAR_ALL_DATA' };