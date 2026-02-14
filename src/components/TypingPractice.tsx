import { memo, useState, useCallback, useEffect } from 'react';
import { TextDisplay } from './TextDisplay';
import { TypingStats } from './TypingStats';
import { useTypingPractice } from '../hooks/useTypingPractice';
import { 
  CATEGORIES, 
  getRandomText, 
  getTextsByCategory,
  type TypingText, 
  type Category 
} from '../utils/typingTexts';
import type { WaveformType } from '../audio';

const WAVEFORMS: { value: WaveformType; label: string; icon: string }[] = [
  { value: 'sine', label: 'Soft', icon: '∿' },
  { value: 'triangle', label: 'Warm', icon: '△' },
  { value: 'square', label: 'Retro', icon: '▢' },
  { value: 'sawtooth', label: 'Bright', icon: '⩘' },
];

interface TypingPracticeProps {
  waveform: WaveformType;
  onWaveformChange: (waveform: WaveformType) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const TypingPractice = memo(function TypingPractice({
  waveform,
  onWaveformChange,
  volume,
  onVolumeChange,
}: TypingPracticeProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedText, setSelectedText] = useState<TypingText>(() => getRandomText('all'));
  const [showSettings, setShowSettings] = useState(false);

  const { currentIndex, typedChars, stats, isStarted, reset } = useTypingPractice({
    text: selectedText.text,
    autoStart: true, // Auto-start when user types
  });

  // Get next random text in category
  const handleNextText = useCallback(() => {
    const newText = getRandomText(selectedCategory, undefined, selectedText.id);
    setSelectedText(newText);
    reset();
  }, [selectedCategory, selectedText.id, reset]);

  // Handle category change
  const handleCategoryChange = useCallback((category: Category | 'all') => {
    setSelectedCategory(category);
    const texts = getTextsByCategory(category);
    if (texts.length > 0) {
      setSelectedText(texts[Math.floor(Math.random() * texts.length)]);
      reset();
    }
  }, [reset]);

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
        <div className="w-full max-w-2xl space-y-8">
          {/* Celebration */}
          <div className="text-center space-y-2">
            <div className="text-5xl">
              {stats.accuracy >= 95 ? '🎉' : stats.accuracy >= 85 ? '👏' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-white">Complete!</h2>
          </div>

          {/* Final stats */}
          <TypingStats stats={stats} showDetailed />

          {/* Actions */}
          <div className="flex justify-center gap-3">
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
          </div>

          <p className="text-center text-gray-500 text-sm">
            Press <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Tab</kbd> for new text
            or <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Esc</kbd> to retry
          </p>
        </div>
      </div>
    );
  }

  // Main typing view
  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar with branding and controls */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Keytone
          </h1>
          <span className="text-gray-500 text-sm hidden sm:block">Type with music</span>
        </div>

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
      </header>

      {/* Settings panel (collapsible) */}
      {showSettings && (
        <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-800 flex flex-wrap items-center justify-center gap-6">
          {/* Waveform */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Sound</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              {WAVEFORMS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => onWaveformChange(w.value)}
                  title={w.label}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
                    waveform === w.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {w.icon}
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
        </div>
      )}

      {/* Category tabs */}
      <div className="px-6 py-3 border-b border-gray-800 overflow-x-auto">
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
        </div>
      </div>

      {/* Main typing area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Text info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedText.title}</h2>
              <p className="text-sm text-gray-500">
                {selectedText.category} • {selectedText.difficulty} • {selectedText.text.length} chars
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
            </p>
          )}
        </div>
      </div>

      {/* Footer hints */}
      <footer className="px-6 py-3 border-t border-gray-800 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Tab</kbd> new text
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd> restart
        </span>
      </footer>
    </div>
  );
});

export default TypingPractice;
