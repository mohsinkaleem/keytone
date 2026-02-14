import { useEffect, useState } from 'react';

interface TimedModeOverlayProps {
  duration: number; // seconds
  isActive: boolean;
  onTimeUp: () => void;
  onReset: () => void;
}

export function TimedModeOverlay({
  duration,
  isActive,
  onTimeUp,
  onReset,
}: TimedModeOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExpired, setIsExpired] = useState(false);

  // Reset when duration changes or mode resets
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting timer state when duration or reset prop changes; necessary for external-driven state sync
    setTimeLeft(duration);
    setIsExpired(false);
  }, [duration, onReset]);

  useEffect(() => {
    if (!isActive || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isExpired, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
      <div
        className={`px-6 py-3 rounded-full backdrop-blur-lg border transition-all ${
          isCritical
            ? 'bg-red-500/20 border-red-500/50 animate-pulse'
            : isLow
            ? 'bg-yellow-500/20 border-yellow-500/50'
            : 'bg-gray-900/80 border-gray-700'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Timer icon */}
          <svg
            className={`w-5 h-5 ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-indigo-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {/* Time display */}
          <div
            className={`text-2xl font-mono font-bold ${
              isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isCritical
                  ? 'bg-red-500'
                  : isLow
                  ? 'bg-yellow-500'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Time's up overlay */}
      {isExpired && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="text-center space-y-4">
            <div className="text-6xl">⏰</div>
            <h2 className="text-4xl font-bold text-white">Time's Up!</h2>
            <p className="text-gray-400">See your results below</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimedModeOverlay;
