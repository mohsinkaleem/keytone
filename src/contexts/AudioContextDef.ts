import { createContext } from 'react';
import type { SoundTheme } from '../audio';

interface AudioState {
  soundTheme: SoundTheme;
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
}

export interface AudioContextValue extends AudioState {
  setSoundTheme: (theme: SoundTheme) => void;
  setVolume: (volume: number) => void;
  toggleMute: (muted: boolean) => void;
}

export const AudioCtx = createContext<AudioContextValue | null>(null);
