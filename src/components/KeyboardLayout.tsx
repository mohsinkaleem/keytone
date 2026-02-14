import { memo, useMemo } from 'react';
import { Key } from './Key';
import { getPianoKeysInfo, type KeyInfo } from '../utils/noteUtils';

interface KeyboardLayoutProps {
  activeKeys: Set<string>;
}

export const KeyboardLayout = memo(function KeyboardLayout({
  activeKeys,
}: KeyboardLayoutProps) {
  const keysInfo = useMemo(() => getPianoKeysInfo(), []);

  // Separate white and black keys for proper rendering
  const whiteKeys = keysInfo.filter((k) => !k.isBlack);
  const blackKeys = keysInfo.filter((k) => k.isBlack);

  // Position mapping for black keys relative to white keys
  const blackKeyPositions: Record<string, number> = {
    'w': 0,  // Between C and D
    'e': 1,  // Between D and E
    't': 3,  // Between F and G
    'y': 4,  // Between G and A
    'u': 5,  // Between A and B
    'o': 7,  // Between C5 and D5
    'p': 8,  // Between D5 and E5
  };

  return (
    <div className="relative flex justify-center p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl">
      {/* White keys layer */}
      <div className="flex gap-1">
        {whiteKeys.map((keyInfo: KeyInfo) => (
          <Key
            key={keyInfo.key}
            keyChar={keyInfo.key}
            noteName={keyInfo.noteName}
            isBlack={false}
            isActive={activeKeys.has(keyInfo.key)}
          />
        ))}
      </div>

      {/* Black keys layer - positioned absolutely */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <div className="relative" style={{ width: `${whiteKeys.length * 52}px` }}>
          {blackKeys.map((keyInfo: KeyInfo) => {
            const position = blackKeyPositions[keyInfo.key];
            const leftOffset = position * 52 + 36; // 52px per white key, offset to center on gap
            
            return (
              <div
                key={keyInfo.key}
                className="absolute"
                style={{ left: `${leftOffset}px` }}
              >
                <Key
                  keyChar={keyInfo.key}
                  noteName={keyInfo.noteName}
                  isBlack={true}
                  isActive={activeKeys.has(keyInfo.key)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default KeyboardLayout;
