import { useCallback, useMemo } from 'react';

interface VirtualKeyboardProps {
  currentChar?: string;
  lastTypedChar?: string;
  isCorrect?: boolean;
  isActive?: boolean;
  showFingerGuides?: boolean;
}

// Keyboard layout - QWERTY
const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

const SPECIAL_KEY_WIDTHS: Record<string, string> = {
  'Tab': 'w-10 sm:w-12',
  'Caps': 'w-12 sm:w-14',
  'Shift': 'w-16 sm:w-20',
  'Space': 'w-48 sm:w-64',
  'Enter': 'w-14 sm:w-16',
  'Backspace': 'w-14 sm:w-16',
};

// Map special characters to their shifted versions
const SHIFT_CHARS: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
  '~': '`',
};

type FingerId = 'L5' | 'L4' | 'L3' | 'L2' | 'R2' | 'R3' | 'R4' | 'R5' | 'TH';

interface FingerStyle {
  name: string;
  short: string;
  dotClass: string;
  chipClass: string;
  ringClass: string;
}

const FINGER_STYLES: Record<FingerId, FingerStyle> = {
  L5: {
    name: 'Left pinky',
    short: 'L5',
    dotClass: 'bg-fuchsia-400',
    chipClass: 'bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-100',
    ringClass: 'ring-fuchsia-400/60',
  },
  L4: {
    name: 'Left ring',
    short: 'L4',
    dotClass: 'bg-rose-400',
    chipClass: 'bg-rose-500/15 border-rose-400/30 text-rose-100',
    ringClass: 'ring-rose-400/60',
  },
  L3: {
    name: 'Left middle',
    short: 'L3',
    dotClass: 'bg-orange-400',
    chipClass: 'bg-orange-500/15 border-orange-400/30 text-orange-100',
    ringClass: 'ring-orange-400/60',
  },
  L2: {
    name: 'Left index',
    short: 'L2',
    dotClass: 'bg-amber-300',
    chipClass: 'bg-amber-500/15 border-amber-300/30 text-amber-100',
    ringClass: 'ring-amber-300/60',
  },
  R2: {
    name: 'Right index',
    short: 'R2',
    dotClass: 'bg-emerald-400',
    chipClass: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100',
    ringClass: 'ring-emerald-400/60',
  },
  R3: {
    name: 'Right middle',
    short: 'R3',
    dotClass: 'bg-cyan-400',
    chipClass: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-100',
    ringClass: 'ring-cyan-400/60',
  },
  R4: {
    name: 'Right ring',
    short: 'R4',
    dotClass: 'bg-sky-400',
    chipClass: 'bg-sky-500/15 border-sky-400/30 text-sky-100',
    ringClass: 'ring-sky-400/60',
  },
  R5: {
    name: 'Right pinky',
    short: 'R5',
    dotClass: 'bg-violet-400',
    chipClass: 'bg-violet-500/15 border-violet-400/30 text-violet-100',
    ringClass: 'ring-violet-400/60',
  },
  TH: {
    name: 'Thumb',
    short: 'TH',
    dotClass: 'bg-slate-300',
    chipClass: 'bg-slate-500/15 border-slate-300/30 text-slate-100',
    ringClass: 'ring-slate-300/60',
  },
};

const FINGER_LEGEND_ORDER: FingerId[] = ['L5', 'L4', 'L3', 'L2', 'R2', 'R3', 'R4', 'R5', 'TH'];

const FINGER_ASSIGNMENTS: Record<FingerId, string[]> = {
  L5: ['`', '1', 'Q', 'A', 'Z', 'Tab', 'Caps', 'Shift-L'],
  L4: ['2', 'W', 'S', 'X'],
  L3: ['3', 'E', 'D', 'C'],
  L2: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B'],
  R2: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'],
  R3: ['8', 'I', 'K', ','],
  R4: ['9', 'O', 'L', '.'],
  R5: ['0', '-', '=', 'P', '[', ']', '\\', ';', "'", '/', 'Backspace', 'Enter', 'Shift-R'],
  TH: ['Space'],
};

const KEY_TO_FINGER: Record<string, FingerId> = Object.entries(FINGER_ASSIGNMENTS).reduce(
  (acc, [finger, keys]) => {
    keys.forEach((key) => {
      acc[key] = finger as FingerId;
    });
    return acc;
  },
  {} as Record<string, FingerId>
);

function getFingerForKey(keyId?: string | null): FingerId | null {
  if (!keyId) return null;
  return KEY_TO_FINGER[keyId] ?? null;
}

function getShiftKeyForFinger(finger: FingerId | null): 'Shift-L' | 'Shift-R' | null {
  if (!finger) return null;
  if (finger.startsWith('L')) return 'Shift-R';
  if (finger.startsWith('R')) return 'Shift-L';
  return null;
}

