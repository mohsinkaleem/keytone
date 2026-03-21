/**
 * Universe Creation Modal – single-page intuitive flow
 *
 * 1. Fill in name / type / icon (top section)
 * 2. Add content via file upload OR paste (middle)
 * 3. See a live excerpt preview (bottom)
 * 4. One-click save
 */

import { useState, useRef, useCallback } from 'react';
import type { UniverseType, Excerpt } from '../types/universe';
import { chunkText, estimateDifficulty, generateTitle, parseTextFile, parseEpubChapters } from '../utils/ingestion';
import { parseQuranText } from '../utils/ingestion/quranParser';
import { parseLineByLine, parseJsonText } from '../utils/ingestion/genericParsers';

type ParserType = 'auto' | 'plain' | 'quran' | 'line-by-line' | 'json';

interface UniverseCreationModalProps {
  onSave: (universe: {
    name: string;
    type: UniverseType;
    description: string;
    icon: string;
  }, excerpts: Omit<Excerpt, 'id'>[]) => void;
  onClose: () => void;
}

const UNIVERSE_ICONS = ['📖', '💻', '🎯', '🌟', '📝', '🎨', '🔬', '🌍', '🎵', '⚡'];

const TYPE_INFO: Record<UniverseType, { label: string; icon: string; hint: string }> = {
  standard: { label: 'Standard', icon: '📚', hint: 'Random excerpts' },
  coding:   { label: 'Coding',   icon: '💻', hint: 'Code snippets' },
  novel:    { label: 'Novel',    icon: '📖', hint: 'Sequential reading' },
};

