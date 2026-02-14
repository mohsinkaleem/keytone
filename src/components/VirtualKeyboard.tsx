import { useCallback } from 'react';

interface VirtualKeyboardProps {
  currentChar?: string;
  lastTypedChar?: string;
  isCorrect?: boolean;
  isActive?: boolean;
}

// Keyboard layout - QWERTY
const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

const SPECIAL_KEY_WIDTHS: Record<string, string> = {
  'Tab': 'w-12',
  'Caps': 'w-14',
  'Shift': 'w-20',
  'Space': 'w-60',
  'Enter': 'w-16',
  'Backspace': 'w-16',
};

// Map special characters to their shifted versions
const SHIFT_CHARS: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
  '~': '`',
};

export function VirtualKeyboard({
  currentChar,
  lastTypedChar,
  isCorrect = true,
  isActive = true,
}: VirtualKeyboardProps) {
  // Find which key to highlight for a given character
  const getKeyForChar = useCallback((char: string | undefined): string | null => {
    if (!char) return null;
    
    // Handle space
    if (char === ' ') return 'Space';
    
    // Handle uppercase - the key is the uppercase letter
    const upperChar = char.toUpperCase();
    
    // Check if it's a shifted character
    if (SHIFT_CHARS[char]) {
      return SHIFT_CHARS[char];
    }
    
    // Check all rows for the character
    for (const row of KEYBOARD_ROWS) {
      if (row.includes(upperChar) || row.includes(char)) {
        return upperChar;
      }
    }
    
    return null;
  }, []);
  
  // Check if shift is needed for the character
  const needsShift = useCallback((char: string | undefined): boolean => {
    if (!char) return false;
    return /[A-Z]/.test(char) || Object.keys(SHIFT_CHARS).includes(char);
  }, []);

  // Get the key that was just pressed (from lastTypedChar)
  const pressedKey = getKeyForChar(lastTypedChar);

  const getKeyClass = (key: string) => {
    const baseClass = 'relative flex items-center justify-center rounded-lg font-medium transition-all duration-100 select-none overflow-hidden';
    const width = SPECIAL_KEY_WIDTHS[key] || 'w-8 sm:w-10';
    const height = 'h-8 sm:h-10';
    
    // Determine key state
    const isPressed = pressedKey === key;
    const showShift = key === 'Shift' && needsShift(currentChar);
    const isTarget = getKeyForChar(currentChar) === key;
    
    let stateClass = 'bg-gray-800/80 text-gray-300 border border-gray-700/50';
    
    if (isPressed) {
      if (isCorrect) {
        stateClass = 'bg-emerald-500/80 text-white border border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30';
      } else {
        stateClass = 'bg-red-500/80 text-white border border-red-400 scale-95 shadow-lg shadow-red-500/30';
      }
    } else if (showShift) {
      stateClass = 'bg-amber-600/60 text-white border border-amber-400/50 shadow-md';
    } else if (isTarget && isActive) {
      stateClass = 'bg-indigo-600/60 text-white border border-indigo-400/50 shadow-lg shadow-indigo-500/20 animate-pulse';
    }
    
    return `${baseClass} ${width} ${height} ${stateClass}`;
  };

  const renderKey = (key: string, index: number) => {
    // Display label for special keys
    const displayLabel = key === 'Space' ? '' : key;
    
    return (
      <div
        key={`${key}-${index}`}
        className={getKeyClass(key)}
      >
        <span className="text-xs sm:text-sm z-10">{displayLabel}</span>
        
        {/* Subtle key shine effect */}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full px-2 py-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 relative">
      <div className="flex flex-col items-center gap-1">
        {/* Number row */}
        <div className="flex gap-1">
          {KEYBOARD_ROWS[0].map((key, i) => renderKey(key, i))}
          {renderKey('Backspace', 100)}
        </div>
        
        {/* Top letter row */}
        <div className="flex gap-1">
          {renderKey('Tab', 101)}
          {KEYBOARD_ROWS[1].map((key, i) => renderKey(key, i))}
        </div>
        
        {/* Middle letter row */}
        <div className="flex gap-1">
          {renderKey('Caps', 102)}
          {KEYBOARD_ROWS[2].map((key, i) => renderKey(key, i))}
          {renderKey('Enter', 103)}
        </div>
        
        {/* Bottom letter row */}
        <div className="flex gap-1">
          {renderKey('Shift', 104)}
          {KEYBOARD_ROWS[3].map((key, i) => renderKey(key, i))}
          {renderKey('Shift', 105)}
        </div>
        
        {/* Space bar row */}
        <div className="flex gap-1 items-center">
          <div className="w-20 sm:w-24" /> {/* Spacer */}
          {renderKey('Space', 106)}
          <div className="w-20 sm:w-24" /> {/* Spacer */}
        </div>
      </div>
      
      {/* Subtle glow under keyboard */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-indigo-500/5 to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
}

export default VirtualKeyboard;
