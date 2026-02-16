/**
 * Sample texts for typing practice - 40+ diverse texts
 */

export type Category = 'quotes' | 'prose' | 'code' | 'pangrams' | 'poetry' | 'facts' | 'practice';

export interface TypingText {
  id: string;
  title: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: Category;
}

export const TYPING_TEXTS: TypingText[] = [
  // QUOTES - Easy
  {
    id: 'quote-1',
    title: 'The Journey',
    text: 'The only way to do great work is to love what you do.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-2',
    title: 'Innovation',
    text: 'Innovation distinguishes between a leader and a follower.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-3',
    title: 'Stay Curious',
    text: 'Stay hungry, stay foolish.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-4',
    title: 'Simplicity',
    text: 'Simplicity is the ultimate sophistication.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-5',
    title: 'Think Different',
    text: 'The people who are crazy enough to think they can change the world are the ones who do.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-6',
    title: 'Success',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-7',
    title: 'Dreams',
    text: 'All our dreams can come true, if we have the courage to pursue them.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-8',
    title: 'Life Philosophy',
    text: 'In the end, it is not the years in your life that count. It is the life in your years.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-9',
    title: 'Imagination',
    text: 'Logic will get you from A to B. Imagination will take you everywhere.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-10',
    title: 'Persistence',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    difficulty: 'easy',
    category: 'quotes',
  },

  // PANGRAMS
  {
    id: 'pangram-1',
    title: 'Quick Fox',
    text: 'The quick brown fox jumps over the lazy dog.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    id: 'pangram-2',
    title: 'Pack My Box',
    text: 'Pack my box with five dozen liquor jugs.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    id: 'pangram-3',
    title: 'Sphinx',
    text: 'Sphinx of black quartz, judge my vow.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    id: 'pangram-4',
    title: 'Wizard',
    text: 'How vexingly quick daft zebras jump!',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    id: 'pangram-5',
    title: 'Boxing Wizards',
    text: 'The five boxing wizards jump quickly.',
    difficulty: 'easy',
    category: 'pangrams',
  },

  // CODE - Medium to Hard
  {
    id: 'code-1',
    title: 'Hello World',
    text: 'function hello(name) { return "Hello, " + name; }',
    difficulty: 'medium',
    category: 'code',
  },
  {
    id: 'code-2',
    title: 'Array Map',
    text: 'const doubled = numbers.map(n => n * 2);',
    difficulty: 'medium',
    category: 'code',
  },
  {
    id: 'code-3',
    title: 'Arrow Function',
    text: 'const add = (a, b) => a + b;',
    difficulty: 'easy',
    category: 'code',
  },
  {
    id: 'code-4',
    title: 'Async Await',
    text: 'async function fetchData() { const res = await fetch(url); return res.json(); }',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-5',
    title: 'Destructure',
    text: 'const { name, age, email } = user;',
    difficulty: 'medium',
    category: 'code',
  },
  {
    id: 'code-6',
    title: 'Ternary',
    text: 'const status = isActive ? "online" : "offline";',
    difficulty: 'medium',
    category: 'code',
  },
  {
    id: 'code-7',
    title: 'Template Literal',
    text: 'const greeting = `Hello, ${name}! You are ${age} years old.`;',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-8',
    title: 'Filter & Find',
    text: 'const adults = users.filter(u => u.age >= 18).find(u => u.active);',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-9',
    title: 'Import',
    text: 'import { useState, useEffect } from "react";',
    difficulty: 'medium',
    category: 'code',
  },
  {
    id: 'code-10',
    title: 'Try Catch',
    text: 'try { await saveData(); } catch (err) { console.error(err); }',
    difficulty: 'hard',
    category: 'code',
  },

  // PROSE
  {
    id: 'prose-1',
    title: 'Morning',
    text: 'Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-2',
    title: 'The Road',
    text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-3',
    title: 'Time',
    text: 'Time is a created thing. To say you do not have time is like saying you do not want to.',
    difficulty: 'easy',
    category: 'prose',
  },
  {
    id: 'prose-4',
    title: 'Learning',
    text: 'The more that you read, the more things you will know. The more that you learn, the more places you will go.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-5',
    title: 'Adventure',
    text: 'Life is either a daring adventure or nothing at all. Security is mostly a superstition.',
    difficulty: 'medium',
    category: 'prose',
  },

  // POETRY
  {
    id: 'poetry-1',
    title: 'Hope',
    text: 'Hope is the thing with feathers that perches in the soul and sings the tune without the words and never stops at all.',
    difficulty: 'medium',
    category: 'poetry',
  },
  {
    id: 'poetry-2',
    title: 'Dreams',
    text: 'Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.',
    difficulty: 'medium',
    category: 'poetry',
  },
  {
    id: 'poetry-3',
    title: 'Road Not Taken',
    text: 'I shall be telling this with a sigh, somewhere ages and ages hence.',
    difficulty: 'easy',
    category: 'poetry',
  },
  {
    id: 'poetry-4',
    title: 'Invictus',
    text: 'I am the master of my fate, I am the captain of my soul.',
    difficulty: 'easy',
    category: 'poetry',
  },
  {
    id: 'poetry-5',
    title: 'Still I Rise',
    text: 'You may shoot me with your words, you may cut me with your eyes, you may kill me with your hatefulness, but still, like air, I rise.',
    difficulty: 'hard',
    category: 'poetry',
  },

  // FACTS
  {
    id: 'facts-1',
    title: 'Honey',
    text: 'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.',
    difficulty: 'medium',
    category: 'facts',
  },
  {
    id: 'facts-2',
    title: 'Octopus',
    text: 'An octopus has three hearts and blue blood.',
    difficulty: 'easy',
    category: 'facts',
  },
  {
    id: 'facts-3',
    title: 'Bananas',
    text: 'Bananas are berries, but strawberries are not.',
    difficulty: 'easy',
    category: 'facts',
  },
  {
    id: 'facts-4',
    title: 'Light Speed',
    text: 'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
    difficulty: 'easy',
    category: 'facts',
  },
  {
    id: 'facts-5',
    title: 'Brain',
    text: 'The human brain uses about 20 percent of the body total energy, despite being only 2 percent of its weight.',
    difficulty: 'medium',
    category: 'facts',
  },
];

export const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'prose', label: 'Prose' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'code', label: 'Code' },
  { value: 'pangrams', label: 'Pangrams' },
  { value: 'facts', label: 'Facts' },
];

/**
 * Get texts by difficulty
 */
export function getTextsByDifficulty(difficulty: TypingText['difficulty']): TypingText[] {
  return TYPING_TEXTS.filter((t) => t.difficulty === difficulty);
}

/**
 * Get texts by category
 */
export function getTextsByCategory(category: Category | 'all'): TypingText[] {
  if (category === 'all') return TYPING_TEXTS;
  return TYPING_TEXTS.filter((t) => t.category === category);
}

/**
 * Get a random text, optionally filtered and excluding a specific text
 */
export function getRandomText(
  category?: Category | 'all',
  difficulty?: TypingText['difficulty'],
  excludeId?: string
): TypingText {
  let texts = category && category !== 'all' ? getTextsByCategory(category) : TYPING_TEXTS;
  if (difficulty) {
    texts = texts.filter((t) => t.difficulty === difficulty);
  }
  if (excludeId) {
    texts = texts.filter((t) => t.id !== excludeId);
  }
  if (texts.length === 0) texts = TYPING_TEXTS;
  return texts[Math.floor(Math.random() * texts.length)];
}
