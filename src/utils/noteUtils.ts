/**
 * Note utilities for key-to-frequency mapping and scale generation
 */

// Standard A4 = 440 Hz reference
const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midiNote: number): number {
  return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NUMBER) / 12);
}

/**
 * Scales for Harmonious Typing mode
 */
export const SCALES = {
  'C Major Pentatonic': [60, 62, 64, 67, 69, 72, 74, 76, 79, 81],
  'C Major': [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79],
  'A Minor Pentatonic': [57, 60, 62, 64, 67, 69, 72, 74, 76, 79],
  'C Minor': [60, 62, 63, 65, 67, 68, 70, 72, 74, 75, 77, 79],
} as const;

export type ScaleName = keyof typeof SCALES;

/**
 * Scale walker for harmonious mode
 * Returns the next note in the scale
 */
export class ScaleWalker {
  private scale: number[];
  private currentIndex: number = 0;

  constructor(scaleName: ScaleName = 'C Major Pentatonic') {
    this.scale = [...SCALES[scaleName]];
  }

  setScale(scaleName: ScaleName): void {
    this.scale = [...SCALES[scaleName]];
    this.currentIndex = 0;
  }

  getNextNote(): number {
    const note = this.scale[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.scale.length;
    return note;
  }

  reset(): void {
    this.currentIndex = 0;
  }
}
