import { createContext } from 'react';
import type { SoundTheme, TypewriterVariant } from '../audio';

interface AudioState {
  soundTheme: SoundTheme;
  typewriterVariant: TypewriterVariant;
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
}

export interface AudioContextValue extends AudioState {
  setSoundTheme: (theme: SoundTheme) => void;
  setTypewriterVariant: (variant: TypewriterVariant) => void;
  setVolume: (volume: number) => void;
  toggleMute: (muted: boolean) => void;
}

export const AudioCtx = createContext<AudioContextValue | null>(null);
