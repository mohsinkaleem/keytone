import { memo } from 'react';
import type { WaveformType } from '../audio';
import type { PlayMode } from '../hooks';
import type { ScaleName } from '../utils';

interface ControlPanelProps {
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  waveform: WaveformType;
  onWaveformChange: (waveform: WaveformType) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  scaleName: ScaleName;
  onScaleChange: (scale: ScaleName) => void;
}

const WAVEFORMS: { value: WaveformType; label: string; icon: string }[] = [
  { value: 'sine', label: 'Sine', icon: '∿' },
  { value: 'triangle', label: 'Triangle', icon: '△' },
  { value: 'square', label: 'Square', icon: '▢' },
  { value: 'sawtooth', label: 'Saw', icon: '⩘' },
];

const SCALES: ScaleName[] = [
  'C Major Pentatonic',
  'C Major',
  'A Minor Pentatonic',
  'C Minor',
];

export const ControlPanel = memo(function ControlPanel({
  mode,
  onModeChange,
  waveform,
  onWaveformChange,
  volume,
  onVolumeChange,
  scaleName,
  onScaleChange,
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
      {/* Mode Toggle */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-gray-300">Mode</label>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onModeChange('instrument')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'instrument'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎹 Piano
          </button>
          <button
            onClick={() => onModeChange('harmonious')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'harmonious'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Writer
          </button>
        </div>
      </div>

      {/* Waveform Selector */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-gray-300">Waveform</label>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {WAVEFORMS.map((w) => (
            <button
              key={w.value}
              onClick={() => onWaveformChange(w.value)}
              title={w.label}
              className={`w-10 h-10 flex items-center justify-center rounded-md text-lg transition-all ${
                waveform === w.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {w.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Scale Selector (only visible in harmonious mode) */}
      {mode === 'harmonious' && (
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-gray-300">Scale</label>
          <select
            value={scaleName}
            onChange={(e) => onScaleChange(e.target.value as ScaleName)}
            aria-label="Select musical scale"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
          >
            {SCALES.map((scale) => (
              <option key={scale} value={scale}>
                {scale}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Volume Control */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-gray-300">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volume control"
          className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
    </div>
  );
});

export default ControlPanel;
