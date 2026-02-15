import { createContext } from 'react';
import type { Universe, Excerpt } from '../types/universe';

export interface UniverseContextValue {
  activeUniverse: Universe;
  allUniverses: Universe[];
  currentExcerpts: Excerpt[];
  switchUniverse: (universeId: string) => void;
  createUniverse: (
    universe: Omit<Universe, 'id' | 'createdAt' | 'isBuiltIn'>,
    excerpts?: Omit<Excerpt, 'id'>[]
  ) => Universe;
  removeUniverse: (universeId: string) => void;
  getRandomExcerpt: (excludeId?: string) => Excerpt | null;
  getNextExcerpt: (currentId?: string) => Excerpt | null;
}

export const UniverseCtx = createContext<UniverseContextValue | null>(null);
