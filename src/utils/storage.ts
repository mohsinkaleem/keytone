/**
 * Storage utilities for persisting user data
 */

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
  volume: number;
  waveform: string;
  showVisualizer: boolean;
  showKeyboard: boolean;
  enableBackspace: boolean;
  scale: string;
}

export interface UserData {
  stats: UserStats;
  achievements: Achievement[];
  customTexts: CustomText[];
  settings: UserSettings;
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
  },
  achievements: [],
  customTexts: [],
  settings: {
    soundTheme: 'piano',
    volume: 0.5,
    waveform: 'sine',
    showVisualizer: true,
    showKeyboard: true,
    enableBackspace: true,
    scale: 'C Major Pentatonic',
  },
};

// Get user data from localStorage
export function getUserData(): UserData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_USER_DATA, ...parsed };
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
export function updateStats(session: Omit<SessionStats, 'id' | 'date'>): UserData {
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

// Update settings
export function updateSettings(settings: Partial<UserSettings>): void {
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
