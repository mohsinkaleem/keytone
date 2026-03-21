/**
 * Generic parsers for universe creation.
 *
 * Supports:
 * - Line-by-line (each non-empty line = one excerpt)
 * - JSON (array of objects with a configurable text field)
 * - CSV/TSV (tabular data with a text column)
 */

import type { Excerpt } from '../../types/universe';
import { estimateDifficulty, chunkText } from './chunking';

// ── Line-by-line parser ──────────────────────────────────────

export interface LineByLineOptions {
  /** Minimum line length to include (default: 20) */
  minLength?: number;
  /** Maximum line length; longer lines are chunked (default: 800) */
  maxLength?: number;
}

export function parseLineByLine(
  text: string,
  options: LineByLineOptions = {},
): Omit<Excerpt, 'id'>[] {
  const { minLength = 20, maxLength = 800 } = options;

  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length >= minLength)
    .flatMap((line, i) => {
      if (line.length <= maxLength) {
        return [{
          universeId: '',
          text: line,
          title: `Line ${i + 1}: ${line.slice(0, 40).trim()}`,
          difficulty: estimateDifficulty(line),
          order: i,
        }];
      }
      // Chunk long lines
      return chunkText(line, { maxLength, minLength }).map((chunk, j) => ({
        universeId: '',
        text: chunk,
        title: `Line ${i + 1}.${j + 1}: ${chunk.slice(0, 40).trim()}`,
        difficulty: estimateDifficulty(chunk),
        order: i * 100 + j,
      }));
    });
}

// ── JSON parser ──────────────────────────────────────────────

export interface JsonParseOptions {
  /** Dot-separated path to the text field, e.g. "content" or "verse.text" */
  textField?: string;
  /** Optional title field path */
  titleField?: string;
  /** Maximum excerpt length before chunking */
  maxLength?: number;
}

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function parseJsonText(
  jsonString: string,
  options: JsonParseOptions = {},
): Omit<Excerpt, 'id'>[] {
  const { textField = 'text', titleField, maxLength = 600 } = options;

  const parsed = JSON.parse(jsonString);
  const items: unknown[] = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null
      ? Object.values(parsed).find(Array.isArray) as unknown[] ?? [parsed]
      : [];

  const excerpts: Omit<Excerpt, 'id'>[] = [];
  let order = 0;

  for (const item of items) {
    const text = getNestedValue(item, textField)?.trim();
    if (!text || text.length < 10) continue;

    const title = (titleField ? getNestedValue(item, titleField) : undefined)
      ?? `Item ${order + 1}: ${text.slice(0, 40).trim()}`;

    if (text.length <= maxLength) {
      excerpts.push({
        universeId: '',
        text,
        title,
        difficulty: estimateDifficulty(text),
        order: order++,
      });
    } else {
      const chunks = chunkText(text, { maxLength, minLength: 50 });
      for (let i = 0; i < chunks.length; i++) {
        excerpts.push({
          universeId: '',
          text: chunks[i],
          title: chunks.length === 1 ? title : `${title} (${i + 1})`,
          difficulty: estimateDifficulty(chunks[i]),
          order: order++,
        });
      }
    }
  }

  return excerpts;
}

// ── CSV/TSV parser ───────────────────────────────────────────

export interface CsvParseOptions {
  /** Column index (0-based) or header name for the text (default: 0) */
  textColumn?: number | string;
  /** Column index or header name for the title */
  titleColumn?: number | string;
  /** Delimiter (auto-detected by default) */
  delimiter?: string;
}

export function parseCsvText(
  csvString: string,
  options: CsvParseOptions = {},
): Omit<Excerpt, 'id'>[] {
  const { textColumn = 0, titleColumn, delimiter: explicitDelimiter } = options;

  const lines = csvString.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Auto-detect delimiter
  const firstLine = lines[0];
  const delimiter = explicitDelimiter
    ?? (firstLine.includes('\t') ? '\t' : firstLine.includes(',') ? ',' : '\t');

  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const textIdx = typeof textColumn === 'number' ? textColumn : headers.indexOf(textColumn);
  const titleIdx = titleColumn != null
    ? typeof titleColumn === 'number' ? titleColumn : headers.indexOf(titleColumn)
    : -1;

  if (textIdx < 0) return [];

  return lines.slice(1).map((line, i) => {
    const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
    const text = cols[textIdx] || '';
    const title = titleIdx >= 0 ? cols[titleIdx] : undefined;

    return {
      universeId: '',
      text,
      title: title || `Row ${i + 1}: ${text.slice(0, 40).trim()}`,
      difficulty: estimateDifficulty(text),
      order: i,
    };
  }).filter(e => e.text.length >= 10);
}
