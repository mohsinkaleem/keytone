import { memo } from 'react';

interface KeyProps {
  keyChar: string;
  noteName: string;
  isBlack: boolean;
  isActive: boolean;
}

export const Key = memo(function Key({
  keyChar,
  noteName,
  isBlack,
  isActive,
}: KeyProps) {
  const baseClasses = `
    relative flex flex-col items-center justify-end
    transition-all duration-75 ease-out
    font-medium select-none cursor-pointer
  `;

  const whiteKeyClasses = `
    w-12 h-40 rounded-b-lg
    ${isActive 
      ? 'bg-gradient-to-b from-indigo-400 to-indigo-500 shadow-lg shadow-indigo-500/50 scale-[0.98]' 
      : 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-50 hover:to-gray-200'
    }
    border border-gray-300
    text-gray-700
  `;

  const blackKeyClasses = `
    w-8 h-24 rounded-b-md z-10
    ${isActive 
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-600/50 scale-[0.98]' 
      : 'bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800'
    }
    border border-gray-700
    text-white
  `;

  return (
    <div className={`${baseClasses} ${isBlack ? blackKeyClasses : whiteKeyClasses}`}>
      <div className={`mb-2 text-xs ${isBlack ? 'text-gray-300' : 'text-gray-500'}`}>
        {noteName}
      </div>
      <div className={`
        mb-3 w-6 h-6 rounded flex items-center justify-center text-sm font-bold
        ${isBlack 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-gray-200 text-gray-600'
        }
        ${isActive ? 'ring-2 ring-indigo-400' : ''}
      `}>
        {keyChar.toUpperCase()}
      </div>
      
      {/* Glow effect when active */}
      {isActive && (
        <div className={`
          absolute inset-0 rounded-b-lg
          ${isBlack ? 'bg-indigo-500/20' : 'bg-indigo-400/30'}
          animate-pulse
        `} />
      )}
    </div>
  );
});

export default Key;
