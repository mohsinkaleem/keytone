/**
 * AudioEngine - Singleton class managing the Web Audio API context and sound synthesis
 */

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type SoundTheme = 'piano' | 'synth' | 'retro' | 'marimba' | 'bells' | 'strings' | 'typewriter';
export type TypewriterVariant = 'classic' | 'thock' | 'clicky';

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
  typewriter: {
    waveform: 'square',
    adsr: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    harmonics: [1, 2.8],
    harmonicGains: [1, 0.2],
    filterFreq: 3500,
    filterQ: 4,
    filterType: 'bandpass',
  },
};

export const SOUND_THEMES: { value: SoundTheme; label: string; icon: string }[] = [
  { value: 'piano', label: 'Piano', icon: '🎹' },
  { value: 'synth', label: 'Synth', icon: '🎛️' },
  { value: 'retro', label: 'Retro', icon: '👾' },
  { value: 'marimba', label: 'Marimba', icon: '🥁' },
  { value: 'bells', label: 'Bells', icon: '🔔' },
  { value: 'strings', label: 'Strings', icon: '🎻' },
  { value: 'typewriter', label: 'Typewriter', icon: '⌨️' },
];

export const TYPEWRITER_VARIANTS: { value: TypewriterVariant; label: string; icon: string }[] = [
  { value: 'classic', label: 'Classic', icon: '🖨️' },
  { value: 'thock', label: 'Thock', icon: '🧱' },
  { value: 'clicky', label: 'Clicky', icon: '⚙️' },
];

interface TypewriterVariantConfig {
  keyNoiseFreq: number;
  keyNoiseQ: number;
  keyClickStart: number;
  keyClickEnd: number;
  keyBodyStart: number;
  keyBodyEnd: number;
  keyNoiseGain: number;
  keyBodyGain: number;
  keyClickGain: number;
  keyRelease: number;
  spaceThudStart: number;
  spaceThudEnd: number;
  spaceThudGain: number;
  spaceThudRelease: number;
  spaceNoiseFreq: number;
  spaceNoiseQ: number;
  spaceNoiseGain: number;
  spaceClickStart: number;
  spaceClickGain: number;
  spaceTailStart: number;
  spaceTailEnd: number;
  spaceTailGain: number;
}

