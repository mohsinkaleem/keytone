import { useState } from 'react';
import { TypingStats } from './TypingStats';
import { AchievementPopup } from './AchievementPopup';
import { StatsPanel } from './StatsPanel';
import { CanvasAreaChart } from './CanvasAreaChart';
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

  // Get top 5 mistakes
  const topMistakes = Object.entries(stats.characterErrors || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
      {/* Achievement popup */}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={onDismissAchievement}
      />

      <div className="w-full max-w-4xl space-y-8 py-8">
        {/* Celebration */}
        <div className="text-center space-y-2">
          <div className="text-5xl animate-bounce">
            {stats.accuracy >= 95 ? '🎉' : stats.accuracy >= 85 ? '👏' : '💪'}
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Complete!</h2>
          {timedMode && (
            <p className="text-indigo-400 font-medium">Timed Mode: {timedMode}s</p>
          )}
        </div>

        {/* Final stats summary row */}
        <TypingStats stats={stats} showDetailed />

        {/* Session Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Graph */}
          <div className="lg:col-span-2 p-6 bg-gray-800/40 rounded-2xl border border-gray-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Performance Trend</h3>
              <div className="flex gap-4 text-[10px] items-center">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> WPM
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2 h-1 bg-gray-600"></span> Raw
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="text-base">×</span> Error
                </div>
              </div>
            </div>
            {stats.history.length > 0 ? (
              <CanvasAreaChart
                data={stats.history.map(h => ({
                  name: h.time,
                  wpm: h.wpm,
                  rawWpm: h.rawWpm,
                  isError: h.isError
                }))}
                showRawWpm
                showErrors
                height={200}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                Session was too short for trend data
              </div>
            )}
          </div>

          {/* Top Mistakes */}
          <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-700/50 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Top Mistakes</h3>
            {topMistakes.length > 0 ? (
              <div className="space-y-3">
                {topMistakes.map(([char, count]) => (
                  <div key={char} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-gray-700 rounded-md font-mono text-white text-lg">
                        {char === ' ' ? '␣' : char}
                      </span>
                      <span className="text-gray-400 text-sm">Character</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">{count}</span>
                      <span className="text-gray-600 text-xs">errors</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="text-2xl">🎯</div>
                <p className="text-gray-400 text-sm">Perfect session! No mistakes found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onReset}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={onNextText}
            className="px-8 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Next Text
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Lifetime Stats
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs mx-1">Tab</kbd> for new text
          or <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs mx-1">Esc</kbd> to retry
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
