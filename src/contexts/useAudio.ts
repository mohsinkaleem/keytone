import { useContext } from 'react';
import { AudioCtx, type AudioContextValue } from './AudioContextDef';

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
