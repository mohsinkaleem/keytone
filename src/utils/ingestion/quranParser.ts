/**
 * Quran-specific parser for creating typing universes.
 *
 * Handles common Quran text formats:
 * - Pipe-delimited: surah|ayah|text (e.g. Tanzil.net exports)
 * - Numbered verses: "1. In the name of Allah..." per line
 * - Surah-headed plain text with "Surah N:" or "Chapter N:" headers
 * - Plain paragraph text (falls back to smart verse grouping)
 */

import type { Excerpt } from '../../types/universe';
import { chunkText, estimateDifficulty } from './chunking';

export interface QuranParseOptions {
  /** Target excerpt length in characters (default: 400) */
  excerptLength?: number;
  /** Group verses into excerpts to reach target length */
  groupVerses?: boolean;
}

interface ParsedVerse {
  surah: number;
  ayah: number;
  text: string;
}

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
  6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
  21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan',
  26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
  36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahina',
  61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij',
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddathir', 75: 'Al-Qiyamah',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin',
  96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
  101: 'Al-Qariah', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
  106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

function surahName(n: number): string {
  return SURAH_NAMES[n] || `Surah ${n}`;
}

/** Clean common text artifacts (OCR/formatting issues) */
function cleanQuranText(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')       // Fix "Godcompassed" → "God compassed"
    .replace(/([.!?;:,])([A-Z])/g, '$1 $2')     // Fix "Potent.If" → "Potent. If"
    .replace(/([a-z])(their|your|our|his|her)/gi, '$1 $2') // Fix merged pronouns
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Try parsing pipe-delimited format: surah|ayah|text */
function parsePipeDelimited(text: string): ParsedVerse[] | null {
  const lines = text.split('\n').filter(l => l.trim());
  const pipeLines = lines.filter(l => /^\d+\|\d+\|/.test(l.trim()));
  if (pipeLines.length < lines.length * 0.5) return null;

  return pipeLines.map(line => {
    const [s, a, ...rest] = line.split('|');
    return { surah: parseInt(s, 10), ayah: parseInt(a, 10), text: cleanQuranText(rest.join('|').trim()) };
  }).filter(v => v.text.length > 0);
}

/** Try parsing numbered verse format: "1. text" or "(1) text" */
function parseNumberedVerses(text: string): ParsedVerse[] | null {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: { header: string; verses: string[] }[] = [];
  let currentHeader = '';
  let currentVerses: string[] = [];

  // Look for surah/chapter headers
  const headerRe = /^(?:surah|chapter|sura)\s*(\d+)/i;
  const verseRe = /^\s*(?:(\d+)[.):\s])\s*(.+)/;

  for (const line of lines) {
    const hm = headerRe.exec(line);
    if (hm) {
      if (currentVerses.length) sections.push({ header: currentHeader, verses: [...currentVerses] });
      currentHeader = line.trim();
      currentVerses = [];
      continue;
    }
    const vm = verseRe.exec(line);
    if (vm && vm[2].trim().length > 5) {
      currentVerses.push(line.trim());
    } else if (line.trim().length > 5) {
      currentVerses.push(line.trim());
    }
  }
  if (currentVerses.length) sections.push({ header: currentHeader, verses: currentVerses });

  if (sections.length === 0) return null;

  const verses: ParsedVerse[] = [];
  let surahNum = 1;
  for (const section of sections) {
    const hm = /(\d+)/.exec(section.header);
    if (hm) surahNum = parseInt(hm[1], 10);
    for (let i = 0; i < section.verses.length; i++) {
      const vm = verseRe.exec(section.verses[i]);
      const ayah = vm ? parseInt(vm[1], 10) : i + 1;
      const vText = vm ? vm[2].trim() : section.verses[i];
      verses.push({ surah: surahNum, ayah, text: cleanQuranText(vText) });
    }
    surahNum++;
  }

  return verses.length > 10 ? verses : null;
}

/** Group parsed verses into excerpts */
function groupVersesIntoExcerpts(
  verses: ParsedVerse[],
  targetLength: number,
): Omit<Excerpt, 'id'>[] {
  const excerpts: Omit<Excerpt, 'id'>[] = [];
  let current: ParsedVerse[] = [];
  let currentLen = 0;
  let order = 0;

  for (const verse of verses) {
    const addLen = verse.text.length + (current.length > 0 ? 1 : 0);
    if (currentLen + addLen > targetLength && current.length > 0) {
      excerpts.push(buildExcerpt(current, order++));
      current = [verse];
      currentLen = verse.text.length;
    } else {
      current.push(verse);
      currentLen += addLen;
    }
  }
  if (current.length > 0) excerpts.push(buildExcerpt(current, order));

  return excerpts;
}

function buildExcerpt(verses: ParsedVerse[], order: number): Omit<Excerpt, 'id'> {
  const text = verses.map(v => v.text).join(' ');
  const first = verses[0];
  const last = verses[verses.length - 1];
  const sameSurah = first.surah === last.surah;

  let title: string;
  if (sameSurah) {
    const sn = surahName(first.surah);
    title = verses.length === 1
      ? `${sn} (${first.surah}:${first.ayah})`
      : `${sn} (${first.surah}:${first.ayah}-${last.ayah})`;
  } else {
    title = `${surahName(first.surah)} ${first.ayah} - ${surahName(last.surah)} ${last.ayah}`;
  }

  return {
    universeId: '',
    text: cleanQuranText(text),
    title,
    difficulty: estimateDifficulty(text),
    order,
    metadata: { chapter: first.surah, source: 'quran' },
  };
}

/**
 * Parse Quran text into typing excerpts.
 * Auto-detects format (pipe-delimited, numbered, or plain text).
 */
export function parseQuranText(
  rawText: string,
  options: QuranParseOptions = {},
): Omit<Excerpt, 'id'>[] {
  const { excerptLength = 400, groupVerses = true } = options;
  const text = rawText.replace(/\r\n/g, '\n').trim();

  // Try structured formats first
  const pipeVerses = parsePipeDelimited(text);
  if (pipeVerses && pipeVerses.length > 0) {
    return groupVerses
      ? groupVersesIntoExcerpts(pipeVerses, excerptLength)
      : pipeVerses.map((v, i) => ({
          universeId: '',
          text: v.text,
          title: `${surahName(v.surah)} (${v.surah}:${v.ayah})`,
          difficulty: estimateDifficulty(v.text),
          order: i,
          metadata: { chapter: v.surah, source: 'quran' },
        }));
  }

  const numbered = parseNumberedVerses(text);
  if (numbered && numbered.length > 0) {
    return groupVerses
      ? groupVersesIntoExcerpts(numbered, excerptLength)
      : numbered.map((v, i) => ({
          universeId: '',
          text: v.text,
          title: `${surahName(v.surah)} (${v.surah}:${v.ayah})`,
          difficulty: estimateDifficulty(v.text),
          order: i,
          metadata: { chapter: v.surah, source: 'quran' },
        }));
  }

  // Fallback: treat as plain text, clean and chunk
  const cleaned = cleanQuranText(text);
  const chunks = chunkText(cleaned, { maxLength: excerptLength, minLength: 80 });
  return chunks.map((chunk, i) => ({
    universeId: '',
    text: chunk,
    title: `Part ${i + 1}: ${chunk.slice(0, 40).trim()}...`,
    difficulty: estimateDifficulty(chunk),
    order: i,
    metadata: { source: 'quran' },
  }));
}
