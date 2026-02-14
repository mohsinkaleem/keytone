import { memo } from 'react';
import type { TypingStats as Stats } from '../hooks/useTypingPractice';

interface TypingStatsProps {
  stats: Stats;
  showDetailed?: boolean;
}

export const TypingStats = memo(function TypingStats({
  stats,
  showDetailed = false,
}: TypingStatsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Streak multiplier display
  const getMultiplierText = (streak: number): string => {
    if (streak >= 100) return '10x';
    if (streak >= 50) return '5x';
    if (streak >= 25) return '3x';
    if (streak >= 10) return '2x';
    return '1x';
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 50) return 'text-yellow-400';
    if (streak >= 25) return 'text-purple-400';
    if (streak >= 10) return 'text-indigo-400';
    return 'text-gray-400';
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl">
      {/* Score */}
      <div className="text-center">
        <div className="text-3xl font-bold text-indigo-400">
          {stats.score.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-gray-700" />

      {/* WPM */}
      <div className="text-center">
        <div className="text-2xl font-semibold text-white">{stats.wpm}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">WPM</div>
      </div>

      {/* Accuracy */}
      <div className="text-center">
        <div
          className={`text-2xl font-semibold ${
            stats.accuracy >= 95
              ? 'text-green-400'
              : stats.accuracy >= 85
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {stats.accuracy}%
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</div>
      </div>

      {/* Streak */}
      <div className="text-center">
        <div className={`text-2xl font-semibold ${getStreakColor(stats.currentStreak)}`}>
          {stats.currentStreak}
          <span className="text-sm ml-1 opacity-70">
            {getMultiplierText(stats.currentStreak)}
          </span>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Streak</div>
      </div>

      {/* Time */}
      <div className="text-center">
        <div className="text-2xl font-semibold text-white">
          {formatTime(stats.elapsedTime)}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
      </div>

      {/* Detailed stats (shown on completion) */}
      {showDetailed && (
        <>
          <div className="h-12 w-px bg-gray-700" />
          <div className="text-center">
            <div className="text-xl font-semibold text-green-400">
              {stats.correctChars}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-red-400">
              {stats.incorrectChars}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-purple-400">
              {stats.maxStreak}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Best Streak</div>
          </div>
        </>
      )}
    </div>
  );
});

export default TypingStats;
