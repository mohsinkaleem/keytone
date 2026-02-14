import { useState, useCallback, useEffect, useRef } from 'react';
import { audioEngine } from '../audio';
import { midiToFrequency, ScaleWalker } from '../utils/noteUtils';

export interface TypingStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  currentStreak: number;
  maxStreak: number;
  wpm: number;
  accuracy: number;
  score: number;
  elapsedTime: number;
  isComplete: boolean;
}

interface UseTypingPracticeOptions {
  text: string;
  autoStart?: boolean; // Auto-start when user types first character
  onComplete?: (stats: TypingStats) => void;
}

interface UseTypingPracticeReturn {
  currentIndex: number;
  typedChars: Array<{ char: string; correct: boolean }>;
  stats: TypingStats;
  isStarted: boolean;
  start: () => void;
  reset: () => void;
  handleKeyPress: (key: string) => void;
}

// Score configuration
const SCORE_CONFIG = {
  correctChar: 10,
  incorrectPenalty: 5,
  streakBonus: {
    10: 2,   // 2x multiplier at 10 streak
    25: 3,   // 3x at 25
    50: 5,   // 5x at 50
    100: 10, // 10x at 100
  },
  accuracyBonus: {
    95: 500,
    90: 250,
    85: 100,
  },
  wpmBonus: {
    80: 500,
    60: 250,
    40: 100,
  },
};

// Discordant frequencies for errors
const ERROR_FREQUENCIES = [233.08, 246.94]; // Bb3 and B3 - dissonant