export function UniverseCreationModal({ onSave, onClose }: UniverseCreationModalProps) {
  // Universe info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<UniverseType>('standard');
  const [icon, setIcon] = useState('📖');

  // Content
  const [textContent, setTextContent] = useState('');
  const [chapterExcerpts, setChapterExcerpts] = useState<Omit<Excerpt, 'id'>[] | null>(null);
  const [chunkSize, setChunkSize] = useState(500);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parserType, setParserType] = useState<ParserType>('auto');
  const [jsonTextField, setJsonTextField] = useState('text');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build excerpts reactively from textContent + chunkSize + parserType
  const excerpts = useCallback((): Omit<Excerpt, 'id'>[] => {
    if (chapterExcerpts) return chapterExcerpts;
    if (!textContent.trim()) return [];

    // Use parser-specific logic
    if (parserType === 'quran') {
      return parseQuranText(textContent, { excerptLength: chunkSize });
    }
    if (parserType === 'line-by-line') {
      return parseLineByLine(textContent, { minLength: 20, maxLength: chunkSize });
    }
    if (parserType === 'json') {
      try {
        return parseJsonText(textContent, { textField: jsonTextField, maxLength: chunkSize });
      } catch {
        return [];
      }
    }

    // Auto / plain: default chunking
    const chunks = chunkText(textContent, {
      maxLength: chunkSize,
      minLength: Math.max(50, chunkSize * 0.2),
    });
    return chunks.map((chunk, index) => ({
      universeId: '',
      text: chunk,
      title: generateTitle(chunk, index),
      difficulty: estimateDifficulty(chunk),
      order: index,
    }));
  }, [textContent, chunkSize, chapterExcerpts, parserType, jsonTextField]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setParsing(true);
    setFileName(file.name);
    setChapterExcerpts(null);

    try {
      if (file.name.endsWith('.epub')) {
        const chapters = await parseEpubChapters(file);
        if (chapters.length === 0) {
          setParseError('No readable chapters found in this EPUB.');
        } else {
          // Build chapter-aware excerpts: each chapter → chunk → excerpt
          const allExcerpts: Omit<Excerpt, 'id'>[] = [];
          let order = 0;
          for (const ch of chapters) {
            const chunks = chunkText(ch.text, { maxLength: chunkSize, minLength: 80 });
            for (let i = 0; i < chunks.length; i++) {
              allExcerpts.push({
                universeId: '',
                text: chunks[i],
                title: chunks.length === 1 ? ch.title : `${ch.title} (${i + 1})`,
                difficulty: estimateDifficulty(chunks[i]),
                order: order++,
              });
            }
          }
          setChapterExcerpts(allExcerpts);
          // Also put full text in textarea for display
          setTextContent(chapters.map(c => c.text).join('\n\n---\n\n'));
        }
        // Auto-detect type
        setType('novel');
      } else if (file.name.endsWith('.json')) {
        const raw = await file.text();
        setTextContent(raw);
        setParserType('json');
      } else {
        const raw = await file.text();
        const text = parseTextFile(raw);
        if (!text.trim()) {
          setParseError('File appears to be empty or could not be read.');
        } else {
          setTextContent(text);
        }
      }

      // Auto-fill name from filename if empty
      if (!name) {
        const base = file.name.replace(/\.(txt|md|markdown|epub|json)$/i, '').replace(/[_-]/g, ' ');
        setName(base.charAt(0).toUpperCase() + base.slice(1));
      }
    } catch (err) {
      console.error("File parse error:", err);
      setParseError('Could not parse file. It may be encrypted, corrupt, or an unsupported format.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = () => {
    const ex = excerpts();
    if (!name.trim() || ex.length === 0) return;
    onSave({ name, type, description, icon }, ex);
  };

  const previewExcerpts = excerpts();
  const canSave = name.trim().length > 0 && previewExcerpts.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Create Universe</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Row 1: Name + Icon */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Universe"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <div className="flex gap-1 flex-wrap max-w-[220px]">
                {UNIVERSE_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`w-8 h-8 rounded-md text-base flex items-center justify-center transition-colors ${
                      icon === i ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description <span className="text-gray-600">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Row 3: Type */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <div className="flex gap-2">
              {(['standard', 'coding', 'novel'] as UniverseType[]).map((t) => {
                const info = TYPE_INFO[t];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      type === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span>{info.icon} {info.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{info.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Parser */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Parser Format</label>
            <div className="flex gap-2 flex-wrap">
              {([
                { value: 'auto' as ParserType, label: 'Auto-detect', hint: 'Smart chunking' },
                { value: 'quran' as ParserType, label: 'Quran', hint: 'Verse-aware' },
                { value: 'line-by-line' as ParserType, label: 'Line-by-Line', hint: 'Each line = excerpt' },
                { value: 'json' as ParserType, label: 'JSON', hint: 'Structured data' },
              ]).map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setParserType(p.value); setChapterExcerpts(null); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    parserType === p.value ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="block text-[10px] opacity-70 mt-0.5">{p.hint}</span>
                </button>
              ))}
            </div>
            {parserType === 'json' && (
              <div className="mt-2">
                <label className="block text-[10px] text-gray-500 mb-1">Text field path (dot-separated, e.g. "content" or "verse.text")</label>
                <input
                  type="text"
                  value={jsonTextField}
                  onChange={(e) => setJsonTextField(e.target.value)}
                  placeholder="text"
                  className="w-48 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Row 5: Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {parsing ? 'Reading file...' : 'Upload (.txt, .epub, .md, .json)'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.epub,.md,.markdown,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fileName && (
                <span className="text-xs text-gray-500 truncate max-w-[200px]">{fileName}</span>
              )}
            </div>

            {parseError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {parseError}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Or paste text</label>
              <textarea
                value={textContent}
                onChange={(e) => { setTextContent(e.target.value); setChapterExcerpts(null); }}
                placeholder="Paste your text here..."
                rows={8}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none font-mono resize-none"
              />
            </div>

            {/* Chunk size slider */}
            {textContent.trim() && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Excerpt length: ~{chunkSize} chars</span>
                  <span>{previewExcerpts.length} excerpts</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Live preview */}
          {previewExcerpts.length > 0 && (
            <div>
              <h3 className="text-xs text-gray-400 mb-2">Preview ({previewExcerpts.length} excerpts)</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {previewExcerpts.slice(0, 20).map((excerpt, index) => (
                  <div key={index} className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700/50 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-white truncate">{excerpt.title}</span>
                      <span className={`ml-2 shrink-0 px-1.5 py-0.5 rounded text-[10px] ${
                        excerpt.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        excerpt.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{excerpt.difficulty}</span>
                    </div>
                    <p className="text-gray-500 line-clamp-1">{excerpt.text}</p>
                  </div>
                ))}
                {previewExcerpts.length > 20 && (
                  <p className="text-[10px] text-gray-600 text-center">
                    +{previewExcerpts.length - 20} more excerpts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Universe ({previewExcerpts.length} excerpts)
          </button>
        </div>
      </div>
    </div>
  );
}

export default UniverseCreationModal;
