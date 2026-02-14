/**
 * Note utilities for key-to-frequency mapping and melodic generation
 * Enhanced with chord progressions, character-aware note selection, and musical phrasing
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
 * Extended Scales for Harmonious Typing mode
 */
export const SCALES = {
  'C Major Pentatonic': [60, 62, 64, 67, 69, 72, 74, 76, 79, 81],
  'C Major': [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79],
  'A Minor Pentatonic': [57, 60, 62, 64, 67, 69, 72, 74, 76, 79],
  'C Minor': [60, 62, 63, 65, 67, 68, 70, 72, 74, 75, 77, 79],
} as const;

export type ScaleName = keyof typeof SCALES;

/**
 * Musical chord progressions (relative to root)
 * Each progression has chords defined as arrays of intervals from root
 */
const CHORD_PROGRESSIONS = {
  // I - V - vi - IV (Pop progression)
  pop: [
    { root: 0, intervals: [0, 4, 7] },     // C major (I)
    { root: 7, intervals: [0, 4, 7] },     // G major (V)
    { root: 9, intervals: [0, 3, 7] },     // A minor (vi)
    { root: 5, intervals: [0, 4, 7] },     // F major (IV)
  ],
  // I - vi - IV - V (50s progression)
  classic: [
    { root: 0, intervals: [0, 4, 7] },     // C major (I)
    { root: 9, intervals: [0, 3, 7] },     // A minor (vi)
    { root: 5, intervals: [0, 4, 7] },     // F major (IV)
    { root: 7, intervals: [0, 4, 7] },     // G major (V)
  ],
  // ii - V - I (Jazz progression)
  jazz: [
    { root: 2, intervals: [0, 3, 7, 10] }, // D minor 7 (ii)
    { root: 7, intervals: [0, 4, 7, 10] }, // G dominant 7 (V)
    { root: 0, intervals: [0, 4, 7, 11] }, // C major 7 (I)
    { root: 0, intervals: [0, 4, 7, 11] }, // C major 7 (I) - rest
  ],
  // I - IV - I - V (Blues-inspired)
  blues: [
    { root: 0, intervals: [0, 4, 7, 10] }, // C7 (I)
    { root: 5, intervals: [0, 4, 7, 10] }, // F7 (IV)
    { root: 0, intervals: [0, 4, 7, 10] }, // C7 (I)
    { root: 7, intervals: [0, 4, 7, 10] }, // G7 (V)
  ],
  // Ambient/ethereal progression
  ambient: [
    { root: 0, intervals: [0, 7, 12, 16] },  // C add9
    { root: 5, intervals: [0, 7, 12, 14] },  // F add9
    { root: 9, intervals: [0, 7, 12, 15] },  // Am add9
    { root: 7, intervals: [0, 7, 12, 14] },  // G add9
  ],
} as const;

export type ProgressionName = keyof typeof CHORD_PROGRESSIONS;

// Character classification for note selection
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
const PUNCTUATION = new Set(['.', ',', '!', '?', ';', ':', '"', "'", '-', '(', ')']);

type CharacterType = 'vowel' | 'consonant' | 'punctuation' | 'number' | 'space' | 'other';

function classifyCharacter(char: string): CharacterType {
  if (char === ' ') return 'space';
  if (VOWELS.has(char)) return 'vowel';
  if (PUNCTUATION.has(char)) return 'punctuation';
  if (/[0-9]/.test(char)) return 'number';
  if (/[a-zA-Z]/.test(char)) return 'consonant';
  return 'other';
}

/**
 * Melodic patterns for different character types
 * Defined as scale degree offsets (0-indexed from current chord)
 */