export function useTypingPractice({
  text,
  autoStart = false,
  onComplete,
}: UseTypingPracticeOptions): UseTypingPracticeReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<Array<{ char: string; correct: boolean }>>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState<TypingStats>({
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    currentStreak: 0,
    maxStreak: 0,
    wpm: 0,
    accuracy: 100,
    score: 0,
    elapsedTime: 0,
    isComplete: false,
  });

  const scaleWalkerRef = useRef(new ScaleWalker('C Major Pentatonic'));
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const completionHandledRef = useRef(false);
  const autoStartRef = useRef(autoStart);

  // Keep autoStartRef in sync
  useEffect(() => {
    autoStartRef.current = autoStart;
  }, [autoStart]);

  // Calculate score multiplier based on streak
  const getStreakMultiplier = useCallback((streak: number): number => {
    if (streak >= 100) return SCORE_CONFIG.streakBonus[100];
    if (streak >= 50) return SCORE_CONFIG.streakBonus[50];
    if (streak >= 25) return SCORE_CONFIG.streakBonus[25];
    if (streak >= 10) return SCORE_CONFIG.streakBonus[10];
    return 1;
  }, []);

  // Play sound for correct key
  const playCorrectSound = useCallback(() => {
    const midiNote = scaleWalkerRef.current.getNextNote();
    const frequency = midiToFrequency(midiNote);
    audioEngine.playNote(frequency);
    setTimeout(() => audioEngine.stopNote(frequency), 150);
  }, []);

  // Play sound for incorrect key
  const playErrorSound = useCallback(() => {
    ERROR_FREQUENCIES.forEach((freq) => {
      audioEngine.playNote(freq);
      setTimeout(() => audioEngine.stopNote(freq), 100);
    });
  }, []);

  // Play completion celebration
  const playCompletionSound = useCallback(() => {
    const chord = [60, 64, 67, 72].map(midiToFrequency); // C major chord
    chord.forEach((freq, i) => {
      setTimeout(() => {
        audioEngine.playNote(freq);
        setTimeout(() => audioEngine.stopNote(freq), 500);
      }, i * 100);
    });
  }, []);

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string) => {
      // Skip if already complete
      if (stats.isComplete) return;
      
      // Handle auto-start: start on first keypress
      if (!isStarted) {
        if (autoStartRef.current) {
          setIsStarted(true);
          setStartTime(Date.now());
        } else {
          // Not started and not auto-start mode
          return;
        }
      }

      const expectedChar = text[currentIndex];
      const isCorrect = key === expectedChar;

      // Update typed chars
      setTypedChars((prev) => [...prev, { char: key, correct: isCorrect }]);

      // Play appropriate sound
      if (isCorrect) {
        playCorrectSound();
      } else {
        playErrorSound();
      }

      // Calculate new stats
      setStats((prev) => {
        const newCorrect = prev.correctChars + (isCorrect ? 1 : 0);
        const newIncorrect = prev.incorrectChars + (isCorrect ? 0 : 1);
        const newTotal = prev.totalChars + 1;
        const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
        const newMaxStreak = Math.max(prev.maxStreak, newStreak);

        // Calculate score
        const multiplier = getStreakMultiplier(newStreak);
        const charScore = isCorrect
          ? SCORE_CONFIG.correctChar * multiplier
          : -SCORE_CONFIG.incorrectPenalty;
        const newScore = Math.max(0, prev.score + charScore);

        // Calculate WPM (average word = 5 chars)
        const minutes = elapsedTime / 60;
        const wpm = minutes > 0 ? Math.round(newCorrect / 5 / minutes) : 0;

        // Calculate accuracy
        const accuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 100;

        const isComplete = currentIndex + 1 >= text.length;
        let finalScore = newScore;

        if (isComplete) {
          // Accuracy bonus
          if (accuracy >= 95) finalScore += SCORE_CONFIG.accuracyBonus[95];
          else if (accuracy >= 90) finalScore += SCORE_CONFIG.accuracyBonus[90];
          else if (accuracy >= 85) finalScore += SCORE_CONFIG.accuracyBonus[85];

          // WPM bonus
          if (wpm >= 80) finalScore += SCORE_CONFIG.wpmBonus[80];
          else if (wpm >= 60) finalScore += SCORE_CONFIG.wpmBonus[60];
          else if (wpm >= 40) finalScore += SCORE_CONFIG.wpmBonus[40];
        }

        return {
          correctChars: newCorrect,
          incorrectChars: newIncorrect,
          totalChars: newTotal,
          currentStreak: newStreak,
          maxStreak: newMaxStreak,
          wpm,
          accuracy,
          score: finalScore,
          elapsedTime,
          isComplete,
        };
      });

      // Move to next character
      setCurrentIndex((prev) => prev + 1);
    },
    [
      isStarted,
      stats.isComplete,
      text,
      currentIndex,
      playCorrectSound,
      playErrorSound,
      getStreakMultiplier,
      elapsedTime,
    ]
  );

  // Start the practice session
  const start = useCallback(async () => {
    await audioEngine.initialize();
    setIsStarted(true);
    setStartTime(Date.now());
  }, []);

  // Reset the practice session
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setTypedChars([]);
    setIsStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setStats({
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      currentStreak: 0,
      maxStreak: 0,
      wpm: 0,
      accuracy: 100,
      score: 0,
      elapsedTime: 0,
      isComplete: false,
    });
    scaleWalkerRef.current.reset();
    completionHandledRef.current = false;
  }, []);

  // Timer effect
  useEffect(() => {
    if (isStarted && startTime && !stats.isComplete) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, startTime, stats.isComplete]);

  // Handle completion side effects
  useEffect(() => {
    if (stats.isComplete && !completionHandledRef.current) {
      completionHandledRef.current = true;
      playCompletionSound();
      onComplete?.(stats);
    }
  }, [stats, onComplete, playCompletionSound]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if complete
      if (stats.isComplete) return;
      
      // Skip if not started and not auto-starting
      if (!isStarted && !autoStartRef.current) return;

      // Ignore modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Handle printable characters
      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, stats.isComplete, handleKeyPress]);

  return {
    currentIndex,
    typedChars,
    stats,
    isStarted,
    start,
    reset,
    handleKeyPress,
  };
}

export default useTypingPractice;
