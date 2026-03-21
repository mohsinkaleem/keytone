import { SOUND_THEMES, TYPEWRITER_VARIANTS } from '../audio';
import { useAudio } from '../contexts/useAudio';
import type { UserSettings } from '../utils/storage';
import type { ProgressionName } from '../utils/noteUtils';
import { audioEngine } from '../audio';
import { midiToFrequency } from '../utils/noteUtils';

interface SettingsPanelProps {
  enableBackspace: boolean;
  onEnableBackspaceChange: (enabled: boolean) => void;
  showVisualizer: boolean;
  onShowVisualizerChange: (show: boolean) => void;
  showKeyboard: boolean;
  onShowKeyboardChange: (show: boolean) => void;
  keyboardClickSound: boolean;
  onKeyboardClickSoundChange: (enabled: boolean) => void;
  timedMode: number | null;
  onTimedModeChange: (mode: number | null) => void;
  chordProgression: ProgressionName;
  onChordProgressionChange: (progression: ProgressionName) => void;
  cursorStyle: 'line' | 'underline';
  onCursorStyleChange: (style: 'line' | 'underline') => void;
  onSettingsChange: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  onReset: () => void;
}

const TIMED_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Untimed' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
];

const CHORD_PROGRESSIONS: { value: ProgressionName; label: string; icon: string }[] = [
  { value: 'pop', label: 'Pop', icon: '🎵' },
  { value: 'classic', label: 'Classic', icon: '🎼' },
  { value: 'jazz', label: 'Jazz', icon: '🎷' },
  { value: 'blues', label: 'Blues', icon: '🎸' },
  { value: 'ambient', label: 'Ambient', icon: '🌙' },
];

export function SettingsPanel({
  enableBackspace,
  onEnableBackspaceChange,
  showVisualizer,
  onShowVisualizerChange,
  showKeyboard,
  onShowKeyboardChange,
  keyboardClickSound,
  onKeyboardClickSoundChange,
  timedMode,
  onTimedModeChange,
  chordProgression,
  onChordProgressionChange,
  cursorStyle,
  onCursorStyleChange,
  onSettingsChange,
  onReset,
}: SettingsPanelProps) {
  const {
    soundTheme,
    setSoundTheme,
    typewriterVariant,
    setTypewriterVariant,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = useAudio();

  const previewTypewriter = () => {
    [false, false, true].forEach((isSpace, i) => {
      setTimeout(() => {
        audioEngine.playTypewriterKeySound({ isSpace, velocity: 0.85 });
      }, i * 65);
    });
  };

  // Play a preview note when changing sound theme
  const handleSoundThemeChange = async (theme: typeof soundTheme) => {
    setSoundTheme(theme);
    onSettingsChange('soundTheme', theme);
    
    // Initialize audio if not already done
    await audioEngine.initialize();

    if (theme === 'typewriter') {
      previewTypewriter();
      return;
    }
    
    // Play a preview C major chord (C-E-G)
    const previewNotes = [60, 64, 67].map(midiToFrequency); // C4, E4, G4
    
    previewNotes.forEach((freq, i) => {
      setTimeout(() => {
        audioEngine.playNoteWithVelocity(freq, 0.7);
        setTimeout(() => audioEngine.stopNote(freq), 300);
      }, i * 50);
    });
  };

  const handleTypewriterVariantChange = async (variant: typeof typewriterVariant) => {
    setTypewriterVariant(variant);
    onSettingsChange('typewriterVariant', variant);
    await audioEngine.initialize();
    previewTypewriter();
  };

  return (
    <div className="px-6 py-3 bg-gray-900 border-b border-gray-800 space-y-4 shadow-sm">
      <div className="flex flex-wrap gap-x-8 gap-y-4 items-start">
        {/* Sound Theme */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Sound Theme</span>
          <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
            {SOUND_THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleSoundThemeChange(theme.value)}
                title={theme.label}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded-md text-sm transition-all ${
                  soundTheme === theme.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{theme.icon}</span>
                <span className="hidden xl:inline font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {soundTheme === 'typewriter' && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Typewriter Tone</span>
            <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
              {TYPEWRITER_VARIANTS.map((variant) => (
                <button
                  key={variant.value}
                  onClick={() => handleTypewriterVariantChange(variant.value)}
                  title={variant.label}
                  className={`px-3 py-1.5 flex items-center gap-1.5 rounded-md text-sm transition-all ${
                    typewriterVariant === variant.value
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{variant.icon}</span>
                  <span className="hidden xl:inline font-medium">{variant.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Volume & Mute */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Volume</span>
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-1.5 px-3 w-fit">
            <button
              onClick={() => toggleMute(!isMuted)}
              className={`p-1.5 rounded-md transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isMuted ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const nextVolume = parseFloat(e.target.value);
                setVolume(nextVolume);
                onSettingsChange('volume', nextVolume);
              }}
              disabled={isMuted}
              aria-label="Volume control"
              className={`w-28 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                isMuted ? 'opacity-30 cursor-not-allowed' : 'bg-gray-700'
              }`}
            />
          </div>
        </div>

        {/* Timed Mode */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Timer</span>
          <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
            {TIMED_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  onTimedModeChange(opt.value);
                  onReset();
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timedMode === opt.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chord Progression */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Harmony</span>
          <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
            {CHORD_PROGRESSIONS.map((prog) => (
              <button
                key={prog.value}
                onClick={() => {
                  onChordProgressionChange(prog.value);
                  onSettingsChange('chordProgression', prog.value);
                }}
                title={prog.label}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded-md text-sm transition-all ${
                  chordProgression === prog.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{prog.icon}</span>
                <span className="hidden xl:inline font-medium">{prog.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cursor Style */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Cursor</span>
          <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
            {([{ value: 'line' as const, label: 'Line │' }, { value: 'underline' as const, label: 'Under ▁' }]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onCursorStyleChange(opt.value);
                  onSettingsChange('cursorStyle', opt.value);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  cursorStyle === opt.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8 pt-2 border-t border-gray-800/50">
        <div className="flex items-center gap-6">
          {/* Backspace Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={enableBackspace}
                onChange={(e) => {
                  onEnableBackspaceChange(e.target.checked);
                  onSettingsChange('enableBackspace', e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-tight">Backspace</span>
          </label>

          {/* Visualizer Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showVisualizer}
                onChange={(e) => {
                  onShowVisualizerChange(e.target.checked);
                  onSettingsChange('showVisualizer', e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-tight">Visualizer</span>
          </label>

          {/* Keyboard Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showKeyboard}
                onChange={(e) => {
                  onShowKeyboardChange(e.target.checked);
                  onSettingsChange('showKeyboard', e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-tight">Keyboard</span>
          </label>

          {/* Key Click Sound Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={keyboardClickSound}
                onChange={(e) => {
                  onKeyboardClickSoundChange(e.target.checked);
                  onSettingsChange('keyboardClickSound', e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-tight">Key Click</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
