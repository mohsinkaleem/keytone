import { useState, useEffect, useCallback } from 'react';
import { TextDisplay } from './TextDisplay';
import { TypingStats } from './TypingStats';
import { AudioVisualizer } from './AudioVisualizer';
import { ComboAnimation } from './ComboAnimation';
import { AchievementPopup } from './AchievementPopup';
import { StatsPanel } from './StatsPanel';
import { CustomTextModal } from './CustomTextModal';
import { TimedModeOverlay } from './TimedModeOverlay';
import { VirtualKeyboard } from './VirtualKeyboard';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { CompletionScreen } from './CompletionScreen';
import { useTypingPractice } from '../hooks/useTypingPractice';
import { useAudio } from '../contexts/useAudio';
import {
  CATEGORIES,
  getRandomText,
  getTextsByCategory,
  type TypingText,
  type Category,
} from '../utils/typingTexts';
import {
  getUserData,
  updateStats,
  addCustomText,
  updateSettings,
  unlockAchievement,
  type CustomText,
  type UserSettings,
} from '../utils/storage';
import { checkAchievements, type AchievementDefinition } from '../utils/achievements';

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function TypingPractice() {
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
  const [chordProgression, setChordProgression] = useState<'pop' | 'classic' | 'jazz' | 'blues' | 'ambient'>(
    (userData.settings.chordProgression as 'pop' | 'classic' | 'jazz' | 'blues' | 'ambient') || 'pop'
  );

  // Achievement popup state
  const [currentAchievement, setCurrentAchievement] = useState<AchievementDefinition | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDefinition[]>([]);

  // Custom texts merged with default texts
  const customTextsAsTypingTexts = useCallback((): TypingText[] => {
    return userData.customTexts.map((ct: CustomText) => ({
      id: ct.id,
      title: ct.title,
      text: ct.text,
      difficulty: ct.difficulty,
      category: 'quotes' as Category,
    }));
  }, [userData.customTexts]);

  // Handle completion callback
  const handleComplete = (stats: {
    correctChars: number;
    incorrectChars: number;
    wpm: number;
    accuracy: number;
    score: number;
    elapsedTime: number;
    maxStreak: number;
    characterErrors: Record<string, number>;
  }) => {
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
    }, stats.characterErrors);

    setUserData(updatedData);

    const newAchievements = checkAchievements(updatedData.stats, unlockedAchievementIds);
    if (newAchievements.length > 0) {
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
    chordProgression,
    onComplete: handleComplete,
  });

  // Process achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sequentially dequeuing achievements for popup display; queue-processing pattern requires effect-driven state sync
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // Get next random text in category/difficulty
  const handleNextText = useCallback(() => {
    let texts = getTextsByCategory(selectedCategory);
    if (selectedDifficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === selectedDifficulty);
    }
    if (selectedCategory === 'all' || selectedCategory === 'quotes') {
      texts = [...texts, ...customTextsAsTypingTexts()];
    }
    if (texts.length === 0) texts = [getRandomText()];
    const availableTexts = texts.filter((t) => t.id !== selectedText.id);
    const newText = availableTexts.length > 0
      ? pickRandom(availableTexts)
      : texts[0];
    setSelectedText(newText);
    reset();
  }, [selectedCategory, selectedDifficulty, selectedText.id, customTextsAsTypingTexts, reset]);

  // Handle category change
  const handleCategoryChange = useCallback((category: Category | 'all') => {
    setSelectedCategory(category);
    let texts = getTextsByCategory(category);
    if (selectedDifficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === selectedDifficulty);
    }
    if (texts.length > 0) {
      setSelectedText(pickRandom(texts));
      reset();
    }
  }, [selectedDifficulty, reset]);

  // Handle difficulty change
  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    let texts = getTextsByCategory(selectedCategory);
    if (difficulty !== 'all') {
      texts = texts.filter((t) => t.difficulty === difficulty);
    }
    if (texts.length > 0) {
      setSelectedText(pickRandom(texts));
      reset();
    }
  }, [selectedCategory, reset]);

  // Handle adding custom text
  const handleAddCustomText = (text: Omit<CustomText, 'id' | 'createdAt'>) => {
    const newText = addCustomText(text);
    setUserData(getUserData());
    setShowCustomTextModal(false);
    setSelectedText({
      id: newText.id,
      title: newText.title,
      text: newText.text,
      difficulty: newText.difficulty,
      category: 'quotes',
    });
    reset();
  };

  // Save settings changes (type-safe)
  const handleSettingsChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    updateSettings({ [key]: value } as Pick<UserSettings, K>);
    setUserData(getUserData());
  };

  // Handle timed mode time up
  const handleTimeUp = () => {
    forceComplete();
  };

  // Keyboard shortcuts
  const { toggleMute, isMuted } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle mute with Alt+M
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute(!isMuted);
      }

      if (e.key === 'Tab' && (stats.isComplete || !isStarted)) {
        e.preventDefault();
        handleNextText();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stats.isComplete, isStarted, handleNextText, reset, isMuted, toggleMute]);

  // Completion screen
  if (stats.isComplete) {
    return (
      <CompletionScreen
        stats={stats}
        timedMode={timedMode}
        currentAchievement={currentAchievement}
        onDismissAchievement={() => setCurrentAchievement(null)}
        userStats={userData.stats}
        unlockedAchievementIds={unlockedAchievementIds}
        onReset={reset}
        onNextText={handleNextText}
      />
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

      {/* Header */}
      <Header
        onShowStats={() => setShowStats(true)}
        onShowCustomText={() => setShowCustomTextModal(true)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Settings panel (collapsible) */}
      {showSettings && (
        <SettingsPanel
          enableBackspace={enableBackspace}
          onEnableBackspaceChange={setEnableBackspace}
          showVisualizer={showVisualizer}
          onShowVisualizerChange={setShowVisualizer}
          showKeyboard={showKeyboard}
          onShowKeyboardChange={setShowKeyboard}
          timedMode={timedMode}
          chordProgression={chordProgression}
          onChordProgressionChange={setChordProgression}
          onTimedModeChange={setTimedMode}
          onSettingsChange={handleSettingsChange}
          onReset={reset}
        />
      )}

      {/* Category and Difficulty tabs */}
      <div className="px-6 py-1.5 border-b border-gray-800 bg-gray-900/30 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 min-w-max">
          {/* Categories */}
          <div className="flex bg-gray-800/40 p-1 rounded-xl">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {userData.customTexts.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory('quotes');
                  const customTexts = customTextsAsTypingTexts();
                  if (customTexts.length > 0) {
                    setSelectedText(customTexts[0]);
                    reset();
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === 'quotes' && userData.customTexts.some(ct => ct.id === selectedText.id)
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Custom ({userData.customTexts.length})
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-gray-700 mx-1" />

          {/* Difficulty */}
          <div className="flex bg-gray-800/40 p-1 rounded-xl">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => handleDifficultyChange(diff.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === diff.value
                    ? diff.value === 'easy'
                      ? 'bg-green-600 text-white shadow-sm'
                      : diff.value === 'medium'
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : diff.value === 'hard'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-5xl space-y-10">
          {/* Text info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">{selectedText.title}</h2>
              <p className="text-xs text-gray-400">
                {selectedText.category} • {selectedText.difficulty} • {selectedText.text.length} chars
                {enableBackspace && ' • Backspace enabled'}
              </p>
            </div>
            <button
              onClick={handleNextText}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
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
          <div className="w-full max-w-4xl mt-8">
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
      <footer className="px-6 py-2 border-t border-gray-800 flex items-center justify-center gap-4 text-xs text-gray-500">
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
