import { memo, useEffect, useState, useCallback } from 'react';

interface ComboAnimationProps {
  streak: number;
  show: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const ComboAnimation = memo(function ComboAnimation({
  streak,
  show,
}: ComboAnimationProps) {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [lastStreak, setLastStreak] = useState(0);

  const getStreakText = useCallback((s: number): string | null => {
    if (s === 10) return '10 Combo! 🔥';
    if (s === 25) return '25 Combo! 🔥🔥';
    if (s === 50) return 'UNSTOPPABLE! 💫';
    if (s === 100) return 'LEGENDARY! 🌟';
    if (s === 150) return 'GODLIKE! 👑';
    if (s === 200) return 'TRANSCENDENT! ✨';
    if (s > 0 && s % 50 === 0) return `${s} Combo! 🎯`;
    return null;
  }, []);

  useEffect(() => {
    if (!show || streak <= lastStreak) {
      setLastStreak(streak);
      return;
    }

    // Check for milestone
    for (let i = lastStreak + 1; i <= streak; i++) {
      const text = getStreakText(i);
      if (text) {
        const id = Date.now() + i;
        setFloatingTexts((prev) => [
          ...prev,
          {
            id,
            text,
            x: 40 + Math.random() * 20,
            y: 30 + Math.random() * 20,
          },
        ]);

        // Remove after animation
        setTimeout(() => {
          setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
        }, 1500);
      }
    }

    setLastStreak(streak);
  }, [streak, show, lastStreak, getStreakText]);

  // Reset when hidden
  useEffect(() => {
    if (!show) {
      setLastStreak(0);
      setFloatingTexts([]);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="absolute text-2xl font-bold animate-combo-float"
          style={{
            left: `${ft.x}%`,
            top: `${ft.y}%`,
            transform: 'translate(-50%, -50%)',
            textShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
          }}
        >
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {ft.text}
          </span>
        </div>
      ))}
    </div>
  );
});

export default ComboAnimation;
