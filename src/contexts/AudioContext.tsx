import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { audioEngine, type SoundTheme } from '../audio';
import { AudioCtx } from './AudioContextDef';
import type { AudioContextValue } from './AudioContextDef';

interface AudioState {
  soundTheme: SoundTheme;
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioState>({
    soundTheme: 'piano',
    volume: 0.5,
    isMuted: false,
    isInitialized: false,
  });

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (state.isInitialized) return;

    try {
      await audioEngine.initialize();
      audioEngine.setSoundTheme(state.soundTheme);
      audioEngine.setVolume(state.volume);
      audioEngine.setMuted(state.isMuted);
      setState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [state.isInitialized, state.soundTheme, state.volume, state.isMuted]);

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
    setVolume,
    toggleMute,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
