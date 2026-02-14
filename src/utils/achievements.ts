/**
 * Achievement definitions
 */

import type { UserStats } from './storage';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'streak' | 'endurance' | 'milestone' | 'special';
  check: (stats: UserStats) => { unlocked: boolean; progress?: number; maxProgress?: number };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Speed Achievements
  {
    id: 'speed-novice',
    title: 'Getting Started',
    description: 'Reach 30 WPM in a session',
    icon: '🚀',
    category: 'speed',
    check: (stats) => ({ unlocked: stats.highestWpm >= 30 }),
  },
  {
    id: 'speed-intermediate',
    title: 'Speed Demon',
    description: 'Reach 50 WPM in a session',
    icon: '⚡',
    category: 'speed',
    check: (stats) => ({ unlocked: stats.highestWpm >= 50 }),
  },
  {
    id: 'speed-advanced',
    title: 'Lightning Fingers',
    description: 'Reach 70 WPM in a session',
    icon: '⚡⚡',
    category: 'speed',
    check: (stats) => ({ unlocked: stats.highestWpm >= 70 }),
  },
  {
    id: 'speed-expert',
    title: 'Keyboard Ninja',
    description: 'Reach 90 WPM in a session',
    icon: '🥷',
    category: 'speed',
    check: (stats) => ({ unlocked: stats.highestWpm >= 90 }),
  },
  {
    id: 'speed-master',
    title: 'Speed Master',
    description: 'Reach 120 WPM in a session',
    icon: '👑',
    category: 'speed',
    check: (stats) => ({ unlocked: stats.highestWpm >= 120 }),
  },

  // Accuracy Achievements
  {
    id: 'accuracy-perfect-run',
    title: 'Perfect Run',
    description: 'Complete a text with 100% accuracy',
    icon: '✨',
    category: 'accuracy',
    check: (stats) => {
      const perfect = stats.sessionsHistory.some((s) => s.accuracy === 100);
      return { unlocked: perfect };
    },
  },
  {
    id: 'accuracy-consistent',
    title: 'Consistency King',
    description: 'Maintain 95%+ accuracy over 10 sessions',
    icon: '🎯',
    category: 'accuracy',
    check: (stats) => {
      const recent = stats.sessionsHistory.slice(0, 10);
      const allHighAccuracy = recent.length >= 10 && recent.every((s) => s.accuracy >= 95);
      return { unlocked: allHighAccuracy, progress: recent.filter((s) => s.accuracy >= 95).length, maxProgress: 10 };
    },
  },
  {
    id: 'accuracy-average',
    title: 'Precision Pro',
    description: 'Maintain 90%+ average accuracy',
    icon: '🎖️',
    category: 'accuracy',
    check: (stats) => ({
      unlocked: stats.averageAccuracy >= 90 && stats.totalSessions >= 5,
    }),
  },

  // Streak Achievements
  {
    id: 'streak-10',
    title: 'Hot Streak',
    description: 'Get a 10 character streak',
    icon: '🔥',
    category: 'streak',
    check: (stats) => ({ unlocked: stats.highestStreak >= 10 }),
  },
  {
    id: 'streak-25',
    title: 'On Fire',
    description: 'Get a 25 character streak',
    icon: '🔥🔥',
    category: 'streak',
    check: (stats) => ({ unlocked: stats.highestStreak >= 25 }),
  },
  {
    id: 'streak-50',
    title: 'Unstoppable',
    description: 'Get a 50 character streak',
    icon: '💫',
    category: 'streak',
    check: (stats) => ({ unlocked: stats.highestStreak >= 50 }),
  },
  {
    id: 'streak-100',
    title: 'Perfect Focus',
    description: 'Get a 100 character streak',
    icon: '🌟',
    category: 'streak',
    check: (stats) => ({ unlocked: stats.highestStreak >= 100 }),
  },
  {
    id: 'streak-200',
    title: 'Legendary Focus',
    description: 'Get a 200 character streak',
    icon: '🏆',
    category: 'streak',
    check: (stats) => ({ unlocked: stats.highestStreak >= 200 }),
  },

  // Endurance Achievements
  {
    id: 'endurance-1min',
    title: 'First Minute',
    description: 'Spend 1 minute practicing',
    icon: '⏱️',
    category: 'endurance',
    check: (stats) => ({
      unlocked: stats.totalTimeSpent >= 60,
      progress: Math.min(stats.totalTimeSpent, 60),
      maxProgress: 60,
    }),
  },
  {
    id: 'endurance-10min',
    title: 'Dedicated',
    description: 'Spend 10 minutes practicing',
    icon: '⏰',
    category: 'endurance',
    check: (stats) => ({
      unlocked: stats.totalTimeSpent >= 600,
      progress: Math.min(stats.totalTimeSpent, 600),
      maxProgress: 600,
    }),
  },
  {
    id: 'endurance-30min',
    title: 'Practice Makes Perfect',
    description: 'Spend 30 minutes practicing',
    icon: '⌛',
    category: 'endurance',
    check: (stats) => ({
      unlocked: stats.totalTimeSpent >= 1800,
      progress: Math.min(stats.totalTimeSpent, 1800),
      maxProgress: 1800,
    }),
  },
  {
    id: 'endurance-1hr',
    title: 'Hour of Power',
    description: 'Spend 1 hour practicing',
    icon: '🕐',
    category: 'endurance',
    check: (stats) => ({
      unlocked: stats.totalTimeSpent >= 3600,
      progress: Math.min(stats.totalTimeSpent, 3600),
      maxProgress: 3600,
    }),
  },

  // Milestone Achievements
  {
    id: 'milestone-first',
    title: 'First Steps',
    description: 'Complete your first session',
    icon: '🎉',
    category: 'milestone',
    check: (stats) => ({ unlocked: stats.totalSessions >= 1 }),
  },
  {
    id: 'milestone-10sessions',
    title: 'Getting Hooked',
    description: 'Complete 10 sessions',
    icon: '📚',
    category: 'milestone',
    check: (stats) => ({
      unlocked: stats.totalSessions >= 10,
      progress: stats.totalSessions,
      maxProgress: 10,
    }),
  },
  {
    id: 'milestone-50sessions',
    title: 'Regular',
    description: 'Complete 50 sessions',
    icon: '📖',
    category: 'milestone',
    check: (stats) => ({
      unlocked: stats.totalSessions >= 50,
      progress: stats.totalSessions,
      maxProgress: 50,
    }),
  },
  {
    id: 'milestone-100sessions',
    title: 'Typing Veteran',
    description: 'Complete 100 sessions',
    icon: '🎓',
    category: 'milestone',
    check: (stats) => ({
      unlocked: stats.totalSessions >= 100,
      progress: stats.totalSessions,
      maxProgress: 100,
    }),
  },
  {
    id: 'milestone-1000chars',
    title: '1K Club',
    description: 'Type 1,000 characters',
    icon: '🔤',
    category: 'milestone',
    check: (stats) => ({
      unlocked: stats.totalCharsTyped >= 1000,
      progress: stats.totalCharsTyped,
      maxProgress: 1000,
    }),
  },
  {
    id: 'milestone-10000chars',
    title: '10K Club',
    description: 'Type 10,000 characters',
    icon: '📝',
    category: 'milestone',
    check: (stats) => ({
      unlocked: stats.totalCharsTyped >= 10000,
      progress: stats.totalCharsTyped,
      maxProgress: 10000,
    }),
  },

  // Special Achievements
  {
    id: 'special-highscore-1k',
    title: 'High Scorer',
    description: 'Reach 1,000 points in a single session',
    icon: '🏅',
    category: 'special',
    check: (stats) => ({ unlocked: stats.highestScore >= 1000 }),
  },
  {
    id: 'special-highscore-5k',
    title: 'Score Master',
    description: 'Reach 5,000 points in a single session',
    icon: '🥇',
    category: 'special',
    check: (stats) => ({ unlocked: stats.highestScore >= 5000 }),
  },
  {
    id: 'special-combo',
    title: 'Combo King',
    description: 'Get 50+ WPM with 95%+ accuracy',
    icon: '💎',
    category: 'special',
    check: (stats) => {
      const hasCombo = stats.sessionsHistory.some((s) => s.wpm >= 50 && s.accuracy >= 95);
      return { unlocked: hasCombo };
    },
  },
];

// Check all achievements and return newly unlocked ones
export function checkAchievements(stats: UserStats, unlockedIds: string[]): AchievementDefinition[] {
  const newlyUnlocked: AchievementDefinition[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;
    const result = achievement.check(stats);
    if (result.unlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// Get achievement progress for display
export function getAchievementProgress(
  stats: UserStats,
  unlockedIds: string[]
): Array<AchievementDefinition & { unlocked: boolean; progress?: number; maxProgress?: number }> {
  return ACHIEVEMENTS.map((achievement) => {
    const result = achievement.check(stats);
    return {
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id) || result.unlocked,
      progress: result.progress,
      maxProgress: result.maxProgress,
    };
  });
}
