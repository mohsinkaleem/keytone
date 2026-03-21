/**
 * Storage utilities for persisting user data
 *
 * All user state (settings, custom texts, universes, excerpts, stats,
 * achievements) is persisted to localStorage under a single key. Helper
 * functions expose a read → modify → write pattern so callers never need
 * to touch localStorage directly.
 *
 * Storage is v2-compatible: the deep-merge on read guarantees new fields
 * added in future versions are automatically backfilled with defaults.
 */

import type { Universe, Excerpt, UniverseProgress } from '../types/universe';
import { BUILT_IN_UNIVERSE_IDS } from '../types/universe';

// ---------------------  Type Definitions  ---------------------

export interface SessionStats {
  id: string;
  date: string;
  textId: string;
  textTitle: string;
  category: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  score: number;
  duration: number;
  correctChars: number;
  incorrectChars: number;
  maxStreak: number;
}

export interface UserStats {
  totalSessions: number;
  totalCharsTyped: number;
  totalCorrectChars: number;
  totalTimeSpent: number; // seconds
  averageWpm: number;
  averageAccuracy: number;
  highestWpm: number;
  highestStreak: number;
  highestScore: number;
  sessionsHistory: SessionStats[];
  characterErrors: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface CustomText {
  id: string;
  title: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface UserSettings {
  soundTheme: string;
  typewriterVariant: string;
  volume: number;
  keyboardClickSound: boolean;
  waveform: string;
  showVisualizer: boolean;
  showKeyboard: boolean;
  enableBackspace: boolean;
  scale: string;
  chordProgression: string;
  cursorStyle: 'line' | 'underline';
  /** Per-universe excerpt flow override: sequential, random, chapter */
  universeExcerptFlow: Record<string, string>;
}

export interface UserData {
  version: number;            // schema version for future migrations
  stats: UserStats;
  achievements: Achievement[];
  customTexts: CustomText[];
  settings: UserSettings;
  activeUniverseId: string;
  universeProgress: Record<string, UniverseProgress>;
  customUniverses: Universe[];
  customExcerpts: Excerpt[];
}

// ---------------------  Defaults  ---------------------

const STORAGE_KEY = 'keytone_user_data';

const DEFAULT_USER_DATA: UserData = {
  version: 2,
  stats: {
    totalSessions: 0,
    totalCharsTyped: 0,
    totalCorrectChars: 0,
    totalTimeSpent: 0,
    averageWpm: 0,
    averageAccuracy: 100,
    highestWpm: 0,
    highestStreak: 0,
    highestScore: 0,
    sessionsHistory: [],
    characterErrors: {},
  },
  achievements: [],
  customTexts: [],
  settings: {
    soundTheme: 'piano',
    typewriterVariant: 'classic',
    volume: 0.5,
    keyboardClickSound: true,
    waveform: 'sine',
    showVisualizer: true,
    showKeyboard: true,
    enableBackspace: true,
    scale: 'C Major Pentatonic',
    chordProgression: 'pop',
    cursorStyle: 'line',
    universeExcerptFlow: {},
  },
  activeUniverseId: BUILT_IN_UNIVERSE_IDS.GENERAL,
  universeProgress: {},
  customUniverses: [],
  customExcerpts: [],
};

// ---------------------  Helpers  ---------------------

// Deep-merge helper: merges source into target, preserving nested defaults
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;
  for (const key of Object.keys(source as object) as Array<keyof T>) {
    const sourceVal = source[key] as T[keyof T] | undefined;
    const targetVal = target[key];
    if (
      sourceVal !== null &&
      sourceVal !== undefined &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal) &&
      targetVal !== null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = deepMerge(targetVal as any, sourceVal as any) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }
  return result;
}

/** Generate a unique id with an optional prefix */
function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------  Core CRUD  ---------------------

/** Read the full user data from localStorage, backfilling any missing defaults */
export function getUserData(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserData>;
      return deepMerge(DEFAULT_USER_DATA, parsed);
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
  return { ...DEFAULT_USER_DATA };
}

/** Persist full user data to localStorage */
export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
}

/** Convenience: read → mutate → save, returns the updated data */
function mutateAndSave(fn: (data: UserData) => void): UserData {
  const data = getUserData();
  fn(data);
  saveUserData(data);
  return data;
}

// ---------------------  Session Stats  ---------------------

/** Record a completed typing session and recalculate aggregate stats */
export function updateStats(
  session: Omit<SessionStats, 'id' | 'date'>,
  characterErrors?: Record<string, number>
): UserData {
  return mutateAndSave((data) => {
    const stats = data.stats;
    const newSession: SessionStats = {
      ...session,
      id: uid('session'),
      date: new Date().toISOString(),
    };

    stats.totalSessions += 1;
    stats.totalCharsTyped += session.correctChars + session.incorrectChars;
    stats.totalCorrectChars += session.correctChars;
    stats.totalTimeSpent += session.duration;

    const totalWpm = stats.averageWpm * (stats.totalSessions - 1) + session.wpm;
    stats.averageWpm = Math.round(totalWpm / stats.totalSessions);
    const totalAccuracy = stats.averageAccuracy * (stats.totalSessions - 1) + session.accuracy;
    stats.averageAccuracy = Math.round(totalAccuracy / stats.totalSessions);

    stats.highestWpm = Math.max(stats.highestWpm, session.wpm);
    stats.highestStreak = Math.max(stats.highestStreak, session.maxStreak);
    stats.highestScore = Math.max(stats.highestScore, session.score);

    if (characterErrors) {
      if (!stats.characterErrors) stats.characterErrors = {};
      for (const [char, count] of Object.entries(characterErrors)) {
        stats.characterErrors[char] = (stats.characterErrors[char] || 0) + count;
      }
    }

    // Keep last 100 sessions
    stats.sessionsHistory = [newSession, ...stats.sessionsHistory].slice(0, 100);
  });
}

