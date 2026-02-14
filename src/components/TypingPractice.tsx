import { useState, useEffect } from 'react';
import { TextDisplay } from './TextDisplay';
import { TypingStats } from './TypingStats';
import { AudioVisualizer } from './AudioVisualizer';
import { ComboAnimation } from './ComboAnimation';
import { AchievementPopup } from './AchievementPopup';
import { StatsPanel } from './StatsPanel';
import { CustomTextModal } from './CustomTextModal';
import { TimedModeOverlay } from './TimedModeOverlay';
import { VirtualKeyboard } from './VirtualKeyboard';
import { useTypingPractice } from '../hooks/useTypingPractice';
import { 
  CATEGORIES, 
  getRandomText, 
  getTextsByCategory,
  type TypingText, 
  type Category 
} from '../utils/typingTexts';
import {
  getUserData,
  updateStats,
  addCustomText,
  updateSettings,
  unlockAchievement,
  type CustomText,
} from '../utils/storage';
import { checkAchievements, type AchievementDefinition } from '../utils/achievements';
import { SOUND_THEMES, type SoundTheme } from '../audio';

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TIMED_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Untimed' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
];

interface TypingPracticeProps {
  soundTheme: SoundTheme;
  onSoundThemeChange: (theme: SoundTheme) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function TypingPractice({
  soundTheme,
  onSoundThemeChange,
  volume,
  onVolumeChange,
}: TypingPracticeProps) {
  // User data state
  const [userData, setUserData] = useState(() => getUserData());
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(
    () => userData.achievements.filter(a => a.unlockedAt).map(a => a.id)
  );

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [selectedText, setSelectedText] = useState<TypingText>(() => getRandomText('all'));
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCustomTextModal, setShowCustomTextModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(userData.settings.showVisualizer);
  const [showKeyboard, setShowKeyboard] = useState(userData.settings.showKeyboard ?? true);
  const [enableBackspace, setEnableBackspace] = useState(userData.settings.enableBackspace);
  const [timedMode, setTimedMode] = useState<number | null>(null);
  
  // Achievement popup state
  const [currentAchievement, setCurrentAchievement] = useState<AchievementDefinition | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDefinition[]>([]);

  // Custom texts merged with default texts
  const customTextsAsTypingTexts = (): TypingText[] => {
    return userData.customTexts.map((ct: CustomText) => ({
      id: ct.id,
      title: ct.title,
      text: ct.text,
      difficulty: ct.difficulty,
      category: 'quotes' as Category, // Custom texts go in quotes category
    }));
  };

  // Handle completion callback
  const handleComplete = (stats: {
    correctChars: number;
    incorrectChars: number;
    wpm: number;
    accuracy: number;
    score: number;
    elapsedTime: number;
    maxStreak: number;
  }) => {
    // Save session stats
    const updatedData = updateStats({
      textId: selectedText.id,
      textTitle: selectedText.title,
      category: selectedText.category,
      difficulty: selectedText.difficulty,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      score: stats.score,
      duration: stats.elapsedTime,
      correctChars: stats.correctChars,
      incorrectChars: stats.incorrectChars,
      maxStreak: stats.maxStreak,
    });

    setUserData(updatedData);

    // Check for new achievements
    const newAchievements = checkAchievements(updatedData.stats, unlockedAchievementIds);
    if (newAchievements.length > 0) {
      // Unlock achievements and add to queue
      newAchievements.forEach((a) => unlockAchievement(a));
      setUnlockedAchievementIds((prev) => [...prev, ...newAchievements.map((a) => a.id)]);
      setAchievementQueue((prev) => [...prev, ...newAchievements]);
    }
  };

  const { currentIndex, typedChars, stats, isStarted, reset, forceComplete } = useTypingPractice({
    text: selectedText.text,
    autoStart: true,
    enableBackspace,
    timedMode,
    onComplete: handleComplete,
  });

  // Process achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // Get next random text in category/difficulty
  const handleNextText = () => {
    let texts = getTextsByCategory(selectedCategory);
    if (selectedDifficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === selectedDifficulty);
    }
    // Add custom texts if viewing all or quotes
    if (selectedCategory === 'all' || selectedCategory === 'quotes') {
      texts = [...texts, ...customTextsAsTypingTexts()];
    }
    if (texts.length === 0) texts = [getRandomText()];
    const availableTexts = texts.filter((t) => t.id !== selectedText.id);
    const newText = availableTexts.length > 0
      ? availableTexts[Math.floor(Math.random() * availableTexts.length)]
      : texts[0];
    setSelectedText(newText);
    reset();
  };

