import { useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  audioEngine,
  SOUND_THEMES,
  TYPEWRITER_VARIANTS,
  type SoundTheme,
  type TypewriterVariant,
} from '../audio';
import { AudioCtx } from './AudioContextDef';
import type { AudioContextValue } from './AudioContextDef';
import { getSettings } from '../utils/storage';

interface AudioState {
  soundTheme: SoundTheme;
  typewriterVariant: TypewriterVariant;
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioState>(() => {
    const settings = getSettings();
    const knownThemes = new Set<SoundTheme>(SOUND_THEMES.map((t) => t.value));
    const knownTypewriterVariants = new Set<TypewriterVariant>(TYPEWRITER_VARIANTS.map((v) => v.value));
    const storedTheme = settings.soundTheme as SoundTheme;
    const storedTypewriterVariant = settings.typewriterVariant as TypewriterVariant;
    const storedVolume = typeof settings.volume === 'number' ? settings.volume : 0.5;

    return {
      soundTheme: knownThemes.has(storedTheme) ? storedTheme : 'piano',
      typewriterVariant: knownTypewriterVariants.has(storedTypewriterVariant)
        ? storedTypewriterVariant
        : 'classic',
      volume: Math.max(0, Math.min(1, storedVolume)),
      isMuted: false,
      isInitialized: false,
    };
  });

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (state.isInitialized) return;

    try {
      await audioEngine.initialize();
      audioEngine.setSoundTheme(state.soundTheme);
      audioEngine.setTypewriterVariant(state.typewriterVariant);
      audioEngine.setVolume(state.volume);
      audioEngine.setMuted(state.isMuted);
      setState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [state.isInitialized, state.soundTheme, state.typewriterVariant, state.volume, state.isMuted]);

  useEffect(() => {
    window.addEventListener('keydown', initAudio);
    window.addEventListener('mousedown', initAudio);

    return () => {
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
    };
  }, [initAudio]);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setState((prev) => ({ ...prev, soundTheme: theme }));
    audioEngine.setSoundTheme(theme);
  }, []);

  const setTypewriterVariant = useCallback((variant: TypewriterVariant) => {
    setState((prev) => ({ ...prev, typewriterVariant: variant }));
    audioEngine.setTypewriterVariant(variant);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
    audioEngine.setVolume(volume);
  }, []);

  const toggleMute = useCallback((muted: boolean) => {
    setState((prev) => ({ ...prev, isMuted: muted }));
    audioEngine.setMuted(muted);
  }, []);

  const value: AudioContextValue = {
    ...state,
    setSoundTheme,
    setTypewriterVariant,
    setVolume,
    toggleMute,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
