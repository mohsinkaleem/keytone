import { useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { UserStats, SessionStats } from '../utils/storage';
import { getAchievementProgress } from '../utils/achievements';

interface StatsPanelProps {
  stats: UserStats;
  unlockedAchievementIds: string[];
  onClose: () => void;
}

export function StatsPanel({
  stats,
  unlockedAchievementIds,
  onClose,
}: StatsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const achievementsProgress = getAchievementProgress(stats, unlockedAchievementIds);
  const totalAchievements = achievementsProgress.length;
  const unlockedCount = achievementsProgress.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Statistics & Achievements</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['overview', 'history', 'achievements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white bg-gray-800 border-b-2 border-indigo-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {tab === 'achievements' && (
                <span className="ml-2 text-xs text-indigo-400">
                  {unlockedCount}/{totalAchievements}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Sessions" value={stats.totalSessions.toString()} />
                <StatCard label="Total Time" value={formatTime(stats.totalTimeSpent)} />
                <StatCard label="Chars Typed" value={stats.totalCharsTyped.toLocaleString()} />
                <StatCard label="Correct Chars" value={stats.totalCorrectChars.toLocaleString()} />
                <StatCard label="Average WPM" value={stats.averageWpm.toString()} highlight />
                <StatCard label="Average Accuracy" value={`${stats.averageAccuracy}%`} highlight />
                <StatCard label="Highest WPM" value={stats.highestWpm.toString()} gold />
                <StatCard label="Highest Streak" value={stats.highestStreak.toString()} gold />
                <StatCard
                  label="Highest Score"
                  value={stats.highestScore.toLocaleString()}
                  gold
                  className="col-span-2"
                />
              </div>

              {stats.sessionsHistory.length > 1 && (
                <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">WPM Progress (Last 10 Sessions)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.sessionsHistory.slice(-10).map((s, i) => ({
                          name: i + 1,
                          wpm: s.wpm,
                          fullDate: new Date(s.date).toLocaleDateString(),
                        }))}
                      >
                        <defs>
                          <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          itemStyle={{ color: '#818cf8' }}
                          labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="wpm"
                          stroke="#818cf8"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorWpm)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {stats.sessionsHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No sessions yet. Start typing to build your history!
                </div>
              ) : (
                stats.sessionsHistory.map((session: SessionStats) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">{session.textTitle}</div>
                      <div className="text-sm text-gray-400">
                        {session.category} • {session.difficulty} • {formatDate(session.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-indigo-400">{session.wpm}</div>
                        <div className="text-xs text-gray-500">WPM</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-bold ${
                            session.accuracy >= 95
                              ? 'text-green-400'
                              : session.accuracy >= 85
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {session.accuracy}%
                        </div>
                        <div className="text-xs text-gray-500">Acc</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-400">
                          {session.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsProgress.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border-yellow-500/30'
                      : 'bg-gray-800/50 border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{achievement.title}</span>
                        {achievement.unlocked && (
                          <span className="text-xs text-green-400">✓</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all"
                              style={{
                                width: `${
                                  (achievement.progress / (achievement.maxProgress || 1)) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component
function StatCard({
  label,
  value,
  highlight = false,
  gold = false,
  className = '',
}: {
  label: string;
  value: string;
  highlight?: boolean;
  gold?: boolean;
  className?: string;
}) {
  return (
    <div className={`p-4 bg-gray-800/50 rounded-xl ${className}`}>
      <div
        className={`text-2xl font-bold ${
          gold
            ? 'text-yellow-400'
            : highlight
            ? 'text-indigo-400'
            : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default StatsPanel;
