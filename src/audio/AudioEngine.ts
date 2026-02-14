/**
 * AudioEngine - Singleton class managing the Web Audio API context and sound synthesis
 */

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type SoundTheme = 'piano' | 'synth' | 'retro' | 'marimba' | 'bells' | 'strings';

interface ADSRConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface ThemeConfig {
  waveform: WaveformType;
  adsr: ADSRConfig;
  harmonics: number[];
  harmonicGains: number[];
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  detune?: number;
}

// Sound theme configurations
const THEME_CONFIGS: Record<SoundTheme, ThemeConfig> = {
  piano: {
    waveform: 'triangle',
    adsr: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 },
    harmonics: [1, 2, 3, 4, 5],
    harmonicGains: [1, 0.5, 0.25, 0.125, 0.0625],
    filterFreq: 4000,
    filterQ: 1,
    filterType: 'lowpass',
  },
  synth: {
    waveform: 'sawtooth',
    adsr: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.3 },
    harmonics: [1, 2],
    harmonicGains: [1, 0.5],
    filterFreq: 2000,
    filterQ: 5,
    filterType: 'lowpass',
    detune: 5,
  },
  retro: {
    waveform: 'square',
    adsr: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 },
    harmonics: [1],
    harmonicGains: [1],
  },
  marimba: {
    waveform: 'sine',
    adsr: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.3 },
    harmonics: [1, 4, 10],
    harmonicGains: [1, 0.3, 0.1],
  },
  bells: {
    waveform: 'sine',
    adsr: { attack: 0.001, decay: 0.5, sustain: 0.3, release: 0.8 },
    harmonics: [1, 2.4, 3, 4.5, 5.6],
    harmonicGains: [1, 0.6, 0.4, 0.25, 0.2],
  },
  strings: {
    waveform: 'sawtooth',
    adsr: { attack: 0.15, decay: 0.2, sustain: 0.6, release: 0.4 },
    harmonics: [1, 2, 3],
    harmonicGains: [1, 0.6, 0.3],
    filterFreq: 3000,
    filterQ: 2,
    filterType: 'lowpass',
    detune: 3,
  },
};

export const SOUND_THEMES: { value: SoundTheme; label: string; icon: string }[] = [
  { value: 'piano', label: 'Piano', icon: '🎹' },
  { value: 'synth', label: 'Synth', icon: '🎛️' },
  { value: 'retro', label: 'Retro', icon: '👾' },
  { value: 'marimba', label: 'Marimba', icon: '🥁' },
  { value: 'bells', label: 'Bells', icon: '🔔' },
  { value: 'strings', label: 'Strings', icon: '🎻' },
];

interface ActiveNote {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filter?: BiquadFilterNode;
  frequency: number;
}

class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeNotes: Map<number, ActiveNote> = new Map();
  private soundTheme: SoundTheme = 'piano';
  private adsr: ADSRConfig = {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 0.3,
  };

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initialize the AudioContext (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Get the analyser node for visualization
   */
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Get the audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Set the master volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext!.currentTime
      );
    }
  }

  /**
   * Set the waveform type (deprecated - use setSoundTheme instead)
   */
  setWaveform(_waveform: WaveformType): void {
    // Waveform is now determined by sound theme
    // This method is kept for API compatibility
  }

  /**
   * Set the sound theme
   */
  setSoundTheme(theme: SoundTheme): void {
    this.soundTheme = theme;
    const config = THEME_CONFIGS[theme];
    this.adsr = config.adsr;
  }

  /**
   * Get current sound theme
   */
  getSoundTheme(): SoundTheme {
    return this.soundTheme;
  }

  /**
   * Play a note at the specified frequency using current theme
   */
  playNote(frequency: number): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('AudioEngine not initialized');
      return;
    }

    // Don't play if already playing this frequency
    if (this.activeNotes.has(frequency)) {
      return;
    }

    const now = this.audioContext.currentTime;
    const config = THEME_CONFIGS[this.soundTheme];

    // Create oscillators for each harmonic
    const oscillators: OscillatorNode[] = [];
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);

    // Create optional filter
    let filter: BiquadFilterNode | undefined;

    if (config.filterFreq && config.filterType) {
      filter = this.audioContext.createBiquadFilter();
      filter.type = config.filterType;
      filter.frequency.value = config.filterFreq;
      filter.Q.value = config.filterQ || 1;
      gainNode.connect(filter);
    }

    // Create harmonics
    config.harmonics.forEach((harmonic, index) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = config.waveform;
      osc.frequency.setValueAtTime(frequency * harmonic, now);

      if (config.detune) {
        osc.detune.setValueAtTime(config.detune * (index % 2 ? 1 : -1), now);
      }

      const harmonicGain = this.audioContext!.createGain();
      harmonicGain.gain.value = config.harmonicGains[index] || 0.5;

      osc.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      osc.start(now);
      oscillators.push(osc);
    });

    // Connect to master (through filter if exists)
    if (filter) {
      filter.connect(this.masterGain);
    } else {
      gainNode.connect(this.masterGain);
    }

    // Apply ADSR envelope
    const peakTime = now + this.adsr.attack;
    const sustainTime = peakTime + this.adsr.decay;

    gainNode.gain.linearRampToValueAtTime(1, peakTime);
    gainNode.gain.linearRampToValueAtTime(this.adsr.sustain, sustainTime);

    // Store reference
    this.activeNotes.set(frequency, { oscillators, gainNode, filter, frequency });
  }

  /**
   * Stop a note at the specified frequency
   */
  stopNote(frequency: number): void {
    const note = this.activeNotes.get(frequency);
    if (!note || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    const { oscillators, gainNode } = note;

    // Cancel any scheduled changes
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);

    // Apply release envelope
    gainNode.gain.linearRampToValueAtTime(0, now + this.adsr.release);

    // Schedule oscillator stops
    oscillators.forEach((osc) => {
      osc.stop(now + this.adsr.release + 0.01);
    });

    // Remove from active notes
    this.activeNotes.delete(frequency);
  }
}

export const audioEngine = AudioEngine.getInstance();
export default audioEngine;
