import { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../audio';
import { midiToFrequency, MelodicGenerator, type ProgressionName } from '../utils/noteUtils';

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
  characterErrors: Record<string, number>; // Track errors per character
}

interface UseTypingPracticeOptions {
  text: string;
  autoStart?: boolean;
  enableBackspace?: boolean;
  timedMode?: number | null;
  chordProgression?: ProgressionName;
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
  handleBackspace: () => void;
  forceComplete: () => void;
}

// Score configuration
const SCORE_CONFIG = {
  correctChar: 10,
  incorrectPenalty: 5,
  streakBonus: {
    10: 2,
    25: 3,
    50: 5,
    100: 10,
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

const INITIAL_STATS: TypingStats = {
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
  characterErrors: {},
};

export function useTypingPractice({
  text,
  autoStart = false,
  enableBackspace = true,
  chordProgression = 'pop',
  onComplete,
}: UseTypingPracticeOptions): UseTypingPracticeReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<Array<{ char: string; correct: boolean }>>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState<TypingStats>({ ...INITIAL_STATS });

  const melodicGeneratorRef = useRef(new MelodicGenerator(chordProgression));
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const completionHandledRef = useRef(false);
  const autoStartRef = useRef(autoStart);
  const handleKeyPressRef = useRef<(key: string) => void>(() => {});
  const handleBackspaceRef = useRef<() => void>(() => {});
  // Use a ref for startTime to avoid stale closures in WPM calculation
  const startTimeRef = useRef<number | null>(null);

  // Keep autoStartRef in sync
  useEffect(() => {
    autoStartRef.current = autoStart;
  }, [autoStart]);

  // Update chord progression when it changes
  useEffect(() => {
    melodicGeneratorRef.current.setProgression(chordProgression);
  }, [chordProgression]);

  // Calculate score multiplier based on streak
  const getStreakMultiplier = (streak: number): number => {
    if (streak >= 100) return SCORE_CONFIG.streakBonus[100];
    if (streak >= 50) return SCORE_CONFIG.streakBonus[50];
    if (streak >= 25) return SCORE_CONFIG.streakBonus[25];
    if (streak >= 10) return SCORE_CONFIG.streakBonus[10];
    return 1;
  };

  // Play sound for correct key with character-aware note selection
  const playCorrectSound = (char: string) => {
    const { note, velocity, isSpace } = melodicGeneratorRef.current.getNextNote(char);

    if (isSpace) {
      audioEngine.playSpacebarSound(velocity);
    } else {
      const frequency = midiToFrequency(note);
      audioEngine.playNoteWithVelocity(frequency, velocity);
      setTimeout(() => audioEngine.stopNote(frequency), 150);
    }
  };

  // Play sound for incorrect key
  const playErrorSound = () => {
    ERROR_FREQUENCIES.forEach((freq) => {
      audioEngine.playNote(freq);
      setTimeout(() => audioEngine.stopNote(freq), 100);
    });
  };

  // Play completion celebration
  const playCompletionSound = () => {
    const chord = [60, 64, 67, 72].map(midiToFrequency);
    chord.forEach((freq, i) => {
      setTimeout(() => {
        audioEngine.playNote(freq);
        setTimeout(() => audioEngine.stopNote(freq), 500);
      }, i * 100);
    });
  };

  // Calculate WPM using the ref-based startTime (avoids stale closure)
  const calculateWpm = (correctChars: number): number => {
    const start = startTimeRef.current;
    if (!start) return 0;
    const elapsed = (Date.now() - start) / 1000;
    const minutes = elapsed / 60;
    return minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  };

  // Handle key press
  const handleKeyPress = (key: string) => {
    // Skip if already complete
    if (stats.isComplete) return;

    // Handle auto-start: start on first keypress
    if (!isStarted) {
      if (autoStartRef.current) {
        setIsStarted(true);
        startTimeRef.current = Date.now();
      } else {
        return;
      }
    }

    const expectedChar = text[currentIndex];
    const isCorrect = key === expectedChar;

    // Update typed chars
    setTypedChars((prev) => [...prev, { char: key, correct: isCorrect }]);

    // Play appropriate sound
    if (isCorrect) {
      playCorrectSound(key);
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

      // Track character errors
      const newCharErrors = { ...prev.characterErrors };
      if (!isCorrect) {
        const errorKey = expectedChar;
        newCharErrors[errorKey] = (newCharErrors[errorKey] || 0) + 1;
      }

      // Calculate score
      const multiplier = getStreakMultiplier(newStreak);
      const charScore = isCorrect
        ? SCORE_CONFIG.correctChar * multiplier
        : -SCORE_CONFIG.incorrectPenalty;
      const newScore = Math.max(0, prev.score + charScore);

      // Calculate WPM from startTime ref — no stale closure issue
      const wpm = calculateWpm(newCorrect);

      // Calculate accuracy
      const accuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 100;

      // Calculate current elapsed time from ref
      const currentElapsed = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0;

      const isComplete = currentIndex + 1 >= text.length;
      let finalScore = newScore;

      if (isComplete) {
        if (accuracy >= 95) finalScore += SCORE_CONFIG.accuracyBonus[95];
        else if (accuracy >= 90) finalScore += SCORE_CONFIG.accuracyBonus[90];
        else if (accuracy >= 85) finalScore += SCORE_CONFIG.accuracyBonus[85];

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
        elapsedTime: currentElapsed,
        isComplete,
        characterErrors: newCharErrors,
      };
    });

    // Move to next character
    setCurrentIndex((prev) => prev + 1);
  };

  // Start the practice session
  const start = useCallback(async () => {
    await audioEngine.initialize();
    setIsStarted(true);
    startTimeRef.current = Date.now();
  }, []);

  // Reset the practice session
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setTypedChars([]);
    setIsStarted(false);
    startTimeRef.current = null;
    setElapsedTime(0);
    setStats({ ...INITIAL_STATS });
    melodicGeneratorRef.current.reset();
    completionHandledRef.current = false;
  }, []);

  // Handle backspace (delete previous character)
  const handleBackspace = () => {
    if (!enableBackspace || currentIndex === 0 || stats.isComplete) return;

    setTypedChars((prev) => {
      const lastChar = prev[prev.length - 1];
      const newTyped = prev.slice(0, -1);

      setStats((prevStats) => {
        const wasCorrect = lastChar?.correct;
        const newCorrect = prevStats.correctChars - (wasCorrect ? 1 : 0);
        const newIncorrect = prevStats.incorrectChars - (wasCorrect ? 0 : 1);
        const newTotal = prevStats.totalChars - 1;
        const accuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 100;

        return {
          ...prevStats,
          correctChars: Math.max(0, newCorrect),
          incorrectChars: Math.max(0, newIncorrect),
          totalChars: Math.max(0, newTotal),
          currentStreak: 0,
          accuracy,
        };
      });

      return newTyped;
    });

    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  // Force complete (for timed mode)
  const forceComplete = useCallback(() => {
    if (stats.isComplete) return;

    setStats((prev) => {
      let finalScore = prev.score;

      if (prev.accuracy >= 95) finalScore += SCORE_CONFIG.accuracyBonus[95];
      else if (prev.accuracy >= 90) finalScore += SCORE_CONFIG.accuracyBonus[90];
      else if (prev.accuracy >= 85) finalScore += SCORE_CONFIG.accuracyBonus[85];

      if (prev.wpm >= 80) finalScore += SCORE_CONFIG.wpmBonus[80];
      else if (prev.wpm >= 60) finalScore += SCORE_CONFIG.wpmBonus[60];
      else if (prev.wpm >= 40) finalScore += SCORE_CONFIG.wpmBonus[40];

      return {
        ...prev,
        score: finalScore,
        isComplete: true,
      };
    });
  }, [stats.isComplete]);

  // Timer effect — updates both elapsedTime and stats.elapsedTime
  useEffect(() => {
    if (isStarted && startTimeRef.current && !stats.isComplete) {
      timerRef.current = setInterval(() => {
        const start = startTimeRef.current;
        if (start) {
          const elapsed = (Date.now() - start) / 1000;
          setElapsedTime(elapsed);
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, stats.isComplete]);

  // Handle completion side effects
  useEffect(() => {
    if (stats.isComplete && !completionHandledRef.current) {
      completionHandledRef.current = true;
      playCompletionSound();
      onComplete?.(stats);
    }
  }, [stats, onComplete]);

  // Keep handler refs updated
  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress;
    handleBackspaceRef.current = handleBackspace;
  });

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stats.isComplete) return;
      if (!isStarted && !autoStartRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Backspace' && enableBackspace) {
        e.preventDefault();
        handleBackspaceRef.current();
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyPressRef.current(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, stats.isComplete, enableBackspace]);

  // Merge elapsedTime from timer into stats for continuous display updates
  const displayStats: TypingStats = {
    ...stats,
    elapsedTime: stats.isComplete ? stats.elapsedTime : elapsedTime,
  };

  return {
    currentIndex,
    typedChars,
    stats: displayStats,
    isStarted,
    start,
    reset,
    handleKeyPress,
    handleBackspace,
    forceComplete,
  };
}

export default useTypingPractice;
