/**
 * Universe Context - Global state management for universes
 */

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Universe, Excerpt } from '../types/universe';
import { BUILT_IN_UNIVERSE_IDS } from '../types/universe';
import { BUILT_IN_UNIVERSES, CODING_EXCERPTS, getUniverseById } from '../data/defaultUniverses';
import { TYPING_TEXTS } from '../utils/typingTexts';
import { UniverseCtx } from './UniverseContextDef';
import {
  getUserData,
  setActiveUniverse as saveActiveUniverse,
  getCustomUniverses,
  addCustomUniverse,
  deleteCustomUniverse,
  getExcerptsForUniverse,
  addCustomExcerpts,
} from '../utils/storage';

// Convert existing TYPING_TEXTS to Excerpt format
function convertTypingTextsToExcerpts(): Excerpt[] {
  return TYPING_TEXTS.map(text => ({
    id: text.id,
    universeId: BUILT_IN_UNIVERSE_IDS.GENERAL,
    text: text.text,
    title: text.title,
    difficulty: text.difficulty,
    metadata: {
      source: text.category,
    },
  }));
}

function getExcerptsForActiveUniverse(activeUniverseId: string): Excerpt[] {
  if (activeUniverseId === BUILT_IN_UNIVERSE_IDS.GENERAL) {
    return convertTypingTextsToExcerpts();
  }
  if (activeUniverseId === BUILT_IN_UNIVERSE_IDS.CODING) {
    return CODING_EXCERPTS;
  }
  return getExcerptsForUniverse(activeUniverseId);
}

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [activeUniverseId, setActiveUniverseId] = useState<string>(() =>
    getUserData().activeUniverseId || BUILT_IN_UNIVERSE_IDS.GENERAL
  );
  const [customUniverses, setCustomUniverses] = useState<Universe[]>(() => getCustomUniverses());
  const allUniverses = useMemo(
    () => [...BUILT_IN_UNIVERSES, ...customUniverses],
    [customUniverses]
  );
  const activeUniverse = useMemo(
    () => getUniverseById(activeUniverseId, customUniverses) || BUILT_IN_UNIVERSES[0],
    [activeUniverseId, customUniverses]
  );
  const currentExcerpts = useMemo(
    () => getExcerptsForActiveUniverse(activeUniverseId),
    [activeUniverseId]
  );

  const switchUniverse = useCallback((universeId: string) => {
    const universe = getUniverseById(universeId, customUniverses);
    if (universe) {
      setActiveUniverseId(universeId);
      saveActiveUniverse(universeId);
    }
  }, [customUniverses]);

  const createUniverse = useCallback((
    universeData: Omit<Universe, 'id' | 'createdAt' | 'isBuiltIn'>,
    excerpts?: Omit<Excerpt, 'id'>[]
  ): Universe => {
    const newUniverse = addCustomUniverse(universeData);
    
    if (excerpts && excerpts.length > 0) {
      // Add excerpts with the new universe ID
      const excerptsWithUniverse = excerpts.map(e => ({
        ...e,
        universeId: newUniverse.id,
      }));
      addCustomExcerpts(excerptsWithUniverse);
    }

    setCustomUniverses(getCustomUniverses());
    return newUniverse;
  }, []);

  const removeUniverse = useCallback((universeId: string) => {
    deleteCustomUniverse(universeId);
    setCustomUniverses(getCustomUniverses());
    
    if (activeUniverseId === universeId) {
      switchUniverse(BUILT_IN_UNIVERSE_IDS.GENERAL);
    }
  }, [activeUniverseId, switchUniverse]);

  const getRandomExcerpt = useCallback((excludeId?: string): Excerpt | null => {
    const available = excludeId 
      ? currentExcerpts.filter(e => e.id !== excludeId)
      : currentExcerpts;
    
    if (available.length === 0) return currentExcerpts[0] || null;
    return available[Math.floor(Math.random() * available.length)];
  }, [currentExcerpts]);

  const getNextExcerpt = useCallback((currentId?: string): Excerpt | null => {
    if (!currentId || activeUniverse.type !== 'novel') {
      return getRandomExcerpt(currentId);
    }

    // For novel type, get next sequential excerpt
    const currentIndex = currentExcerpts.findIndex(e => e.id === currentId);
    if (currentIndex === -1 || currentIndex >= currentExcerpts.length - 1) {
      return currentExcerpts[0] || null;
    }
    return currentExcerpts[currentIndex + 1];
  }, [activeUniverse.type, currentExcerpts, getRandomExcerpt]);

  return (
    <UniverseCtx.Provider
      value={{
        activeUniverse,
        allUniverses,
        currentExcerpts,
        switchUniverse,
        createUniverse,
        removeUniverse,
        getRandomExcerpt,
        getNextExcerpt,
      }}
    >
      {children}
    </UniverseCtx.Provider>
  );
}
