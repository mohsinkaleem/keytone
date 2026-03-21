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

const SHIFT_CHARS: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
  '~': '`',
};

// Simplified: just left/right hand
type Hand = 'left' | 'right' | 'thumb';

const KEY_HAND: Record<string, Hand> = {};
['`','1','2','3','4','5','Q','W','E','R','T','A','S','D','F','G','Z','X','C','V','B','Tab','Caps','Shift-L'].forEach(k => { KEY_HAND[k] = 'left'; });
['6','7','8','9','0','-','=','Y','U','I','O','P','[',']','\\','H','J','K','L',';',"'",'N','M',',','.','/','Backspace','Enter','Shift-R'].forEach(k => { KEY_HAND[k] = 'right'; });
KEY_HAND['Space'] = 'thumb';

const HAND_RING: Record<Hand, string> = {
  left: 'ring-amber-400/50',
  right: 'ring-cyan-400/50',
  thumb: 'ring-slate-400/50',
};

function getHandForKey(keyId?: string | null): Hand | null {
  if (!keyId) return null;
  return KEY_HAND[keyId] ?? null;
}

export function VirtualKeyboard({
  currentChar,
  lastTypedChar,
  isCorrect = true,
  isActive = true,
  showFingerGuides = false,
}: VirtualKeyboardProps) {
  const getKeyForChar = useCallback((char: string | undefined): string | null => {
    if (!char) return null;
    if (char === ' ') return 'Space';
    const upperChar = char.toUpperCase();
    if (SHIFT_CHARS[char]) return SHIFT_CHARS[char];
    for (const row of KEYBOARD_ROWS) {
      if (row.includes(upperChar) || row.includes(char)) return upperChar;
    }
    return null;
  }, []);

  const needsShift = useCallback((char: string | undefined): boolean => {
    if (!char) return false;
    return /[A-Z]/.test(char) || Object.prototype.hasOwnProperty.call(SHIFT_CHARS, char);
  }, []);

  const pressedKeyId = getKeyForChar(lastTypedChar);
  const targetKeyId = getKeyForChar(currentChar);
  const shiftNeeded = needsShift(currentChar);

  const suggestionText = useMemo(() => {
    if (!showFingerGuides || !targetKeyId) return null;
    const hand = getHandForKey(targetKeyId);
    return {
      keyLabel: targetKeyId === 'Space' ? 'Space' : targetKeyId,
      handLabel: hand === 'left' ? 'Left hand' : hand === 'right' ? 'Right hand' : 'Thumb',
      shiftNeeded,
    };
  }, [showFingerGuides, targetKeyId, shiftNeeded]);

  const getKeyClass = (key: string, keyId: string) => {
    const baseClass = 'relative flex items-center justify-center rounded-md font-medium transition-all duration-100 select-none';
    const width = SPECIAL_KEY_WIDTHS[key] || 'w-7 sm:w-9';
    const height = 'h-7 sm:h-9';

    const isPressed = pressedKeyId === keyId;
    const isTarget = targetKeyId === keyId;
    const showShift = key === 'Shift' && shiftNeeded;
    const hand = getHandForKey(keyId);

    let stateClass = 'bg-gray-800/80 text-gray-300 border border-gray-700/50';

    if (isPressed) {
      stateClass = isCorrect
        ? 'bg-emerald-500/80 text-white border border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
        : 'bg-red-500/80 text-white border border-red-400 scale-95 shadow-lg shadow-red-500/30';
    } else if (showShift) {
      stateClass = 'bg-amber-600/60 text-white border border-amber-400/50';
    } else if (isTarget && isActive) {
      stateClass = 'bg-indigo-600/60 text-white border border-indigo-400/50 shadow-lg shadow-indigo-500/20 animate-pulse';
    }

    // Only ring the target key itself
    if (showFingerGuides && isTarget && !isPressed && hand) {
      stateClass += ` ring-2 ${HAND_RING[hand]}`;
    }

    return `${baseClass} ${width} ${height} ${stateClass}`;
  };

  const renderKey = (key: string, index: number, keyId: string = key) => {
    const displayLabel = key === 'Space' ? '' : key;
    const isPressed = pressedKeyId === keyId;

    return (
      <div key={`${key}-${index}`} className={getKeyClass(key, keyId)}>
        {isPressed && (
          <span className="absolute inset-0 rounded-md border border-white/60 animate-key-ripple pointer-events-none" />
        )}
        <span className="text-xs sm:text-sm z-10">{displayLabel}</span>
        {(key === 'F' || key === 'J') && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-white/40 rounded-full" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full px-2 py-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 relative">
      {showFingerGuides && suggestionText && (
        <div className="mb-2 px-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-indigo-400/25 bg-indigo-500/10 text-indigo-100 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800/80 border border-gray-600 text-[10px] font-semibold">
              {suggestionText.keyLabel}
            </kbd>
            <span className="text-indigo-200/80">{suggestionText.handLabel}</span>
            {suggestionText.shiftNeeded && (
              <>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-800/80 border border-gray-600 text-[10px] font-semibold">Shift</kbd>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          {KEYBOARD_ROWS[0].map((key, i) => renderKey(key, i))}
          {renderKey('Backspace', 100)}
        </div>
        <div className="flex gap-1">
          {renderKey('Tab', 101)}
          {KEYBOARD_ROWS[1].map((key, i) => renderKey(key, i))}
        </div>
        <div className="flex gap-1">
          {renderKey('Caps', 102)}
          {KEYBOARD_ROWS[2].map((key, i) => renderKey(key, i))}
          {renderKey('Enter', 103)}
        </div>
        <div className="flex gap-1">
          {renderKey('Shift', 104, 'Shift-L')}
          {KEYBOARD_ROWS[3].map((key, i) => renderKey(key, i))}
          {renderKey('Shift', 105, 'Shift-R')}
        </div>
        <div className="flex gap-1 justify-center">
          {renderKey('Space', 106)}
        </div>
      </div>
    </div>
  );
}

export default VirtualKeyboard;