// ---------------------  Custom Texts  ---------------------

export function addCustomText(text: Omit<CustomText, 'id' | 'createdAt'>): CustomText {
  const newText: CustomText = {
    ...text,
    id: uid('custom'),
    createdAt: new Date().toISOString(),
  };
  mutateAndSave((data) => {
    data.customTexts = [newText, ...data.customTexts];
  });
  return newText;
}

export function removeCustomText(id: string): void {
  mutateAndSave((data) => {
    data.customTexts = data.customTexts.filter((t) => t.id !== id);
  });
}

// ---------------------  Settings  ---------------------

export function updateSettings<K extends keyof UserSettings>(
  settings: Pick<UserSettings, K>,
): void {
  mutateAndSave((data) => {
    data.settings = { ...data.settings, ...settings };
  });
}

export function getSettings(): UserSettings {
  return getUserData().settings;
}

// ---------------------  Achievements  ---------------------

export function unlockAchievement(achievement: Omit<Achievement, 'unlockedAt'>): boolean {
  const data = getUserData();
  const existing = data.achievements.find((a) => a.id === achievement.id);
  if (existing?.unlockedAt) return false;

  if (existing) {
    existing.unlockedAt = new Date().toISOString();
  } else {
    data.achievements.push({ ...achievement, unlockedAt: new Date().toISOString() });
  }
  saveUserData(data);
  return true;
}

export function getAchievements(): Achievement[] {
  return getUserData().achievements;
}

// ---------------------  Data Management  ---------------------

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Export all data as a JSON string (for backup / sharing) */
export function exportData(): string {
  return JSON.stringify(getUserData(), null, 2);
}

/** Import data from a JSON string, merging with defaults */
export function importData(json: string): UserData {
  const parsed = JSON.parse(json) as Partial<UserData>;
  const merged = deepMerge(DEFAULT_USER_DATA, parsed);
  saveUserData(merged);
  return merged;
}

// ---------------------  Universe Management  ---------------------

export function getActiveUniverseId(): string {
  return getUserData().activeUniverseId;
}

export function setActiveUniverse(universeId: string): void {
  mutateAndSave((data) => { data.activeUniverseId = universeId; });
}

export function getUniverseProgress(universeId: string): UniverseProgress | undefined {
  return getUserData().universeProgress[universeId];
}

export function updateUniverseProgress(
  universeId: string,
  excerptId: string,
  completed: boolean
): void {
  mutateAndSave((data) => {
    const progress = data.universeProgress[universeId] || {
      universeId,
      completedExcerptIds: [],
      totalExcerpts: 0,
      lastAccessedAt: new Date().toISOString(),
    };
    progress.currentExcerptId = excerptId;
    progress.lastAccessedAt = new Date().toISOString();
    if (completed && !progress.completedExcerptIds.includes(excerptId)) {
      progress.completedExcerptIds.push(excerptId);
    }
    data.universeProgress[universeId] = progress;
  });
}

export function addCustomUniverse(universe: Omit<Universe, 'id' | 'createdAt' | 'isBuiltIn'>): Universe {
  const newUniverse: Universe = {
    ...universe,
    id: uid('universe'),
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };
  mutateAndSave((data) => { data.customUniverses.push(newUniverse); });
  return newUniverse;
}

export function getCustomUniverses(): Universe[] {
  return getUserData().customUniverses;
}

export function deleteCustomUniverse(universeId: string): void {
  mutateAndSave((data) => {
    data.customUniverses = data.customUniverses.filter(u => u.id !== universeId);
    data.customExcerpts = data.customExcerpts.filter(e => e.universeId !== universeId);
    if (data.activeUniverseId === universeId) {
      data.activeUniverseId = BUILT_IN_UNIVERSE_IDS.GENERAL;
    }
  });
}

export function addCustomExcerpt(excerpt: Omit<Excerpt, 'id'>): Excerpt {
  const newExcerpt: Excerpt = { ...excerpt, id: uid('excerpt') };
  mutateAndSave((data) => { data.customExcerpts.push(newExcerpt); });
  return newExcerpt;
}

export function addCustomExcerpts(excerpts: Omit<Excerpt, 'id'>[]): Excerpt[] {
  const newExcerpts = excerpts.map((excerpt, index) => ({
    ...excerpt,
    id: uid(`excerpt-${index}`),
  }));
  mutateAndSave((data) => { data.customExcerpts.push(...newExcerpts); });
  return newExcerpts;
}

export function getExcerptsForUniverse(universeId: string): Excerpt[] {
  return getUserData().customExcerpts.filter(e => e.universeId === universeId);
}
