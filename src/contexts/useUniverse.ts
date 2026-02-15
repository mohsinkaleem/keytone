import { useContext } from 'react';
import type { UniverseContextValue } from './UniverseContextDef';
import { UniverseCtx } from './UniverseContextDef';

export function useUniverse(): UniverseContextValue {
  const ctx = useContext(UniverseCtx);
  if (!ctx) {
    throw new Error('useUniverse must be used within a UniverseProvider');
  }
  return ctx;
}
