import { Shot } from '@/types';
import { generateUniqueId } from '@/lib/utils';

interface ShotGenerationState {
  lastShotType: string | null;
  dialogueShotCount: number;
  shotNumber: number;
  shots: Shot[];
}

const resetShotGenerationState = (): ShotGenerationState => ({
  lastShotType: null,
  dialogueShotCount: 0,
  shotNumber: 1,
  shots: [],
});

const addShot = (state: ShotGenerationState, type: string, description: string) => {
  state.shots.push({
    number: state.shotNumber++,
    type,
    description,
  });
  state.lastShotType = type;
};

const applyShotVarietyRules = (state: ShotGenerationState, currentShotType: string, currentDescription: string) => {
  // Rule: Don't repeat the same shot type more than twice in a row (simple version)
  if (state.shots.length >= 2 && state.shots[state.shots.length - 1].type === currentShotType && state.shots[state.shots.length - 2].type === currentShotType) {
    // Try to vary the shot if it's a dialogue shot
    if (currentShotType.includes("shot")) {
      if (currentShotType === "Medium shot") {
        addShot(state, "Medium close-up", currentDescription);
        return;
      } else if (currentShotType === "Medium close-up") {
        addShot(state, "Close-up", currentDescription);
        return;
      }
    }
  }
  addShot(state, currentShotType, currentDescription);
};

