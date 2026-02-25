import type { TypingText } from './typingTexts';

export type PracticeMode = 'numbers' | 'symbols' | 'mixed' | 'numpad' | 'brackets' | 'passwords';

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
  { value: 'numpad', label: 'Numpad', description: 'calculator-style number flow and operators' },
  { value: 'brackets', label: 'Brackets', description: 'pairing and nesting with punctuation control' },
  { value: 'passwords', label: 'Passwords', description: 'high-entropy number and symbol combos' },
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
      '101 202 303 404 505 606',
      '12 34 56 78 90 12 34 56',
      '271 314 159 265 358 979',
      '555 123 4567 212 987 6543',
    ],
    medium: [
      '98.6 72.4 105.9 63.8 88.1',
      '4,500 12,750 89,300 1,240',
      '07/04/2026 11/19/1998 03/15/2001',
      '1.25x 2.5x 0.75x 3.0x 4.25x',
      '1200-450-982 344-778-100 900-321-654',
      '$19.99 $250.00 $3,499.50 $0.99',
      '6:45 9:30 11:05 14:20 18:55',
      '45% 12.5% 99.1% 73.3% 64%',
      '1024 2048 4096 8192 16384',
      'A12 B34 C56 D78 E90',
    ],
    hard: [
      'INV-2026-09-4457 / REF-88-3310 / ID-70024',
      '0.0045 99.875 12.0001 1000.250 6.022e23',
      'A1: 45982 B2: 77614 C3: 99107 D4: 23056',
      '11:59:58 00:00:01 23:45:09 17:32:44',
      '3,456,789.01 98,765.43 1,204.6 87,000.05',
      'ZIP 10001-0001 / 30309-4420 / 94105-1321',
      'RANGE[12-48] STEP=3 COUNT=145',
      'SN-44A-9912-7B / REV-03 / LOT-7821',
      '0.333333 1.414213 2.718281 3.141592',
      'T+00:00:05 T+00:01:20 T+01:15:45',
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
      '--- ___ === +++',
      '<- -> <> << >>',
      '@@ ## $$ %% ^^',
      '?! ?! ?! !! ??',
    ],
    medium: [
      '++ -- += -= *= /= %=',
      ':: => -> <- ?? !!',
      '({[]}) [<{}>] {(()[])}',
      '@home #focus $value %rate ^power',
      'path/to/file && backup/to/archive',
      '"quoted text" \'single quote\' `(template)`',
      'arr[i] != null && map[key] !== undefined',
      '{id:42, ok:true, tags:["a","b"]}',
      'alpha_beta::gamma -> delta && omega',
      'sum += price * qty - discount;',
    ],
    hard: [
      'if (a >= b && c != d) { total += (x * y) - z; }',
      'const map = { key_1: [1, 2], key_2: [3, 4] };',
      'SELECT * FROM logs WHERE level != "info" && count >= 50;',
      '[{(alpha+beta)*gamma}/delta] >= epsilon ? true : false;',
      'user.name?.trim()?.toLowerCase() ?? "guest_user";',
      'regex: ^[A-Za-z0-9_]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
      '<main>{list.map((x,i)=> <li key={i}>{x}</li>)}</main>',
      '(({a:[1,2],b:{c:3}}).b?.c ?? 0) !== 4',
      'query=a%2Bb%26c%3D1&redirect=%2Fhome%3Ftab%3D2',
      'fn<T extends U>(arg:T):T|never { return arg!; }',
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
      'H2O+NaCl -> test#1',
      'lane-7 spot-42 key@3',
      'tag:Q4-19! ref:M2-6@',
      'set A=3 B=5 C=8 #ok',
    ],
    medium: [
      'Order#5542 total=$1,249.50 tax=8.25%',
      'Try pass: R2D2!C3PO? then M4X#2026',
      'api/v2/users?page=3&limit=25&sort=-score',
      'Batch_07 -> 145 units @ 98.5% success',
      'time 08:45:22 | cpu 72% | mem 6.4GB',
      'route A-17/B-09 -> ETA 14:35 (+12m)',
      'log#88 lvl=warn code=E42 retry=3/5',
      'pkg@4.2.1 sha=9f2a7c! check=ok',
      'zone-3 gate#11 row=F seat=19A',
      'COST: $849.95 / qty=12 / net=10199.40',
    ],
    hard: [
      'ALERT[2]: temp=104.7F, fan#3=OFF, retry_in=00:00:15',
      'payload={"id":9921,"ok":true,"ratio":0.875,"tag":"X7!"}',
      'txn-7781 => subtotal:$4,905.72 | discount:-12.5% | net:$4,292.50',
      'ssh user@10.12.44.7 -p 2202 && tail -n 50 /var/log/app.log',
      'matrix[3][2]=a*4.5-b/2.0; checksum=0x9AF3;',
      'key: Z9!mP2@qL7# / backup: K4$wN8%rT1^',
      'env=prod region=us-east-1 node#08 load=87.4%',
      'POST /v1/payments id=tx_77A9 amount=109.35 status=202',
      'rule#12: if score>=92 && miss<=2 => PASS!',
      'sync@02:10 run=17 dur=00:12:49 errs=0',
    ],
  },
  numpad: {
    easy: [
      '789 456 123 0',
      '100 + 200 - 50',
      '12 * 3 = 36',
      '77 / 7 = 11',
      '90 - 45 + 18',
      '333 222 111 000',
      '7 8 9 4 5 6 1 2 3 0',
      '15 + 25 + 35 + 45',
      '120 / 4 / 3',
      '48 + 52 - 20',
    ],
    medium: [
      '125 * 8 - 450 + 39',
      '900 / 12 + 17 * 3',
      '64 * 64 = 4096',
      '7.5 + 8.25 - 3.1',
      'round(98.75) -> 99',
      '2500 - 1250 + 375',
      '1,200 + 980 - 340 + 75',
      '84 / 6 + 99 / 9',
      '15*12-8*7+33',
      '3200 / 16 / 5',
    ],
    hard: [
      '((1450-275)*3+90)/5',
      '12.75*48-99.5+3.1416',
      'qty=48 rate=19.95 total=957.60',
      '15432-8875+662*3-95',
      'PV=12000 r=0.067 n=36',
      '4.5*8.25+7.75*6.4-18.2',
      'cache[1024]=slot[88]*factor[7]',
      'SUM: 997+886+775+664+553',
      'A=144 B=89 C=55 => A-B+C',
      'calc#44: 9000/(15*4)+73',
    ],
  },
  brackets: {
    easy: [
      '( ) [ ] { } < >',
      '() () [] [] {} {}',
      '{[()]} {[()]}',
      '(a) [b] {c} <d>',
      '({}) [<>] {[]}',
      '(( )) [[ ]] {{ }}',
      '(1) (2) (3) [4] [5]',
      '{a:b} {c:d} [x,y]',
      '<a><b></b></a>',
      '(left) (right) [mid]',
    ],
    medium: [
      'fn(a, b) => ({ sum: a+b })',
      '[1,2,3].map((x)=>x*2)',
      'if (ok) { list.push(item); }',
      'obj = { a:[1,2], b:{ c:3 } };',
      '((a+b) * (c-d)) / e',
      '<div class="x">[item]</div>',
      'while (i < n) { i += step; }',
      'pair = [left, right, center]',
      'route(/api/v1/{id}/items)',
      'arr[(i+1)%len] = next;',
    ],
    hard: [
      '({a:[1,{b:(c+d)}],x:y})',
      '[{(alpha+beta)*gamma}/delta]',
      'fn({id,meta:{tags:[a,b]}}){return id;}',
      '<main>{rows.map((r)=> <tr key={r.id} />)}</main>',
      'query=(a[b{c(d)e}f]g)',
      'if ((x&&y)||(!z&&q)) { run(); }',
      '{path:"/a/[b]/{c}",ok:(n>=1)}',
      'stack.push({k:[1,2,{v:3}]});',
      '((({[]}))) [[{{()}}]]',
      'JSON.parse("{\\"a\\":[1,2,{\\"b\\":3}]}")',
    ],
  },
  passwords: {
    easy: [
      'A1b2C3! d4E5f6@',
      'Sun9#Moon8$',
      'Key7!Door3@',
      'Mint4%Lime2^',
      'Go1!Run2@Jump3#',
      'safe-Box7! pin=42@',
      'Blue9$Sky8%Day7!',
      'm0vE!nOw@1',
      'T1mE#2G0!',
      'Rain4@Wind5#',
    ],
    medium: [
      'R2d!M7q@P4z#',
      'Alpha9$Beta7!Gamma5@',
      'uP7#dOwN3@LefT2!',
      'Vault_88!Key@2026',
      'N0de#7-L1nk@9',
      'Core$44-Edge!12',
      'Spin7@Turn5#Slide3!',
      'Dash9!Flow8@Grip6#',
      'T0ken#A7!B6@C5$',
      'MiX3d!Case9@Tag7#',
    ],
    hard: [
      'Q7!mR2@vL9#pT4$kN6^',
      'X3@fP8!sD1#qW7$zR5%',
      'Acc3ss!2026#B4ckup@17',
      'Key#A9!Lock$B8@Chain%C7',
      'S3curE!P4ss#T0k3n@X9',
      'B!7rD@2sK#9mP$4qL^1',
      'id=U7#kP2!mR9@xT4$z',
      'R0tatE!9#Sh1ft@7$Flip^3',
      'Qw7!Er2@Ty9#Ui4$Op6%',
      'Hash#A4!Tag@B7$Key%C9',
    ],
  },
};