  // Handle category change
  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    let texts = getTextsByCategory(category);
    if (selectedDifficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === selectedDifficulty);
    }
    if (texts.length > 0) {
      setSelectedText(texts[Math.floor(Math.random() * texts.length)]);
      reset();
    }
  };

  // Handle difficulty change
  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    let texts = getTextsByCategory(selectedCategory);
    if (difficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === difficulty);
    }
    if (texts.length > 0) {
      setSelectedText(texts[Math.floor(Math.random() * texts.length)]);
      reset();
    }
  };

  // Handle adding custom text
  const handleAddCustomText = (text: Omit<CustomText, 'id' | 'createdAt'>) => {
    const newText = addCustomText(text);
    setUserData(getUserData());
    setShowCustomTextModal(false);
    // Select the newly added text
    setSelectedText({
      id: newText.id,
      title: newText.title,
      text: newText.text,
      difficulty: newText.difficulty,
      category: 'quotes',
    });
    reset();
  };

  // Save settings changes
  const handleSettingsChange = (key: string, value: unknown) => {
    updateSettings({ [key]: value });
    setUserData(getUserData());
  };

  // Handle timed mode time up
  const handleTimeUp = () => {
    forceComplete();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab to get new text (only when not typing or completed)
      if (e.key === 'Tab' && (stats.isComplete || !isStarted)) {
        e.preventDefault();
        handleNextText();
      }
      // Escape to reset
      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stats.isComplete, isStarted, handleNextText, reset]);

  // Completion screen
  if (stats.isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Achievement popup */}
        <AchievementPopup
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
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
              onClick={() => reset()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleNextText}
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
            stats={userData.stats}
            unlockedAchievementIds={unlockedAchievementIds}
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    );
  }

  // Main typing view
  return (
    <div className="flex-1 flex flex-col">
      {/* Combo animations */}
      <ComboAnimation streak={stats.currentStreak} show={isStarted && !stats.isComplete} />

      {/* Achievement popup */}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />

      {/* Timed mode overlay */}
      {timedMode && isStarted && (
        <TimedModeOverlay
          duration={timedMode}
          isActive={isStarted && !stats.isComplete}
          onTimeUp={handleTimeUp}
          onReset={reset}
        />
      )}

      {/* Top bar with branding and controls */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Keytone
          </h1>
          <span className="text-gray-500 text-sm hidden sm:block">Type with music</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats button */}
          <button
            onClick={() => setShowStats(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Statistics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Add custom text button */}
          <button
            onClick={() => setShowCustomTextModal(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Add Custom Text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Settings panel (collapsible) */}
      {showSettings && (
        <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-800 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Sound Theme */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Sound</span>
              <div className="flex bg-gray-800 rounded-lg p-1 flex-wrap">
                {SOUND_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => onSoundThemeChange(theme.value)}
                    title={theme.label}
                    className={`px-3 py-1.5 flex items-center gap-1 rounded text-sm transition-all ${
                      soundTheme === theme.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span className="hidden sm:inline">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Vol</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume control"
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Timed Mode */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Timer</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                {TIMED_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setTimedMode(opt.value);
                      reset();
                    }}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timedMode === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Backspace Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBackspace}
                onChange={(e) => {
                  setEnableBackspace(e.target.checked);
                  handleSettingsChange('enableBackspace', e.target.checked);
                }}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">Allow Backspace</span>
            </label>

            {/* Visualizer Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVisualizer}
                onChange={(e) => {
                  setShowVisualizer(e.target.checked);
                  handleSettingsChange('showVisualizer', e.target.checked);
                }}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">Audio Visualizer</span>
            </label>

            {/* Keyboard Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showKeyboard}
                onChange={(e) => {
                  setShowKeyboard(e.target.checked);
                  handleSettingsChange('showKeyboard', e.target.checked);
                }}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">Virtual Keyboard</span>
            </label>
          </div>
        </div>
      )}

      {/* Category and Difficulty tabs */}
      <div className="px-6 py-3 border-b border-gray-800 overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Categories */}
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {userData.customTexts.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory('quotes');
                  if (customTextsAsTypingTexts.length > 0) {
                    setSelectedText(customTextsAsTypingTexts[0]);
                    reset();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-gray-800 transition-all"
              >
                Custom ({userData.customTexts.length})
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-gray-700" />

          {/* Difficulty */}
          <div className="flex gap-2 min-w-max">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => handleDifficultyChange(diff.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDifficulty === diff.value
                    ? diff.value === 'easy'
                      ? 'bg-green-600 text-white'
                      : diff.value === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : diff.value === 'hard'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Visualizer */}
      {showVisualizer && (
        <div className="px-6 py-2 border-b border-gray-800">
          <AudioVisualizer isActive={isStarted} height={40} style="bars" colorScheme="gradient" />
        </div>
      )}

      {/* Main typing area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Text info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedText.title}</h2>
              <p className="text-sm text-gray-500">
                {selectedText.category} • {selectedText.difficulty} • {selectedText.text.length} chars
                {enableBackspace && ' • Backspace enabled'}
              </p>
            </div>
            <button
              onClick={handleNextText}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Press Tab for new text"
            >
              Skip →
            </button>
          </div>

          {/* Stats bar (when typing) */}
          {isStarted && <TypingStats stats={stats} />}

          {/* Text display */}
          <TextDisplay
            text={selectedText.text}
            currentIndex={currentIndex}
            typedChars={typedChars}
          />

          {/* Start hint */}
          {!isStarted && (
            <p className="text-center text-gray-400 animate-pulse">
              Start typing to begin...
              {timedMode && <span className="block text-indigo-400 mt-1">Timed Mode: {timedMode}s</span>}
            </p>
          )}
        </div>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <div className="w-full max-w-4xl mt-6">
            <VirtualKeyboard
              currentChar={selectedText.text[currentIndex]}
              lastTypedChar={typedChars[typedChars.length - 1]?.char}
              isCorrect={typedChars[typedChars.length - 1]?.correct ?? true}
              isActive={isStarted || !stats.isComplete}
            />
          </div>
        )}
      </div>

      {/* Footer hints */}
      <footer className="px-6 py-3 border-t border-gray-800 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Tab</kbd> new text
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd> restart
        </span>
        {enableBackspace && (
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">⌫</kbd> backspace
          </span>
        )}
      </footer>

      {/* Stats Panel Modal */}
      {showStats && (
        <StatsPanel
          stats={userData.stats}
          unlockedAchievementIds={unlockedAchievementIds}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Custom Text Modal */}
      {showCustomTextModal && (
        <CustomTextModal
          onSave={handleAddCustomText}
          onClose={() => setShowCustomTextModal(false)}
          existingTexts={userData.customTexts}
        />
      )}
    </div>
  );
}

export default TypingPractice;