const TYPEWRITER_VARIANT_CONFIGS: Record<TypewriterVariant, TypewriterVariantConfig> = {
  classic: {
    keyNoiseFreq: 2200,
    keyNoiseQ: 3.2,
    keyClickStart: 2150,
    keyClickEnd: 620,
    keyBodyStart: 250,
    keyBodyEnd: 115,
    keyNoiseGain: 0.17,
    keyBodyGain: 0.14,
    keyClickGain: 0.12,
    keyRelease: 0.045,
    spaceThudStart: 165,
    spaceThudEnd: 58,
    spaceThudGain: 0.42,
    spaceThudRelease: 0.11,
    spaceNoiseFreq: 780,
    spaceNoiseQ: 1.1,
    spaceNoiseGain: 0.13,
    spaceClickStart: 980,
    spaceClickGain: 0.07,
    spaceTailStart: 88,
    spaceTailEnd: 47,
    spaceTailGain: 0.11,
  },
  thock: {
    keyNoiseFreq: 1800,
    keyNoiseQ: 2,
    keyClickStart: 1450,
    keyClickEnd: 450,
    keyBodyStart: 210,
    keyBodyEnd: 90,
    keyNoiseGain: 0.12,
    keyBodyGain: 0.22,
    keyClickGain: 0.07,
    keyRelease: 0.058,
    spaceThudStart: 138,
    spaceThudEnd: 42,
    spaceThudGain: 0.52,
    spaceThudRelease: 0.14,
    spaceNoiseFreq: 620,
    spaceNoiseQ: 0.9,
    spaceNoiseGain: 0.1,
    spaceClickStart: 760,
    spaceClickGain: 0.05,
    spaceTailStart: 74,
    spaceTailEnd: 38,
    spaceTailGain: 0.15,
  },
  clicky: {
    keyNoiseFreq: 2900,
    keyNoiseQ: 4.5,
    keyClickStart: 3200,
    keyClickEnd: 760,
    keyBodyStart: 300,
    keyBodyEnd: 140,
    keyNoiseGain: 0.22,
    keyBodyGain: 0.09,
    keyClickGain: 0.18,
    keyRelease: 0.036,
    spaceThudStart: 175,
    spaceThudEnd: 64,
    spaceThudGain: 0.36,
    spaceThudRelease: 0.1,
    spaceNoiseFreq: 980,
    spaceNoiseQ: 1.5,
    spaceNoiseGain: 0.16,
    spaceClickStart: 1280,
    spaceClickGain: 0.1,
    spaceTailStart: 95,
    spaceTailEnd: 54,
    spaceTailGain: 0.08,
  },
};

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
  private typewriterVariant: TypewriterVariant = 'classic';
  private isMuted: boolean = false;
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
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime
      );
    }
  }

  /**
   * Set muted state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Get muted state
   */
  getMuted(): boolean {
    return this.isMuted;
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

  setTypewriterVariant(variant: TypewriterVariant): void {
    this.typewriterVariant = variant;
  }

  getTypewriterVariant(): TypewriterVariant {
    return this.typewriterVariant;
  }

  private createNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    const frameCount = Math.max(1, Math.floor(this.audioContext.sampleRate * durationSeconds));
    const buffer = this.audioContext.createBuffer(1, frameCount, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const envelope = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    return buffer;
  }

  private playThemedNote(frequency: number, velocity: number): void {
    if (!this.audioContext || !this.masterGain || this.isMuted) {
      return;
    }

    if (this.soundTheme === 'typewriter') {
      this.playTypewriterKeySound({ velocity });
      return;
    }

    if (this.activeNotes.has(frequency)) {
      return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const config = THEME_CONFIGS[this.soundTheme];
    const oscillators: OscillatorNode[] = [];
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);

    let filter: BiquadFilterNode | undefined;
    if (config.filterFreq && config.filterType) {
      filter = ctx.createBiquadFilter();
      filter.type = config.filterType;
      filter.frequency.value = config.filterFreq;
      filter.Q.value = config.filterQ || 1;
      gainNode.connect(filter);
    }

    config.harmonics.forEach((harmonic, index) => {
      const osc = ctx.createOscillator();
      osc.type = config.waveform;
      osc.frequency.setValueAtTime(frequency * harmonic, now);

      if (config.detune) {
        osc.detune.setValueAtTime(config.detune * (index % 2 ? 1 : -1), now);
      }

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.value = (config.harmonicGains[index] || 0.5) * velocity;

      osc.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      osc.start(now);
      oscillators.push(osc);
    });

    if (filter) {
      filter.connect(this.masterGain);
    } else {
      gainNode.connect(this.masterGain);
    }

    const peakTime = now + this.adsr.attack;
    const sustainTime = peakTime + this.adsr.decay;
    gainNode.gain.linearRampToValueAtTime(velocity, peakTime);
    gainNode.gain.linearRampToValueAtTime(this.adsr.sustain * velocity, sustainTime);
    this.activeNotes.set(frequency, { oscillators, gainNode, filter, frequency });
  }

  /**
   * Play a note at the specified frequency using current theme
   */
  playNote(frequency: number): void {
    this.playThemedNote(frequency, 1);
  }

  /**
   * Spacebar "dhab" for typewriter mode.
   * Heavier low-end than regular key clicks to make spacebar distinct.
   */
  private playTypewriterSpacebarThud(
    config: TypewriterVariantConfig,
    velocity: number,
    isError: boolean,
  ): void {
    if (!this.audioContext || !this.masterGain) {
      return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const release = config.spaceThudRelease;
    const attack = 0.002;

    // Broad low-frequency thud.
    const thudOsc = ctx.createOscillator();
    thudOsc.type = isError ? 'sawtooth' : 'triangle';
    thudOsc.frequency.setValueAtTime(config.spaceThudStart, now);
    thudOsc.frequency.exponentialRampToValueAtTime(config.spaceThudEnd, now + release * 0.8);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.0001, now);
    thudGain.gain.linearRampToValueAtTime(velocity * config.spaceThudGain, now + attack);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    // Metal bar noise tail.
    const noiseBuffer = this.createNoiseBuffer(release + 0.03);
    if (!noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = isError ? 'highpass' : 'bandpass';
    noiseFilter.frequency.value = config.spaceNoiseFreq;
    noiseFilter.Q.value = config.spaceNoiseQ;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(velocity * config.spaceNoiseGain, now + attack);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Initial click transient.
    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(config.spaceClickStart, now);
    click.frequency.exponentialRampToValueAtTime(config.spaceThudEnd * 8, now + 0.016);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(velocity * config.spaceClickGain, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);

    // Very low resonant tail that reads as "dhab".
    const tail = ctx.createOscillator();
    tail.type = 'sine';
    tail.frequency.setValueAtTime(config.spaceTailStart, now);
    tail.frequency.exponentialRampToValueAtTime(config.spaceTailEnd, now + release * 0.9);
    const tailGain = ctx.createGain();
    tailGain.gain.setValueAtTime(velocity * config.spaceTailGain, now + 0.006);
    tailGain.gain.exponentialRampToValueAtTime(0.0001, now + release + 0.02);
    tail.connect(tailGain);
    tailGain.connect(this.masterGain);

    thudOsc.start(now);
    thudOsc.stop(now + release + 0.02);
    noise.start(now);
    noise.stop(now + release + 0.04);
    click.start(now);
    click.stop(now + 0.03);
    tail.start(now);
    tail.stop(now + release + 0.05);

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      thudOsc.disconnect();
      thudGain.disconnect();
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      click.disconnect();
      clickGain.disconnect();
      tail.disconnect();
      tailGain.disconnect();
    };
    noise.onended = cleanup;
    thudOsc.onended = cleanup;
  }

  /**
   * Mechanical typewriter click/clack.
   * Designed as a short, percussive transient rather than a pitched note.
   */
  playTypewriterKeySound(options: {
    velocity?: number;
    isSpace?: boolean;
    isError?: boolean;
  } = {}): void {
    if (!this.audioContext || !this.masterGain || this.isMuted) {
      return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const isSpace = options.isSpace ?? false;
    const isError = options.isError ?? false;
    const velocity = Math.max(0.2, Math.min(1.2, options.velocity ?? 0.8));
    const config = TYPEWRITER_VARIANT_CONFIGS[this.typewriterVariant];

    if (isSpace) {
      this.playTypewriterSpacebarThud(config, velocity, isError);
      return;
    }

    const release = config.keyRelease * (isError ? 0.85 : 1);
    const attack = 0.001;

    // High-band noise gives the metal key strike texture.
    const noiseBuffer = this.createNoiseBuffer(release + 0.02);
    if (!noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = isError ? 'highpass' : 'bandpass';
    noiseFilter.frequency.value = config.keyNoiseFreq * (isError ? 0.82 : 1);
    noiseFilter.Q.value = config.keyNoiseQ;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(velocity * config.keyNoiseGain, now + attack);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Body thunk gives tactile weight.
    const thunk = ctx.createOscillator();
    thunk.type = isError ? 'sawtooth' : 'triangle';
    thunk.frequency.setValueAtTime(config.keyBodyStart, now);
    thunk.frequency.exponentialRampToValueAtTime(config.keyBodyEnd, now + release * 0.75);
    const thunkGain = ctx.createGain();
    thunkGain.gain.setValueAtTime(0.0001, now);
    thunkGain.gain.linearRampToValueAtTime(velocity * config.keyBodyGain, now + attack);
    thunkGain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    thunk.connect(thunkGain);
    thunkGain.connect(this.masterGain);

    // Front-edge click.
    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(config.keyClickStart, now);
    click.frequency.exponentialRampToValueAtTime(config.keyClickEnd, now + 0.018);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(velocity * config.keyClickGain, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + release + 0.02);
    thunk.start(now);
    thunk.stop(now + release + 0.01);
    click.start(now);
    click.stop(now + 0.03);

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      thunk.disconnect();
      thunkGain.disconnect();
      click.disconnect();
      clickGain.disconnect();
    };
    noise.onended = cleanup;
    thunk.onended = cleanup;
  }

  /**
   * Play a satisfying spacebar sound (rich bass thump with layered textures)
   */
  playSpacebarSound(velocity: number = 0.5): void {
    if (!this.audioContext || !this.masterGain || this.isMuted) {
      return;
    }

    if (this.soundTheme === 'typewriter') {
      this.playTypewriterKeySound({ isSpace: true, velocity });
      return;
    }

    const now = this.audioContext.currentTime;
    const baseFreq = 80; // Slightly higher for more presence

    // === Layer 1: Main bass thump with pitch drop ===
    const bassOsc = this.audioContext.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(baseFreq * 1.5, now);
    bassOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

    const bassGain = this.audioContext.createGain();
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(velocity * 0.7, now + 0.005);
    bassGain.gain.exponentialRampToValueAtTime(velocity * 0.3, now + 0.04);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    // Bass filter for warmth
    const bassFilter = this.audioContext.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 300;
    bassFilter.Q.value = 1;

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    // === Layer 2: Sub-bass for depth ===
    const subOsc = this.audioContext.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.1);

    const subGain = this.audioContext.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(velocity * 0.4, now + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    // === Layer 3: Click transient for tactile feel ===
    const clickOsc = this.audioContext.createOscillator();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

    const clickGain = this.audioContext.createGain();
    clickGain.gain.setValueAtTime(velocity * 0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    const clickFilter = this.audioContext.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 800;
    clickFilter.Q.value = 2;

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);

    // === Layer 4: Soft noise burst for texture ===
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 0.04,
      this.audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      // Shaped noise - starts strong, fades
      const envelope = 1 - (i / noiseData.length);
      noiseData[i] = (Math.random() * 2 - 1) * 0.4 * envelope;
    }
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value = 0.7;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Start all oscillators
    bassOsc.start(now);
    bassOsc.stop(now + 0.2);
    subOsc.start(now);
    subOsc.stop(now + 0.18);
    clickOsc.start(now);
    clickOsc.stop(now + 0.03);
    noiseSource.start(now);
    noiseSource.stop(now + 0.05);
  }

  /**
   * Play a note with velocity control
   */
  playNoteWithVelocity(frequency: number, velocity: number = 1.0): void {
    this.playThemedNote(frequency, velocity);
  }

  /**
   * Stop a note at the specified frequency
   * Properly disconnects all audio nodes after release to prevent GC pressure
   */
  stopNote(frequency: number): void {
    const note = this.activeNotes.get(frequency);
    if (!note || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    const { oscillators, gainNode, filter } = note;
    const releaseEnd = now + this.adsr.release + 0.01;

    // Cancel any scheduled changes
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);

    // Apply release envelope
    gainNode.gain.linearRampToValueAtTime(0, now + this.adsr.release);

    // Schedule oscillator stops and disconnect all nodes after release
    oscillators.forEach((osc) => {
      osc.stop(releaseEnd);
      osc.onended = () => {
        osc.disconnect();
      };
    });

    // Schedule cleanup of gain and filter nodes after release
    const cleanupMs = (this.adsr.release + 0.05) * 1000;
    setTimeout(() => {
      gainNode.disconnect();
      filter?.disconnect();
    }, cleanupMs);

    // Remove from active notes immediately to allow replaying
    this.activeNotes.delete(frequency);
  }
}

export const audioEngine = AudioEngine.getInstance();
export default audioEngine;
