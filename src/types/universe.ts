/**
 * Universe types for Keytone multi-universe platform
 */

export type UniverseType = 'standard' | 'coding' | 'novel';

export type ExcerptFlow = 'sequential' | 'random' | 'chapter';

export interface Universe {
  id: string;
  name: string;
  type: UniverseType;
  description: string;
  icon: string;
  isBuiltIn: boolean;
  createdAt?: string;
}

export interface Excerpt {
  id: string;
  universeId: string;
  text: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order?: number; // For sequential universes like novels
  metadata?: {
    chapter?: number;
    source?: string;
    language?: string;
  };
}

export interface UniverseProgress {
  universeId: string;
  currentExcerptId?: string;
  completedExcerptIds: string[];
  totalExcerpts: number;
  lastAccessedAt: string;
}

// Built-in universe IDs
export const BUILT_IN_UNIVERSE_IDS = {
  GENERAL: 'general',
  CODING: 'coding',
} as const;