const MELODIC_PATTERNS = {
  vowel: {
    // Vowels get root and stable chord tones - warm, grounded
    patterns: [[0], [2], [0, 2], [2, 0]],
    octaveRange: [0, 0], // Stay in home octave
    velocityRange: [0.7, 1.0],
  },
  consonant: {
    // Consonants get more variety with passing tones
    patterns: [[0], [1], [2], [3], [1, 2], [2, 1], [0, 1, 2]],
    octaveRange: [-1, 1], // Can move octave
    velocityRange: [0.5, 0.9],
  },
  punctuation: {
    // Punctuation gets accent notes - higher register
    patterns: [[2], [3], [0, 3]],
    octaveRange: [1, 2], // Higher octave for accent
    velocityRange: [0.8, 1.0],
  },
  number: {
    // Numbers get arpeggiated sequences
    patterns: [[0], [1], [2], [3], [0, 2], [1, 3]],
    octaveRange: [0, 1],
    velocityRange: [0.6, 0.9],
  },
  space: {
    // Space gets bass note
    patterns: [[0]],
    octaveRange: [-2, -1], // Low octave for bass thump
    velocityRange: [0.4, 0.6],
  },
  other: {
    patterns: [[0]],
    octaveRange: [0, 0],
    velocityRange: [0.5, 0.7],
  },
};

/**
 * Enhanced melodic generator with chord progressions and character-aware selection
 */
export class MelodicGenerator {
  private baseNote: number = 60; // Middle C
  private progression: typeof CHORD_PROGRESSIONS[ProgressionName];
  private chordIndex: number = 0;
  private charCount: number = 0;
  private wordCount: number = 0;
  private lastNotes: number[] = [];
  private phraseLength: number = 8; // Characters per musical phrase
  private progressionName: ProgressionName;

  constructor(progressionName: ProgressionName = 'pop') {
    this.progressionName = progressionName;
    this.progression = CHORD_PROGRESSIONS[progressionName];
  }

  setProgression(progressionName: ProgressionName): void {
    this.progressionName = progressionName;
    this.progression = CHORD_PROGRESSIONS[progressionName];
    this.reset();
  }

  getProgressionName(): ProgressionName {
    return this.progressionName;
  }

  reset(): void {
    this.chordIndex = 0;
    this.charCount = 0;
    this.wordCount = 0;
    this.lastNotes = [];
  }

  /**
   * Advance chord progression based on phrase structure
   */
  private advanceChord(): void {
    this.charCount++;
    // Change chord every phraseLength characters
    if (this.charCount % this.phraseLength === 0) {
      this.chordIndex = (this.chordIndex + 1) % this.progression.length;
    }
  }

  /**
   * Get current chord notes as MIDI values
   */
  private getCurrentChordNotes(): number[] {
    const chord = this.progression[this.chordIndex];
    return chord.intervals.map(interval => this.baseNote + chord.root + interval);
  }

  /**
   * Select note based on character type and current harmonic context
   */
  getNextNote(char: string): { note: number; velocity: number; isSpace: boolean } {
    const charType = classifyCharacter(char);
    const isSpace = charType === 'space';
    
    // Get melodic pattern config for this character type
    const patternConfig = MELODIC_PATTERNS[charType];
    const chordNotes = this.getCurrentChordNotes();
    
    // Select a pattern
    const patternIndex = this.charCount % patternConfig.patterns.length;
    const pattern = patternConfig.patterns[patternIndex];
    
    // Pick a note from the pattern (use first for single notes)
    const degreeIndex = pattern[0] % chordNotes.length;
    let note = chordNotes[degreeIndex];
    
    // Apply octave adjustment
    const [minOct, maxOct] = patternConfig.octaveRange;
    const octaveAdjust = minOct + Math.floor(Math.random() * (maxOct - minOct + 1));
    note += octaveAdjust * 12;
    
    // Avoid repeating the same note too often
    if (this.lastNotes.length >= 2 && this.lastNotes.every(n => n === note)) {
      // Shift to another chord tone
      const altIndex = (degreeIndex + 1) % chordNotes.length;
      note = chordNotes[altIndex] + octaveAdjust * 12;
    }
    
    // Calculate velocity with slight randomization
    const [minVel, maxVel] = patternConfig.velocityRange;
    const velocity = minVel + Math.random() * (maxVel - minVel);
    
    // Track for anti-repetition
    this.lastNotes.push(note);
    if (this.lastNotes.length > 3) {
      this.lastNotes.shift();
    }
    
    // Advance harmonic progression
    this.advanceChord();
    
    // Track words
    if (charType === 'space') {
      this.wordCount++;
    }
    
    return { note, velocity, isSpace };
  }

  /**
   * Get multiple notes for arpeggio effects
   */
  getArpeggioNotes(): number[] {
    return this.getCurrentChordNotes();
  }
}

