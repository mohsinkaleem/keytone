/**
 * Default universes for Keytone
 */

import type { Universe, Excerpt } from '../types/universe';
import { BUILT_IN_UNIVERSE_IDS } from '../types/universe';

// Default General Universe
export const GENERAL_UNIVERSE: Universe = {
  id: BUILT_IN_UNIVERSE_IDS.GENERAL,
  name: 'General',
  type: 'standard',
  description: 'Quotes, prose, poetry, facts, and pangrams for everyday practice',
  icon: '📚',
  isBuiltIn: true,
};

// Default Coding Universe
export const CODING_UNIVERSE: Universe = {
  id: BUILT_IN_UNIVERSE_IDS.CODING,
  name: 'Coding',
  type: 'coding',
  description: 'Code snippets in JavaScript, TypeScript, Python, and more',
  icon: '💻',
  isBuiltIn: true,
};

// All built-in universes
export const BUILT_IN_UNIVERSES: Universe[] = [
  GENERAL_UNIVERSE,
  CODING_UNIVERSE,
];

// Coding excerpts with proper code formatting
export const CODING_EXCERPTS: Excerpt[] = [
  // JavaScript/TypeScript fundamentals
  {
    id: 'code-js-1',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'React useState Hook',
    text: `const [count, setCount] = useState(0);`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-2',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'React useEffect',
    text: `useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-3',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Arrow Function',
    text: `const add = (a: number, b: number) => a + b;`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-4',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Array Methods',
    text: `const evens = numbers.filter(n => n % 2 === 0).map(n => n * 2);`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-5',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Async/Await',
    text: `async function fetchUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-6',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Object Destructuring',
    text: `const { name, age, email = 'N/A' } = user;`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-7',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Array Reduce',
    text: `const sum = numbers.reduce((acc, n) => acc + n, 0);`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-8',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Template Literals',
    text: `const greeting = \`Hello, \${name}! Welcome to \${app}.\`;`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-9',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Spread Operator',
    text: `const merged = { ...defaults, ...config, timestamp: Date.now() };`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-10',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Optional Chaining',
    text: `const city = user?.address?.city ?? 'Unknown';`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  // More complex snippets
  {
    id: 'code-js-11',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Custom Hook',
    text: `function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
    difficulty: 'hard',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-12',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Promise.all',
    text: `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-13',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Try/Catch',
    text: `try {
  const data = await fetchData();
  setResult(data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}`,
    difficulty: 'medium',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-14',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Interface Definition',
    text: `interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}`,
    difficulty: 'easy',
    metadata: { language: 'typescript' },
  },
  {
    id: 'code-js-15',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'React Component',
    text: `export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {children}
    </button>
  );
}`,
    difficulty: 'hard',
    metadata: { language: 'tsx' },
  },
  // Python snippets
  {
    id: 'code-py-1',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Python List Comprehension',
    text: `squares = [x ** 2 for x in range(10) if x % 2 == 0]`,
    difficulty: 'medium',
    metadata: { language: 'python' },
  },
  {
    id: 'code-py-2',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Python Function',
    text: `def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"`,
    difficulty: 'easy',
    metadata: { language: 'python' },
  },
  {
    id: 'code-py-3',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Python Dictionary',
    text: `user = {"name": "Alice", "age": 30, "active": True}`,
    difficulty: 'easy',
    metadata: { language: 'python' },
  },
  // CSS snippets
  {
    id: 'code-css-1',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'Flexbox Center',
    text: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    difficulty: 'easy',
    metadata: { language: 'css' },
  },
  {
    id: 'code-css-2',
    universeId: BUILT_IN_UNIVERSE_IDS.CODING,
    title: 'CSS Grid',
    text: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}`,
    difficulty: 'medium',
    metadata: { language: 'css' },
  },
];

// Get all universes (built-in + custom from storage)
export function getAllUniverses(customUniverses: Universe[] = []): Universe[] {
  return [...BUILT_IN_UNIVERSES, ...customUniverses];
}

// Get universe by ID
export function getUniverseById(id: string, customUniverses: Universe[] = []): Universe | undefined {
  return getAllUniverses(customUniverses).find(u => u.id === id);
}
