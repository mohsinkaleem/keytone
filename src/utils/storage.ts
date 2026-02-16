/**
 * Storage utilities for persisting user data
 */

import type { Universe, Excerpt, UniverseProgress } from '../types/universe';
import { BUILT_IN_UNIVERSE_IDS } from '../types/universe';

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
  characterErrors: Record<string, number>; // Track errors per character
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
}

export interface UserData {
  stats: UserStats;
  achievements: Achievement[];
  customTexts: CustomText[];
  settings: UserSettings;
  // Universe expansion
  activeUniverseId: string;
  universeProgress: Record<string, UniverseProgress>;
  customUniverses: Universe[];
  customExcerpts: Excerpt[];
}

const STORAGE_KEY = 'keytone_user_data';

const DEFAULT_USER_DATA: UserData = {
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
  },
  // Universe expansion defaults
  activeUniverseId: BUILT_IN_UNIVERSE_IDS.GENERAL,
  universeProgress: {},
  customUniverses: [],
  customExcerpts: [],
};

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

// Get user data from localStorage
export function getUserData(): UserData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Partial<UserData>;
      return deepMerge(DEFAULT_USER_DATA, parsed);
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
  return { ...DEFAULT_USER_DATA };
}

// Save user data to localStorage
export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
}

// Update user stats after a session
export function updateStats(
  session: Omit<SessionStats, 'id' | 'date'>,
  characterErrors?: Record<string, number>
): UserData {
  const data = getUserData();
  const stats = data.stats;

  const newSession: SessionStats = {
    ...session,
    id: `session-${Date.now()}`,
    date: new Date().toISOString(),
  };

  // Update totals
  stats.totalSessions += 1;
  stats.totalCharsTyped += session.correctChars + session.incorrectChars;
  stats.totalCorrectChars += session.correctChars;
  stats.totalTimeSpent += session.duration;

  // Update averages
  const totalWpm = stats.averageWpm * (stats.totalSessions - 1) + session.wpm;
  stats.averageWpm = Math.round(totalWpm / stats.totalSessions);

  const totalAccuracy = stats.averageAccuracy * (stats.totalSessions - 1) + session.accuracy;
  stats.averageAccuracy = Math.round(totalAccuracy / stats.totalSessions);

  // Update highs
  stats.highestWpm = Math.max(stats.highestWpm, session.wpm);
  stats.highestStreak = Math.max(stats.highestStreak, session.maxStreak);
  stats.highestScore = Math.max(stats.highestScore, session.score);

  // Update character errors
  if (characterErrors) {
    if (!stats.characterErrors) stats.characterErrors = {};
    for (const [char, count] of Object.entries(characterErrors)) {
      stats.characterErrors[char] = (stats.characterErrors[char] || 0) + count;
    }
  }

  // Add to history (keep last 100 sessions)
  stats.sessionsHistory = [newSession, ...stats.sessionsHistory].slice(0, 100);

  data.stats = stats;
  saveUserData(data);

  return data;
}

// Add custom text
export function addCustomText(text: Omit<CustomText, 'id' | 'createdAt'>): CustomText {
  const data = getUserData();
  const newText: CustomText = {
    ...text,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  data.customTexts = [newText, ...data.customTexts];
  saveUserData(data);
  return newText;
}

// Remove custom text
export function removeCustomText(id: string): void {
  const data = getUserData();
  data.customTexts = data.customTexts.filter((t) => t.id !== id);
  saveUserData(data);
}

// Update settings (type-safe: only accepts valid setting keys and values)
export function updateSettings<K extends keyof UserSettings>(
  settings: Pick<UserSettings, K>,
): void {
  const data = getUserData();
  data.settings = { ...data.settings, ...settings };
  saveUserData(data);
}

// Get user settings
export function getSettings(): UserSettings {
  return getUserData().settings;
}

// Unlock achievement
export function unlockAchievement(achievement: Omit<Achievement, 'unlockedAt'>): boolean {
  const data = getUserData();
  const existing = data.achievements.find((a) => a.id === achievement.id);
  if (existing?.unlockedAt) return false; // Already unlocked

  if (existing) {
    existing.unlockedAt = new Date().toISOString();
  } else {
    data.achievements.push({
      ...achievement,
      unlockedAt: new Date().toISOString(),
    });
  }
  saveUserData(data);
  return true;
}

// Get all achievements with their unlock status
export function getAchievements(): Achievement[] {
  return getUserData().achievements;
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============ Universe Management ============

// Get active universe ID
export function getActiveUniverseId(): string {
  return getUserData().activeUniverseId;
}

// Set active universe
export function setActiveUniverse(universeId: string): void {
  const data = getUserData();
  data.activeUniverseId = universeId;
  saveUserData(data);
}

// Get universe progress
export function getUniverseProgress(universeId: string): UniverseProgress | undefined {
  return getUserData().universeProgress[universeId];
}

// Update universe progress
export function updateUniverseProgress(
  universeId: string,
  excerptId: string,
  completed: boolean
): void {
  const data = getUserData();
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
  saveUserData(data);
}

// Add custom universe
export function addCustomUniverse(universe: Omit<Universe, 'id' | 'createdAt' | 'isBuiltIn'>): Universe {
  const data = getUserData();
  const newUniverse: Universe = {
    ...universe,
    id: `universe-${Date.now()}`,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };
  data.customUniverses.push(newUniverse);
  saveUserData(data);
  return newUniverse;
}

// Get custom universes
export function getCustomUniverses(): Universe[] {
  return getUserData().customUniverses;
}

// Delete custom universe
export function deleteCustomUniverse(universeId: string): void {
  const data = getUserData();
  data.customUniverses = data.customUniverses.filter(u => u.id !== universeId);
  // Also delete associated excerpts
  data.customExcerpts = data.customExcerpts.filter(e => e.universeId !== universeId);
  // Reset active universe if deleted
  if (data.activeUniverseId === universeId) {
    data.activeUniverseId = BUILT_IN_UNIVERSE_IDS.GENERAL;
  }
  saveUserData(data);
}

// Add custom excerpt
export function addCustomExcerpt(excerpt: Omit<Excerpt, 'id'>): Excerpt {
  const data = getUserData();
  const newExcerpt: Excerpt = {
    ...excerpt,
    id: `excerpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  data.customExcerpts.push(newExcerpt);
  saveUserData(data);
  return newExcerpt;
}

// Add multiple excerpts (for bulk import)
export function addCustomExcerpts(excerpts: Omit<Excerpt, 'id'>[]): Excerpt[] {
  const data = getUserData();
  const newExcerpts = excerpts.map((excerpt, index) => ({
    ...excerpt,
    id: `excerpt-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
  }));
  data.customExcerpts.push(...newExcerpts);
  saveUserData(data);
  return newExcerpts;
}

// Get excerpts for a universe
export function getExcerptsForUniverse(universeId: string): Excerpt[] {
  return getUserData().customExcerpts.filter(e => e.universeId === universeId);
}