export function VirtualKeyboard({
  currentChar,
  lastTypedChar,
  isCorrect = true,
  isActive = true,
  showFingerGuides = false,
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
    return /[A-Z]/.test(char) || Object.prototype.hasOwnProperty.call(SHIFT_CHARS, char);
  }, []);

  const pressedKeyId = getKeyForChar(lastTypedChar);
  const targetKeyId = getKeyForChar(currentChar);
  const targetFinger = getFingerForKey(targetKeyId);
  const suggestedShiftKey = needsShift(currentChar) ? getShiftKeyForFinger(targetFinger) : null;
  const shiftFinger = getFingerForKey(suggestedShiftKey);
  const targetFingerStyle = targetFinger ? FINGER_STYLES[targetFinger] : null;
  const shiftFingerStyle = shiftFinger ? FINGER_STYLES[shiftFinger] : null;

  const suggestionText = useMemo(() => {
    if (!showFingerGuides || !targetKeyId || !targetFingerStyle) return null;
    return {
      keyLabel: targetKeyId === 'Space' ? 'Space' : targetKeyId,
      fingerLabel: targetFingerStyle.name,
      fingerShort: targetFingerStyle.short,
      shiftFingerLabel: shiftFingerStyle?.name ?? null,
      shiftFingerShort: shiftFingerStyle?.short ?? null,
    };
  }, [showFingerGuides, targetKeyId, targetFingerStyle, shiftFingerStyle]);

  const getKeyClass = (key: string, keyId: string) => {
    const baseClass = 'relative flex items-center justify-center rounded-md font-medium transition-all duration-100 select-none overflow-hidden';
    const width = SPECIAL_KEY_WIDTHS[key] || 'w-7 sm:w-9';
    const height = 'h-7 sm:h-9';
    
    // Determine key state
    const isPressed = pressedKeyId === keyId;
    const showShift = showFingerGuides
      ? suggestedShiftKey === keyId
      : key === 'Shift' && needsShift(currentChar);
    const isTarget = targetKeyId === keyId;
    const finger = getFingerForKey(keyId);
    const isFingerSuggested = showFingerGuides && finger !== null && finger === targetFinger;
    
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

    if (isFingerSuggested && !isPressed && finger) {
      stateClass += ` ring-2 ${FINGER_STYLES[finger].ringClass}`;
    }
    
    return `${baseClass} ${width} ${height} ${stateClass}`;
  };

  const renderKey = (key: string, index: number, keyId: string = key) => {
    // Display label for special keys
    const displayLabel = key === 'Space' ? '' : key;
    const isPressed = pressedKeyId === keyId;
    const finger = getFingerForKey(keyId);
    const fingerStyle = finger ? FINGER_STYLES[finger] : null;
    const isFingerTarget = finger !== null && finger === targetFinger
      && (targetKeyId === keyId || suggestedShiftKey === keyId);
    
    return (
      <div
        key={`${key}-${index}`}
        className={getKeyClass(key, keyId)}
      >
        {isPressed && (
          <>
            <span className="absolute inset-0 rounded-md border border-white/60 animate-key-ripple pointer-events-none" />
            <span className="absolute inset-0 bg-white/10 rounded-md animate-key-ripple pointer-events-none" />
          </>
        )}
        {showFingerGuides && fingerStyle && key !== 'Space' && (
          <span
            className={`absolute top-1 right-1 size-1.5 sm:size-2 rounded-full ${fingerStyle.dotClass} ${
              isFingerTarget ? 'animate-finger-hint shadow-sm shadow-white/40' : 'opacity-75'
            }`}
          />
        )}
        <span className="text-xs sm:text-sm z-10">{displayLabel}</span>
        {(key === 'F' || key === 'J') && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-white/40 rounded-full" />
        )}
        
        {/* Subtle key shine effect */}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full px-2 py-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 relative">
      {showFingerGuides && suggestionText && (
        <div className="mb-2 space-y-1.5">
          <div className="inline-flex flex-wrap items-center gap-1.5 px-2 py-1 rounded-md border border-indigo-400/25 bg-indigo-500/10 text-indigo-100 text-[11px]">
            <span className="text-indigo-200/80 uppercase tracking-wide text-[10px]">Suggestion</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800/80 border border-gray-600 text-[10px] font-semibold">
              {suggestionText.keyLabel}
            </kbd>
            <span>with</span>
            <span className={`px-1.5 py-0.5 rounded border ${targetFingerStyle?.chipClass}`}>
              {suggestionText.fingerShort}
            </span>
            {suggestedShiftKey && suggestionText.shiftFingerShort && (
              <>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-800/80 border border-gray-600 text-[10px] font-semibold">
                  Shift
                </kbd>
                <span className={`px-1.5 py-0.5 rounded border ${shiftFingerStyle?.chipClass}`}>
                  {suggestionText.shiftFingerShort}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {FINGER_LEGEND_ORDER.map((fingerId) => {
              const fingerInfo = FINGER_STYLES[fingerId];
              const isActiveFinger = fingerId === targetFinger || fingerId === shiftFinger;

              return (
                <span
                  key={fingerId}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] ${
                    fingerInfo.chipClass
                  } ${isActiveFinger ? 'ring-1 ring-white/50' : ''}`}
                >
                  <span className={`size-1.5 rounded-full ${fingerInfo.dotClass}`} />
                  {fingerInfo.short}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
          {renderKey('Shift', 104, 'Shift-L')}
          {KEYBOARD_ROWS[3].map((key, i) => renderKey(key, i))}
          {renderKey('Shift', 105, 'Shift-R')}
        </div>
        
        {/* Space bar row */}
        <div className="flex gap-1 items-center">
          <div className="w-16 sm:w-20" /> {/* Spacer */}
          {renderKey('Space', 106)}
          <div className="w-16 sm:w-20" /> {/* Spacer */}
        </div>
      </div>
      
      {/* Subtle glow under keyboard */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-indigo-500/5 to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
}

export default VirtualKeyboard;
