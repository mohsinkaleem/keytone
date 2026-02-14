import { memo, useEffect, useState } from 'react';
import type { AchievementDefinition } from '../utils/achievements';

interface AchievementPopupProps {
  achievement: AchievementDefinition | null;
  onClose: () => void;
}

export const AchievementPopup = memo(function AchievementPopup({
  achievement,
  onClose,
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce">{achievement.icon}</div>
          <div>
            <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
              Achievement Unlocked!
            </div>
            <div className="text-lg font-bold text-white">{achievement.title}</div>
            <div className="text-sm text-gray-300">{achievement.description}</div>
          </div>
        </div>
        
        {/* Sparkle effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-100" />
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-200" />
        </div>
      </div>
    </div>
  );
});

export default AchievementPopup;
