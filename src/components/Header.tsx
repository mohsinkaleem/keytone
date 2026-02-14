import { useAudio } from '../contexts/useAudio';

interface HeaderProps {
  onShowStats: () => void;
  onShowCustomText: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export function Header({
  onShowStats,
  onShowCustomText,
  showSettings,
  onToggleSettings,
}: HeaderProps) {
  const { isMuted, toggleMute } = useAudio();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Keytone
        </h1>
        <span className="text-gray-500 text-sm hidden sm:block">Type with music</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Mute button */}
        <button
          onClick={() => toggleMute(!isMuted)}
          className={`p-2 rounded-lg transition-colors ${
            isMuted ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
          }`}
          title={isMuted ? "Unmute" : "Mute (Alt+M)"}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Stats button */}
        <button
          onClick={onShowStats}
          className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Statistics"
          aria-label="View statistics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        {/* Add custom text button */}
        <button
          onClick={onShowCustomText}
          className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Add Custom Text"
          aria-label="Add custom text"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Settings toggle */}
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Settings"
          aria-label="Toggle settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
