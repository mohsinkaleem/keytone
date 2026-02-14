import { useEffect, useCallback, useRef, useState } from 'react';
import { audioEngine } from '../audio';
import {
  getFrequencyForKey,
  midiToFrequency,
  ScaleWalker,
  type ScaleName,
} from '../utils/noteUtils';

export type PlayMode = 'instrument' | 'harmonious';

interface UseKeyboardOptions {
  mode: PlayMode;
  scaleName?: ScaleName;
  enabled?: boolean;
}

interface UseKeyboardReturn {
  activeKeys: Set<string>;
  activeFrequencies: Set<number>;
}

export function useKeyboard({
  mode,
  scaleName = 'C Major Pentatonic',
  enabled = true,
}: UseKeyboardOptions): UseKeyboardReturn {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [activeFrequencies, setActiveFrequencies] = useState<Set<number>>(new Set());
  
  const scaleWalkerRef = useRef<ScaleWalker>(new ScaleWalker(scaleName));
  const keyToFrequencyRef = useRef<Map<string, number>>(new Map());

  // Update scale walker when scale changes
  useEffect(() => {
    scaleWalkerRef.current.setScale(scaleName);
  }, [scaleName]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Ignore if typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore modifier keys and repeats
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Prevent duplicate key handling
      if (activeKeys.has(key)) {
        return;
      }

      let frequency: number | null = null;

      if (mode === 'instrument') {
        frequency = getFrequencyForKey(key);
      } else {
        // Harmonious mode - any letter key triggers next note in scale
        if (/^[a-z]$/.test(key)) {
          const midiNote = scaleWalkerRef.current.getNextNote();
          frequency = midiToFrequency(midiNote);
        }
      }

      if (frequency !== null) {
        // Store the mapping so we can stop the correct note on keyup
        keyToFrequencyRef.current.set(key, frequency);
        
        audioEngine.playNote(frequency);
        
        setActiveKeys((prev) => new Set([...prev, key]));
        setActiveFrequencies((prev) => new Set([...prev, frequency!]));
      }
    },
    [mode, enabled, activeKeys]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const frequency = keyToFrequencyRef.current.get(key);

      if (frequency !== undefined) {
        audioEngine.stopNote(frequency);
        keyToFrequencyRef.current.delete(key);
        
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        
        setActiveFrequencies((prev) => {
          const next = new Set(prev);
          next.delete(frequency);
          return next;
        });
      }
    },
    []
  );

  // Handle window blur - stop all notes
  const handleBlur = useCallback(() => {
    audioEngine.stopAllNotes();
    keyToFrequencyRef.current.clear();
    setActiveKeys(new Set());
    setActiveFrequencies(new Set());
    scaleWalkerRef.current.reset();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      
      // Cleanup any playing notes
      audioEngine.stopAllNotes();
    };
  }, [handleKeyDown, handleKeyUp, handleBlur, enabled]);

  return { activeKeys, activeFrequencies };
}

export default useKeyboard;