export const analyzeScript = (scriptText: string): Shot[] => {
  const state = resetShotGenerationState();
  const lines = scriptText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentCharacter: string | null = null;
  let lastCharacter: string | null = null;
  let sceneStarted = false;

  for (const line of lines) {
    // Scene Markers
    const sceneMatch = line.match(/\[SCENE:\s*(.*?)\]/i);
    if (sceneMatch) {
      const location = sceneMatch[1].trim();
      addShot(state, "Establishing shot", location);
      sceneStarted = true;
      continue;
    }

    // Ensure scene starts with an establishing shot if not already
    if (!sceneStarted && state.shots.length === 0) {
      addShot(state, "Establishing shot", "General setting");
      sceneStarted = true;
    }

    // Dialogue Detection
    const dialogueMatch = line.match(/^([A-Z\s]+):\s*"(.*?)"/);
    if (dialogueMatch) {
      const character = dialogueMatch[1].trim();
      const dialogue = dialogueMatch[2].trim();
      currentCharacter = character;

      // Rule: Dialogue -> Medium shot
      applyShotVarietyRules(state, "Medium shot", `${character} speaking`);
      state.dialogueShotCount++;

      // Rule: Questions -> Close-up
      if (dialogue.includes('?')) {
        addShot(state, "Close-up", `${character}'s questioning face`);
      }

      // Rule: Reaction shot for other character
      if (lastCharacter && lastCharacter !== currentCharacter) {
        addShot(state, "Reaction shot", `${lastCharacter} reacting`);
      }
      lastCharacter = currentCharacter;
      continue;
    }

    // Parenthetical emotions/actions within dialogue (e.g., PERSON B: (nervously) "No...")
    const parentheticalMatch = line.match(/^([A-Z\s]+):\s*\((.*?)\)\s*"(.*?)"/);
    if (parentheticalMatch) {
      const character = parentheticalMatch[1].trim();
      const emotionOrAction = parentheticalMatch[2].trim().toLowerCase();
      const dialogue = parentheticalMatch[3].trim();
      currentCharacter = character;

      // Emotion Detection from parenthetical
      if (emotionOrAction.includes("nervously") || emotionOrAction.includes("worried") || emotionOrAction.includes("scared")) {
        addShot(state, "Over-shoulder shot", `${character} looking nervous`);
      } else if (emotionOrAction.includes("shocked") || emotionOrAction.includes("surprised") || emotionOrAction.includes("gasps")) {
        addShot(state, "Close-up", `${character}'s shocked expression`);
      } else if (emotionOrAction.includes("laughs") || emotionOrAction.includes("smiles") || emotionOrAction.includes("grins")) {
        addShot(state, "Medium close-up", `${character} laughing`);
      } else if (emotionOrAction.includes("angry") || emotionOrAction.includes("yells") || emotionOrAction.includes("screams")) {
        addShot(state, "Tight close-up", `${character}'s angry face`);
      }

      applyShotVarietyRules(state, "Medium shot", `${character} speaking`);
      state.dialogueShotCount++;

      if (dialogue.includes('?')) {
        addShot(state, "Close-up", `${character}'s questioning face`);
      }

      if (lastCharacter && lastCharacter !== currentCharacter) {
        addShot(state, "Reaction shot", `${lastCharacter} reacting`);
      }
      lastCharacter = currentCharacter;
      continue;
    }

    // General Action/Description lines (not dialogue)
    const lowerLine = line.toLowerCase();

    // Action Detection
    if (lowerLine.includes("enters") || lowerLine.includes("walks in") || lowerLine.includes("arrives")) {
      const characterMatch = line.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(enters|walks in|arrives)/i);
      const character = characterMatch ? characterMatch[1] : "A character";
      const locationMatch = line.match(/(?:into|in|to)\s+the\s+([\w\s]+)/i);
      const location = locationMatch ? locationMatch[1] : "the scene";
      addShot(state, "Establishing shot", `${character} enters ${location}`);
    } else if (lowerLine.includes("opens") || lowerLine.includes("grabs") || lowerLine.includes("picks up") || lowerLine.includes("throws")) {
      const objectMatch = line.match(/(opens|grabs|picks up|throws)\s+(.*?)(?:\s|$)/i);
      const objectOrAction = objectMatch ? objectMatch[2] : "an object";
      addShot(state, "Insert shot", objectOrAction);
    } else if (lowerLine.includes("runs") || lowerLine.includes("jumps") || lowerLine.includes("fights") || lowerLine.includes("dances")) {
      addShot(state, "Wide shot", line);
    }
    // Emotion Detection (for actions describing emotions)
    else if (lowerLine.includes("shocked") || lowerLine.includes("surprised") || lowerLine.includes("gasps")) {
      const characterMatch = line.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(is\s+)?(shocked|surprised|gasps)/i);
      const character = characterMatch ? characterMatch[1] : "A character";
      addShot(state, "Close-up", `${character}'s shocked expression`);
    } else if (lowerLine.includes("laughs") || lowerLine.includes("smiles") || lowerLine.includes("grins")) {
      const characterMatch = line.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(laughs|smiles|grins)/i);
      const character = characterMatch ? characterMatch[1] : "A character";
      addShot(state, "Medium close-up", `${character} laughing`);
    } else if (lowerLine.includes("angry") || lowerLine.includes("yells") || lowerLine.includes("screams")) {
      const characterMatch = line.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(is\s+)?(angry|yells|screams)/i);
      const character = characterMatch ? character[1] : "A character";
      addShot(state, "Tight close-up", `${character}'s angry face`);
    } else if (lowerLine.includes("nervously") || lowerLine.includes("worried") || lowerLine.includes("scared")) {
      const characterMatch = line.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(looks\s+)?(nervously|worried|scared)/i);
      const character = characterMatch ? characterMatch[1] : "A character";
      addShot(state, "Over-shoulder shot", `${character} looking nervous`);
    }
    // Transition Detection
    else if (lowerLine.includes("meanwhile") || lowerLine.includes("later") || lowerLine.includes("suddenly")) {
      addShot(state, "Transition shot", line);
    }
    // Fallback for unhandled lines
    else {
      // If the last shot was a dialogue, add a reaction or cutaway
      if (state.lastShotType && state.lastShotType.includes("shot") && state.dialogueShotCount % 3 === 0) {
        addShot(state, "Cutaway", "Something relevant in the scene");
      }
      // Default to a medium shot if no other rule applies
      addShot(state, "Medium shot", line);
    }
  }

  // Rule: End important moments with a close-up (simple version: end of script)
  if (state.shots.length > 0 && !state.lastShotType?.toLowerCase().includes("close-up")) {
    addShot(state, "Close-up", "Concluding shot");
  }

  return state.shots;
};