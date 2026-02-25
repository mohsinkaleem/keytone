/**
 * Text chunking utilities for ingesting large texts
 *
 * Supports sentence-boundary splitting, paragraph-boundary splitting,
 * and chapter-aware chunking for EPUBs.
 */

export interface ChunkOptions {
  maxLength?: number;
  minLength?: number;
  preserveSentences?: boolean;
  /** When true, also try to break at paragraph boundaries (\n\n) first */
  preserveParagraphs?: boolean;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxLength: 500,
  minLength: 100,
  preserveSentences: true,
  preserveParagraphs: true,
};

/**
 * Split text into chunks at sentence / paragraph boundaries.
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxLength, minLength, preserveSentences, preserveParagraphs } = opts;

  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length <= maxLength) {
    return cleanedText.length >= minLength ? [cleanedText] : [cleanedText];
  }

  // Step 1: split into paragraphs first (if enabled)
  const units = preserveParagraphs
    ? cleanedText.split(/\n\n+/).filter(Boolean)
    : preserveSentences
      ? cleanedText.split(/(?<=[.!?])\s+/)
      : cleanedText.split(/\s+/);

  const chunks: string[] = [];
  let current = '';

  for (const unit of units) {
    const separator = preserveParagraphs ? '\n\n' : ' ';
    const candidate = current ? `${current}${separator}${unit}` : unit;

    if (candidate.length > maxLength && current.length >= minLength) {
      chunks.push(current.trim());
      current = unit;
    } else if (candidate.length > maxLength && unit.length > maxLength) {
      // Unit itself exceeds max – sub-split it
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      const subChunks = preserveSentences
        ? splitBySentences(unit, maxLength, minLength)
        : splitByWords(unit, maxLength);
      chunks.push(...subChunks);
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    if (current.length < minLength && chunks.length > 0) {
      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}\n\n${current}`.trim();
    } else {
      chunks.push(current.trim());
    }
  }

  return chunks.filter(c => c.length > 0);
}

/** Split a long block at sentence boundaries */
function splitBySentences(text: string, maxLength: number, minLength: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLength && current.length >= minLength) {
      chunks.push(current.trim());
      current = sentence;
    } else if (candidate.length > maxLength) {
      if (current) chunks.push(current.trim());
      chunks.push(...splitByWords(sentence, maxLength));
      current = '';
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Fallback: split by words */
function splitByWords(text: string, maxLength: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Parse/normalise a plain-text file.
 */
export function parseTextFile(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/^ +/gm, '')
    .replace(/ +$/gm, '')
    .trim();
}

/**
 * Estimate difficulty based on text characteristics.
 */
export function estimateDifficulty(text: string): 'easy' | 'medium' | 'hard' {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'easy';
  const avgWordLength = words.reduce((acc, w) => acc + w.length, 0) / words.length;
  const hasSpecialChars = /[{}[\]()+=<>|&^%$#@!~`]/.test(text);
  const hasLongWords = words.some(w => w.length > 12);

  if ((hasSpecialChars && avgWordLength > 5) || hasLongWords) return 'hard';
  if (hasSpecialChars || avgWordLength > 4.5) return 'medium';
  return 'easy';
}

/**
 * Generate a readable excerpt title from its text.
 */
export function generateTitle(text: string, index: number): string {
  const firstWords = text.split(/\s+/).slice(0, 5).join(' ');
  const cleanTitle = firstWords.length > 35
    ? firstWords.substring(0, 32) + '...'
    : firstWords;
  return `Part ${index + 1}: ${cleanTitle}`;
}
