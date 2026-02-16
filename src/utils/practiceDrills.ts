import type { TypingText } from './typingTexts';

export type PracticeMode = 'numbers' | 'symbols' | 'mixed';

type DrillDifficulty = TypingText['difficulty'];
type DrillDifficultyFilter = DrillDifficulty | 'all';

export const PRACTICE_MODES: Array<{
  value: PracticeMode;
  label: string;
  description: string;
}> = [
  { value: 'numbers', label: 'Numbers', description: 'phone numbers, decimals, and fast digit runs' },
  { value: 'symbols', label: 'Symbols', description: 'punctuation accuracy and shifted characters' },
  { value: 'mixed', label: 'Mixed', description: 'numbers plus symbols in real-world patterns' },
];

const DIFFICULTIES: DrillDifficulty[] = ['easy', 'medium', 'hard'];

const DRILL_LIBRARY: Record<PracticeMode, Record<DrillDifficulty, string[]>> = {
  numbers: {
    easy: [
      '12345 67890 24680 13579',
      '2026 1999 3141 2718 1618',
      '42 84 126 168 210 252',
      '11 22 33 44 55 66 77 88 99',
      '9876 5432 1098 7654 3210',
      '444 555 666 777 888 999',
    ],
    medium: [
      '98.6 72.4 105.9 63.8 88.1',
      '4,500 12,750 89,300 1,240',
      '07/04/2026 11/19/1998 03/15/2001',
      '1.25x 2.5x 0.75x 3.0x 4.25x',
      '1200-450-982 344-778-100 900-321-654',
      '$19.99 $250.00 $3,499.50 $0.99',
    ],
    hard: [
      'INV-2026-09-4457 / REF-88-3310 / ID-70024',
      '0.0045 99.875 12.0001 1000.250 6.022e23',
      'A1: 45982 B2: 77614 C3: 99107 D4: 23056',
      '11:59:58 00:00:01 23:45:09 17:32:44',
      '3,456,789.01 98,765.43 1,204.6 87,000.05',
      'ZIP 10001-0001 / 30309-4420 / 94105-1321',
    ],
  },
  symbols: {
    easy: [
      '! @ # $ % ^ & * ( )',
      '- _ = + [ ] { }',
      '; : , . < > / ?',
      '` ~ \\ | " \'',
      '() [] {} <>',
      '&& || == != >= <=',
    ],
    medium: [
      '++ -- += -= *= /= %=',
      ':: => -> <- ?? !!',
      '({[]}) [<{}>] {(()[])}',
      '@home #focus $value %rate ^power',
      'path/to/file && backup/to/archive',
      '"quoted text" \'single quote\' `(template)`',
    ],
    hard: [
      'if (a >= b && c != d) { total += (x * y) - z; }',
      'const map = { key_1: [1, 2], key_2: [3, 4] };',
      'SELECT * FROM logs WHERE level != "info" && count >= 50;',
      '[{(alpha+beta)*gamma}/delta] >= epsilon ? true : false;',
      'user.name?.trim()?.toLowerCase() ?? "guest_user";',
      'regex: ^[A-Za-z0-9_]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    ],
  },
  mixed: {
    easy: [
      'A1! B2@ C3# D4$ E5%',
      'Room-101 Gate#7 Seat-24B',
      'Q2 2026: +12% / Q3 2026: +9%',
      'pin: 4821! code: 77@ key: 9#',
      'v1.2.3-beta+4 build-05',
      'cart: 3x item@9.99 = $29.97',
    ],
    medium: [
      'Order#5542 total=$1,249.50 tax=8.25%',
      'Try pass: R2D2!C3PO? then M4X#2026',
      'api/v2/users?page=3&limit=25&sort=-score',
      'Batch_07 -> 145 units @ 98.5% success',
      'time 08:45:22 | cpu 72% | mem 6.4GB',
      'route A-17/B-09 -> ETA 14:35 (+12m)',
    ],
    hard: [
      'ALERT[2]: temp=104.7F, fan#3=OFF, retry_in=00:00:15',
      'payload={"id":9921,"ok":true,"ratio":0.875,"tag":"X7!"}',
      'txn-7781 => subtotal:$4,905.72 | discount:-12.5% | net:$4,292.50',
      'ssh user@10.12.44.7 -p 2202 && tail -n 50 /var/log/app.log',
      'matrix[3][2]=a*4.5-b/2.0; checksum=0x9AF3;',
      'key: Z9!mP2@qL7# / backup: K4$wN8%rT1^',
    ],
  },
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDistinct<T>(items: T[], count: number): T[] {
  if (count >= items.length) return [...items];

  const pool = [...items];
  const selected: T[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [item] = pool.splice(index, 1);
    if (item !== undefined) selected.push(item);
  }

  return selected;
}

export function getPracticeDrill(
  mode: PracticeMode,
  difficulty: DrillDifficultyFilter = 'all'
): TypingText {
  const resolvedDifficulty = difficulty === 'all' ? pickRandom(DIFFICULTIES) : difficulty;
  const snippets = DRILL_LIBRARY[mode][resolvedDifficulty];
  const segmentCount = resolvedDifficulty === 'hard' ? 4 : 3;
  const selected = pickDistinct(snippets, segmentCount);
  const fallback = selected.length > 0 ? selected : [pickRandom(snippets)];
  const text = fallback.join('   ');
  const label = PRACTICE_MODES.find((item) => item.value === mode)?.label ?? 'Precision';

  return {
    id: `practice-${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${label} Drill`,
    text,
    difficulty: resolvedDifficulty,
    category: 'practice',
  };
}