const LETTERS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LETTERS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomChars(pool: string, length: number): string {
  let value = '';
  for (let i = 0; i < length; i++) {
    value += pool[Math.floor(Math.random() * pool.length)];
  }
  return value;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSymbolBurst(length: number): string {
  return randomChars(SYMBOLS, length).split('').join(' ');
}

function dynamicSnippet(mode: PracticeMode, difficulty: DrillDifficulty): string {
  switch (mode) {
    case 'numbers':
      return `${randomChars(DIGITS, 3)}-${randomChars(DIGITS, 3)}-${randomChars(DIGITS, 4)}`;
    case 'symbols':
      return randomSymbolBurst(difficulty === 'hard' ? 14 : difficulty === 'medium' ? 10 : 8);
    case 'mixed':
      return `${randomChars(LETTERS_UPPER, 2)}-${randomChars(DIGITS, 3)}${pickRandom(SYMBOLS.split(''))}${randomChars(LETTERS_LOWER, 2)}`;
    case 'numpad': {
      const a = randomInt(12, 999);
      const b = randomInt(5, 240);
      const ops = ['+', '-', '*', '/'];
      return `${a} ${pickRandom(ops)} ${b} = ?`;
    }
    case 'brackets': {
      const token = `${randomChars(LETTERS_LOWER, 2)}${randomInt(1, 99)}`;
      return `({${token}})[${token}]<${token}>`;
    }
    case 'passwords': {
      const chunk = `${randomChars(LETTERS_UPPER, 1)}${randomChars(LETTERS_LOWER, 2)}${randomChars(DIGITS, 2)}${pickRandom(SYMBOLS.split(''))}`;
      return `${chunk}${chunk}${randomChars(LETTERS_UPPER, 1)}${randomChars(DIGITS, 1)}`;
    }
    default:
      return randomChars(DIGITS, 8);
  }
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
  const generatedCount = resolvedDifficulty === 'hard' ? 2 : 1;
  const generatedSnippets = Array.from({ length: generatedCount }, () =>
    dynamicSnippet(mode, resolvedDifficulty)
  );
  const snippets = [...DRILL_LIBRARY[mode][resolvedDifficulty], ...generatedSnippets];
  const baseSegmentCount = resolvedDifficulty === 'hard' ? 5 : resolvedDifficulty === 'medium' ? 4 : 3;
  const segmentCount = mode === 'passwords' ? baseSegmentCount + 1 : baseSegmentCount;
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
