/**
 * Sample texts for typing practice - 40+ diverse texts
 */

export type Category = 'quotes' | 'prose' | 'code' | 'poetry' | 'facts' | 'practice' | 'literature' | 'science';

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
    title: 'Innovation',
    text: 'Innovation distinguishes between a leader and a follower.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    id: 'quote-2',
    title: 'Life Philosophy',
    text: 'In the end, it is not the years in your life that count. It is the life in your years.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-3',
    title: 'Imagination',
    text: 'Logic will get you from A to B. Imagination will take you everywhere.',
    difficulty: 'easy',
    category: 'quotes',
  },

  // CODE - Medium to Hard

  {
    id: 'code-1',
    title: 'Async Await',
    text: 'async function fetchData() { const res = await fetch(url); return res.json(); }',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-2',
    title: 'Template Literal',
    text: 'const greeting = `Hello, ${name}! You are ${age} years old.`;',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-3',
    title: 'Filter & Find',
    text: 'const adults = users.filter(u => u.age >= 18).find(u => u.active);',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-4',
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
    title: 'Brain',
    text: 'The human brain uses about 20 percent of the body total energy, despite being only 2 percent of its weight.',
    difficulty: 'medium',
    category: 'facts',
  },

  // LONGER QUOTES - medium/hard
  {
    id: 'quote-long-1',
    title: 'Churchill on Success',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts. The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty. Never give in, never give in, never, never, never.',
    difficulty: 'hard',
    category: 'quotes',
  },
  {
    id: 'quote-long-2',
    title: 'Mandela on Education',
    text: 'Education is the most powerful weapon which you can use to change the world. It always seems impossible until it is done. Do not judge me by my successes; judge me by how many times I fell down and got back up again.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-long-3',
    title: 'Einstein on Imagination',
    text: 'Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world. The measure of intelligence is the ability to change. A person who never made a mistake never tried anything new.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    id: 'quote-long-4',
    title: 'Thoreau on Living',
    text: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.',
    difficulty: 'hard',
    category: 'quotes',
  },
  {
    id: 'quote-long-5',
    title: 'Aristotle on Excellence',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit. The quality of a decision is like the well-timed swoop of a falcon which enables it to strike and destroy its victim. Pleasure in the job puts perfection in the work.',
    difficulty: 'hard',
    category: 'quotes',
  },

  // LONGER PROSE - medium/hard
  {
    id: 'prose-long-1',
    title: 'The Power of Habit',
    text: 'Habits are the invisible architecture of daily life. We repeat about forty percent of our behavior almost daily, and this automaticity allows our minds to conserve energy for higher-level thinking. The key to changing any habit is to understand its structure: the cue that triggers it, the routine that follows, and the reward that reinforces it.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    id: 'prose-long-2',
    title: 'Deep Work',
    text: 'The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy. As a consequence, the few who cultivate this skill, and then make it the core of their working life, will thrive. To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    id: 'prose-long-3',
    title: 'The Nature of Creativity',
    text: 'Creativity is not a gift bestowed upon a lucky few. It is a skill developed through practice, curiosity, and the willingness to fail repeatedly. The most creative minds are not those who never encounter problems but those who see every problem as an invitation to find a solution that has never existed before. Innovation lives at the intersection of different disciplines and unexpected connections.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    id: 'prose-long-4',
    title: 'On Resilience',
    text: 'Resilience is not about bouncing back to where you were before a setback. It is about finding the courage to move forward in a new direction. Every adversity carries with it the seed of an equal or greater benefit. The human spirit, when tested, often discovers reserves of strength it never knew it possessed. We grow most not in moments of comfort but in the fire of our greatest challenges.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-long-5',
    title: 'The Digital Age',
    text: 'We live in an age where information travels at the speed of light and knowledge doubles every few years. Yet wisdom seems to grow far more slowly. The challenge of our time is not accessing information but developing the judgment to distinguish what matters from what merely demands our attention. Learning to focus in an age of distraction may be the defining skill of the twenty-first century.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    id: 'prose-long-6',
    title: 'Morning Rituals',
    text: "How you begin each morning sets the tone for the rest of your day. Many of history's most productive people were fastidious about their morning routines, guarding those early hours as sacred time for reflection, exercise, and focused work. Before the world makes its demands, you have the opportunity to set your intentions and connect with what matters most to you.",
    difficulty: 'medium',
    category: 'prose',
  },

  // LITERATURE excerpts
  {
    id: 'lit-1',
    title: 'Dickens: A Tale of Two Cities',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.',
    difficulty: 'hard',
    category: 'literature',
  },
  {
    id: 'lit-2',
    title: 'Austen: Pride and Prejudice',
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families that he is considered as the rightful property of some one or other of their daughters.',
    difficulty: 'hard',
    category: 'literature',
  },
  {
    id: 'lit-3',
    title: 'Orwell: 1984',
    text: 'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.',
    difficulty: 'hard',
    category: 'literature',
  },
  {
    id: 'lit-4',
    title: 'Hemingway: The Old Man and the Sea',
    text: 'He was an old man who fished alone in a skiff in the Gulf Stream and he had gone eighty-four days now without taking a fish. In the first forty days a boy had been with him. But after forty days without a fish the boy\'s parents had told him that the old man was now definitely and finally salao, which is the worst form of unlucky, and the boy had gone at their orders in another boat.',
    difficulty: 'hard',
    category: 'literature',
  },
  {
    id: 'lit-5',
    title: 'Fitzgerald: The Great Gatsby',
    text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had. He didn't say any more, but we've always been unusually communicative in a reserved way.",
    difficulty: 'hard',
    category: 'literature',
  },
  {
    id: 'lit-6',
    title: 'Tolstoy: Anna Karenina',
    text: 'All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys household. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.',
    difficulty: 'hard',
    category: 'literature',
  },

  // SCIENCE texts - medium/hard
  {
    id: 'science-1',
    title: 'Black Holes',
    text: 'A black hole is a region of spacetime where gravity is so strong that nothing, not even light or other electromagnetic waves, has enough speed to escape it. The boundary of no escape is called the event horizon. Although it has an enormous effect on the fate and circumstances of an object crossing it, it has no locally detectable features according to general relativity.',
    difficulty: 'hard',
    category: 'science',
  },
  {
    id: 'science-2',
    title: 'DNA and Genetics',
    text: 'Deoxyribonucleic acid, commonly known as DNA, carries the genetic instructions used in the growth, development, functioning, and reproduction of all known living organisms and many viruses. DNA is a double helix formed by base pairs attached to a sugar-phosphate backbone. The four bases are adenine, thymine, cytosine, and guanine.',
    difficulty: 'hard',
    category: 'science',
  },
  {
    id: 'science-3',
    title: 'Quantum Mechanics',
    text: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It departs from classical mechanics by describing the behavior of particles using probabilities rather than certainties, introducing the concept that particles can exist in multiple states simultaneously until observed.',
    difficulty: 'hard',
    category: 'science',
  },
  {
    id: 'science-4',
    title: 'Climate Science',
    text: "Earth's climate has changed throughout history. Just in the last eight hundred thousand years, there have been eight cycles of ice ages and warmer periods, with the end of the last ice age about eleven thousand seven hundred years ago marking the beginning of the modern climate era and the rise of human civilization. Most of these changes are attributed to small variations in Earth's orbit.",
    difficulty: 'medium',
    category: 'science',
  },
  {
    id: 'science-5',
    title: 'The Internet',
    text: 'The Internet is a global system of interconnected computer networks that uses the Internet protocol suite to communicate between networks and devices. It is a network of networks that consists of private, public, academic, business, and government networks of local to global scope, linked by a broad array of electronic, wireless, and optical networking technologies.',
    difficulty: 'medium',
    category: 'science',
  },

  // MORE FACTS - longer
  {
    id: 'facts-long-1',
    title: 'The Great Wall',
    text: 'The Great Wall of China is not a single continuous wall but a series of walls and fortifications built over many centuries by different dynasties. The most well-known sections were built by the Ming dynasty between the fourteenth and seventeenth centuries. Its total length, including all branches and sections, stretches more than thirteen thousand miles, making it one of the greatest architectural feats in history.',
    difficulty: 'hard',
    category: 'facts',
  },
  {
    id: 'facts-long-2',
    title: 'Deep Sea Depths',
    text: 'The deepest point in the ocean is Challenger Deep in the Mariana Trench, reaching a depth of approximately thirty-six thousand feet below sea level. The pressure at that depth is over one thousand times that at the surface. Despite these extreme conditions, scientists have discovered diverse communities of organisms living in the deep sea, challenging our understanding of where life can exist.',
    difficulty: 'hard',
    category: 'facts',
  },
  {
    id: 'facts-long-3',
    title: 'Language and Mind',
    text: 'There are approximately seven thousand languages spoken in the world today, yet more than half of the world population speaks one of just twenty-three languages. Languages shape the way we think and perceive reality. Some languages have no words for certain colors, and speakers of those languages perceive those colors differently in experiments. Every language that disappears takes with it a unique way of seeing the world.',
    difficulty: 'medium',
    category: 'facts',
  },

  // LONGER POETRY
  {
    id: 'poetry-long-1',
    title: 'Frost: The Road Not Taken',
    text: 'Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth. Then took the other, as just as fair, and having perhaps the better claim, because it was grassy and wanted wear; though as for that the passing there had worn them really about the same.',
    difficulty: 'hard',
    category: 'poetry',
  },
  {
    id: 'poetry-long-2',
    title: 'Dickinson: Because I Could Not Stop',
    text: 'Because I could not stop for Death, he kindly stopped for me; the Carriage held but just Ourselves and Immortality. We slowly drove, he knew no haste, and I had put away my labor and my leisure too, for his Civility. We passed the School, where Children strove at Recess in the Ring; we passed the Fields of Gazing Grain, we passed the Setting Sun.',
    difficulty: 'hard',
    category: 'poetry',
  },
  {
    id: 'poetry-long-3',
    title: 'Yeats: The Second Coming',
    text: 'Turning and turning in the widening gyre, the falcon cannot hear the falconer; things fall apart; the centre cannot hold; mere anarchy is loosed upon the world. The blood-dimmed tide is loosed, and everywhere the ceremony of innocence is drowned; the best lack all conviction, while the worst are full of passionate intensity.',
    difficulty: 'hard',
    category: 'poetry',
  },

  // MEDIUM difficulty prose - accessible length
  {
    id: 'prose-med-1',
    title: 'Mindfulness',
    text: 'Mindfulness is the practice of paying attention to the present moment without judgment. When we are mindful, we observe our thoughts and feelings from a distance, without judging them as good or bad. Instead of letting life pass you by, mindfulness means living in the moment and awakening to your current experience rather than dwelling on the past or anticipating the future.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-med-2',
    title: 'The Value of Sleep',
    text: 'Sleep is not merely a passive state of unconsciousness. During sleep, the brain consolidates memories, repairs cellular damage, and clears out metabolic waste products. Chronic sleep deprivation has been linked to a host of health problems, including impaired cognition, weakened immunity, and increased risk of cardiovascular disease. Most adults need between seven and nine hours of quality sleep per night.',
    difficulty: 'medium',
    category: 'prose',
  },
  {
    id: 'prose-med-3',
    title: 'Urban Gardening',
    text: 'Urban gardening is a growing movement that brings the benefits of growing food into city environments. Whether it is a few pots on a balcony, a window box of herbs, or a plot in a community garden, growing your own food connects you to natural cycles and provides fresh produce. Gardens in cities also help reduce the urban heat island effect and provide habitat for pollinators.',
    difficulty: 'medium',
    category: 'prose',
  },

  // HARD CODE samples - longer
  {
    id: 'code-long-1',
    title: 'TypeScript Interface',
    text: 'interface User { id: number; name: string; email: string; createdAt: Date; } function getUser(id: number): Promise<User> { return fetch(`/api/users/${id}`).then(res => res.json()); }',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-long-2',
    title: 'React useState Hook',
    text: 'const [count, setCount] = useState<number>(0); const increment = useCallback(() => setCount(prev => prev + 1), []); const decrement = useCallback(() => setCount(prev => Math.max(0, prev - 1)), []);',
    difficulty: 'hard',
    category: 'code',
  },
  {
    id: 'code-long-3',
    title: 'Array Reduce',
    text: 'const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0); const groupedByCategory = items.reduce((groups, item) => ({ ...groups, [item.category]: [...(groups[item.category] || []), item] }), {});',
    difficulty: 'hard',
    category: 'code',
  },
];

export const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'prose', label: 'Prose' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'literature', label: 'Literature' },
  { value: 'science', label: 'Science' },
  { value: 'code', label: 'Code' },
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
