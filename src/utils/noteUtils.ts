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
 * Note names for display
 */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get note name from MIDI number
 */
export function getNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = NOTE_NAMES[midiNote % 12];
  return `${noteName}${octave}`;
}

/**
 * Keyboard mapping for Instrument (Piano) mode
 * Maps physical keyboard keys to MIDI note numbers
 * Starting from C4 (MIDI 60)
 */
export const PIANO_KEY_MAP: Record<string, number> = {
  // Bottom row - white keys (C4 to B4)
  'a': 60,  // C4
  's': 62,  // D4
  'd': 64,  // E4
  'f': 65,  // F4
  'g': 67,  // G4
  'h': 69,  // A4
  'j': 71,  // B4
  'k': 72,  // C5
  'l': 74,  // D5
  ';': 76,  // E5
  
  // Top row - black keys
  'w': 61,  // C#4
  'e': 63,  // D#4
  't': 66,  // F#4
  'y': 68,  // G#4
  'u': 70,  // A#4
  'o': 73,  // C#5
  'p': 75,  // D#5
};

/**
 * Visual layout info for keyboard display
 */
export interface KeyInfo {
  key: string;
  midiNote: number;
  noteName: string;
  isBlack: boolean;
  frequency: number;
}

/**
 * Get all piano keys info for display
 */
export function getPianoKeysInfo(): KeyInfo[] {
  return Object.entries(PIANO_KEY_MAP)
    .map(([key, midiNote]) => ({
      key,
      midiNote,
      noteName: getNoteName(midiNote),
      isBlack: NOTE_NAMES[midiNote % 12].includes('#'),
      frequency: midiToFrequency(midiNote),
    }))
    .sort((a, b) => a.midiNote - b.midiNote);
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

/**
 * Get frequency for a key in Piano mode
 */
export function getFrequencyForKey(key: string): number | null {
  const midiNote = PIANO_KEY_MAP[key.toLowerCase()];
  if (midiNote === undefined) {
    return null;
  }
  return midiToFrequency(midiNote);
}
