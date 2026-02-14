/**
 * AudioEngine - Singleton class managing the Web Audio API context and sound synthesis
 */

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface ADSRConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  frequency: number;
}

class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNotes: Map<number, ActiveNote> = new Map();
  private waveform: WaveformType = 'sine';
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
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Check if the audio engine is initialized and ready
   */
  isReady(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
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
   * Get current volume
   */
  getVolume(): number {
    return this.masterGain?.gain.value ?? 0.5;
  }

  /**
   * Set the waveform type
   */
  setWaveform(waveform: WaveformType): void {
    this.waveform = waveform;
  }

  /**
   * Get current waveform
   */
  getWaveform(): WaveformType {
    return this.waveform;
  }

  /**
   * Set ADSR envelope parameters
   */
  setADSR(config: Partial<ADSRConfig>): void {
    this.adsr = { ...this.adsr, ...config };
  }

  /**
   * Play a note at the specified frequency
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

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = this.waveform;
    oscillator.frequency.setValueAtTime(frequency, now);

    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);

    // Apply ADSR envelope (Attack & Decay phases)
    const peakTime = now + this.adsr.attack;
    const sustainTime = peakTime + this.adsr.decay;

    gainNode.gain.linearRampToValueAtTime(1, peakTime);
    gainNode.gain.linearRampToValueAtTime(this.adsr.sustain, sustainTime);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Start playing
    oscillator.start(now);

    // Store reference
    this.activeNotes.set(frequency, { oscillator, gainNode, frequency });
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
    const { oscillator, gainNode } = note;

    // Cancel any scheduled changes
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);

    // Apply release envelope
    gainNode.gain.linearRampToValueAtTime(0, now + this.adsr.release);

    // Schedule oscillator stop
    oscillator.stop(now + this.adsr.release + 0.01);

    // Remove from active notes
    this.activeNotes.delete(frequency);
  }

  /**
   * Stop all currently playing notes
   */
  stopAllNotes(): void {
    for (const frequency of this.activeNotes.keys()) {
      this.stopNote(frequency);
    }
  }

  /**
   * Get the number of currently active notes
   */
  getActiveNoteCount(): number {
    return this.activeNotes.size;
  }
}

export const audioEngine = AudioEngine.getInstance();
export default audioEngine;
