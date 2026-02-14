import { memo, useEffect, useRef } from 'react';

interface TextDisplayProps {
  text: string;
  currentIndex: number;
  typedChars: Array<{ char: string; correct: boolean }>;
}

export const TextDisplay = memo(function TextDisplay({
  text,
  currentIndex,
  typedChars,
}: TextDisplayProps) {
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to keep current character in view
  useEffect(() => {
    currentCharRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [currentIndex]);

  return (
    <div className="relative p-6 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      {/* Text container */}
      <div className="font-mono text-2xl leading-relaxed tracking-wide select-none">
        {text.split('').map((char, index) => {
          const isTyped = index < typedChars.length;
          const isCurrent = index === currentIndex;
          const typedInfo = typedChars[index];

          let className = 'relative transition-colors duration-100 ';

          if (isTyped) {
            if (typedInfo?.correct) {
              className += 'text-green-400 ';
            } else {
              className += 'text-red-400 bg-red-900/30 ';
            }
          } else if (isCurrent) {
            className += 'text-white ';
          } else {
            className += 'text-gray-500 ';
          }

          // Handle space character display
          const displayChar = char === ' ' ? '\u00A0' : char;

          return (
            <span
              key={index}
              ref={isCurrent ? currentCharRef : null}
              className={className}
            >
              {displayChar}
              
              {/* Cursor indicator */}
              {isCurrent && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 animate-pulse" />
              )}
              
              {/* Incorrect character overlay */}
              {isTyped && !typedInfo?.correct && (
                <span className="absolute inset-0 flex items-center justify-center text-red-300 opacity-50 text-lg">
                  {typedInfo?.char === ' ' ? '␣' : typedInfo?.char}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150"
          style={{ width: `${(currentIndex / text.length) * 100}%` }}
        />
      </div>
    </div>
  );
});

export default TextDisplay;
