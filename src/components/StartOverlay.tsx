interface StartOverlayProps {
  onStart: () => void;
}

export function StartOverlay({ onStart }: StartOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md">
      <div className="text-center max-w-md px-6">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Keytone
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          Type with music
        </p>
        <p className="text-gray-500 mb-8">
          Practice typing while enjoying melodic sounds. Each keystroke plays harmonious notes.
        </p>
        
        <button
          onClick={onStart}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-3">
            <svg 
              className="w-6 h-6 transition-transform group-hover:scale-110" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Typing
          </span>
          
          {/* Animated ring */}
          <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500 opacity-20" />
        </button>
      </div>
    </div>
  );
}

export default StartOverlay;
