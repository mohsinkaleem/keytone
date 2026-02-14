/**
 * Text chunking utilities for ingesting large texts
 */

export interface ChunkOptions {
  maxLength?: number;
  minLength?: number;
  preserveSentences?: boolean;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxLength: 500,
  minLength: 100,
  preserveSentences: true,
};

/**
 * Split text into chunks at sentence boundaries
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxLength, minLength, preserveSentences } = opts;

  // Clean up the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length <= maxLength) {
    return [cleanedText];
  }

  const chunks: string[] = [];
  
  if (preserveSentences) {
    // Split by sentence boundaries
    const sentences = cleanedText.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      const potentialChunk = currentChunk
        ? `${currentChunk} ${sentence}`
        : sentence;

      if (potentialChunk.length > maxLength && currentChunk.length >= minLength) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else if (potentialChunk.length > maxLength && sentence.length > maxLength) {
        // Sentence itself is too long, force split
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // Split long sentence by words
        const words = sentence.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          const test = currentChunk ? `${currentChunk} ${word}` : word;
          if (test.length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk = test;
          }
        }
      } else {
        currentChunk = potentialChunk;
      }
    }

    if (currentChunk.trim()) {
      // If last chunk is too small, merge with previous
      if (currentChunk.length < minLength && chunks.length > 0) {
        const lastChunk = chunks.pop()!;
        chunks.push(`${lastChunk} ${currentChunk}`.trim());
      } else {
        chunks.push(currentChunk.trim());
      }
    }
  } else {
    // Simple split by max length at word boundaries
    const words = cleanedText.split(/\s+/);
    let currentChunk = '';

    for (const word of words) {
      const test = currentChunk ? `${currentChunk} ${word}` : word;
      if (test.length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk = test;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
  }

  return chunks.filter(c => c.length > 0);
}

/**
 * Parse text file content and normalize it
 */
export function parseTextFile(content: string): string {
  return content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ') // Replace tabs with spaces
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .replace(/^ +/gm, '') // Remove leading spaces on lines
    .replace(/ +$/gm, '') // Remove trailing spaces on lines
    .trim();
}

/**
 * Estimate difficulty based on text characteristics
 */
export function estimateDifficulty(text: string): 'easy' | 'medium' | 'hard' {
  const avgWordLength = text.split(/\s+/).reduce((acc, w) => acc + w.length, 0) / text.split(/\s+/).length;
  const hasSpecialChars = /[{}[\]()+=<>|&^%$#@!~`]/.test(text);
  
  if (hasSpecialChars && avgWordLength > 5) return 'hard';
  if (hasSpecialChars || avgWordLength > 4.5) return 'medium';
  return 'easy';
}

/**
 * Generate excerpt title from text
 */
export function generateTitle(text: string, index: number): string {
  const firstWords = text.split(/\s+/).slice(0, 4).join(' ');
  const cleanTitle = firstWords.length > 30 
    ? firstWords.substring(0, 27) + '...'
    : firstWords;
  return `Part ${index + 1}: ${cleanTitle}`;
}
