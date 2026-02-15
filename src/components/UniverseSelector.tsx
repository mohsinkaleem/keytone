/**
 * Universe Selector - Shows available universes and allows switching
 */

import { useUniverse } from '../contexts/useUniverse';

interface UniverseSelectorProps {
  onCreateNew: () => void;
}

export function UniverseSelector({ onCreateNew }: UniverseSelectorProps) {
  const { activeUniverse, allUniverses, switchUniverse, removeUniverse, currentExcerpts } = useUniverse();

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-800 bg-gray-900/50 overflow-x-auto no-scrollbar">
      <span className="text-xs text-gray-500 mr-2 shrink-0">Universe:</span>
      
      <div className="flex bg-gray-800/40 p-1 rounded-xl">
        {allUniverses.map((universe) => (
          <div key={universe.id} className="relative group">
            <button
              onClick={() => switchUniverse(universe.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeUniverse.id === universe.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title={universe.description}
            >
              <span className="text-sm">{universe.icon}</span>
              <span>{universe.name}</span>
              {activeUniverse.id === universe.id && (
                <span className="text-[10px] opacity-70">
                  ({currentExcerpts.length})
                </span>
              )}
            </button>
            
            {/* Delete button for custom universes */}
            {!universe.isBuiltIn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${universe.name}" universe?`)) {
                    removeUniverse(universe.id);
                  }
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                title="Delete universe"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create new universe button */}
      <button
        onClick={onCreateNew}
        className="px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all flex items-center gap-1"
        title="Create new universe"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">New</span>
      </button>
    </div>
  );
}

export default UniverseSelector;
