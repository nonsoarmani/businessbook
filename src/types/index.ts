export interface Shot {
  number: number;
  type: string;
  description: string;
}

export interface Template {
  id: string; // Added ID for unique identification
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
  userTemplates: Template[]; // New: User-defined templates
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
  | { type: 'ADD_TEMPLATE'; payload: Template } // New: Add a user template
  | { type: 'UPDATE_TEMPLATE'; payload: Template } // New: Update a user template
  | { type: 'DELETE_TEMPLATE'; payload: string } // New: Delete a user template
  | { type: 'SET_USER_TEMPLATES'; payload: Template[] } // New: Set all user templates
  | { type: 'CLEAR_ALL_DATA' };