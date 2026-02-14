import { useState } from 'react';
import { TypingStats } from './TypingStats';
import { AchievementPopup } from './AchievementPopup';
import { StatsPanel } from './StatsPanel';
import type { TypingStats as Stats } from '../hooks/useTypingPractice';
import type { AchievementDefinition } from '../utils/achievements';
import type { UserStats } from '../utils/storage';

interface CompletionScreenProps {
  stats: Stats;
  timedMode: number | null;
  currentAchievement: AchievementDefinition | null;
  onDismissAchievement: () => void;
  userStats: UserStats;
  unlockedAchievementIds: string[];
  onReset: () => void;
  onNextText: () => void;
}

export function CompletionScreen({
  stats,
  timedMode,
  currentAchievement,
  onDismissAchievement,
  userStats,
  unlockedAchievementIds,
  onReset,
  onNextText,
}: CompletionScreenProps) {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      {/* Achievement popup */}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={onDismissAchievement}
      />

      <div className="w-full max-w-2xl space-y-8">
        {/* Celebration */}
        <div className="text-center space-y-2">
          <div className="text-5xl">
            {stats.accuracy >= 95 ? '🎉' : stats.accuracy >= 85 ? '👏' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-white">Complete!</h2>
          {timedMode && (
            <p className="text-indigo-400">Timed Mode: {timedMode}s</p>
          )}
        </div>

        {/* Final stats */}
        <TypingStats stats={stats} showDetailed />

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onNextText}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Next Text
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            View Stats
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Press <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Tab</kbd> for new text
          or <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Esc</kbd> to retry
        </p>
      </div>

      {/* Stats panel modal */}
      {showStats && (
        <StatsPanel
          stats={userStats}
          unlockedAchievementIds={unlockedAchievementIds}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}

export default CompletionScreen;
