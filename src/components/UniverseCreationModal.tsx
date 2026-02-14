/**
 * Universe Creation Modal - Create new universes with text ingestion
 */

import { useState, useRef } from 'react';
import type { UniverseType, Excerpt } from '../types/universe';
import { chunkText, estimateDifficulty, generateTitle, parseTextFile, parseEpubFile } from '../utils/ingestion';

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

export function UniverseCreationModal({ onSave, onClose }: UniverseCreationModalProps) {
  const [step, setStep] = useState<'info' | 'content' | 'preview'>('info');
  
  // Universe info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<UniverseType>('standard');
  const [icon, setIcon] = useState('📖');
  
  // Content
  const [textContent, setTextContent] = useState('');
  const [chunkSize, setChunkSize] = useState(500);
  
  // Parsed excerpts
  const [excerpts, setExcerpts] = useState<Omit<Excerpt, 'id'>[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.epub')) {
      try {
        const text = await parseEpubFile(file);
        setTextContent(text);
      } catch (err) {
        console.error("Failed to parse EPUB:", err);
        alert("Could not parse EPUB file. It might be encrypted or invalid.");
      }
    } else {
      const text = await file.text();
      setTextContent(parseTextFile(text));
    }
  };

  const handlePreview = () => {
    if (!textContent.trim()) return;

    const chunks = chunkText(textContent, { 
      maxLength: chunkSize,
      minLength: Math.max(50, chunkSize * 0.2),
    });

    const newExcerpts: Omit<Excerpt, 'id'>[] = chunks.map((chunk, index) => ({
      universeId: '', // Will be set when saving
      text: chunk,
      title: generateTitle(chunk, index),
      difficulty: estimateDifficulty(chunk),
      order: index,
    }));

    setExcerpts(newExcerpts);
    setStep('preview');
  };

  const handleSave = () => {
    if (!name.trim() || excerpts.length === 0) return;

    onSave(
      { name, type, description, icon },
      excerpts
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {step === 'info' && 'Create Universe'}
            {step === 'content' && 'Add Content'}
            {step === 'preview' && 'Preview Excerpts'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Universe Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Universe"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A collection of..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <div className="flex gap-2">
                  {(['standard', 'coding', 'novel'] as UniverseType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === t
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {t === 'standard' && '📚 Standard'}
                      {t === 'coding' && '💻 Coding'}
                      {t === 'novel' && '📖 Novel'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {type === 'standard' && 'Random excerpts for general practice'}
                  {type === 'coding' && 'Code snippets with syntax preserved'}
                  {type === 'novel' && 'Sequential reading through content'}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {UNIVERSE_ICONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                        icon === i
                          ? 'bg-indigo-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 'content' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload File (.txt, .epub, .md)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.epub,.md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Or paste text content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text here..."
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Target excerpt length: {chunkSize} characters
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Short (100)</span>
                  <span>Long (2000)</span>
                </div>
              </div>

              {textContent && (
                <p className="text-sm text-gray-400">
                  ~{Math.ceil(textContent.length / chunkSize)} excerpts will be created
                </p>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {excerpts.length} excerpts ready to be created
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {excerpts.map((excerpt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{excerpt.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        excerpt.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        excerpt.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {excerpt.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {excerpt.text}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {excerpt.text.length} characters
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <button
            onClick={() => {
              if (step === 'content') setStep('info');
              else if (step === 'preview') setStep('content');
              else onClose();
            }}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {step === 'info' ? 'Cancel' : 'Back'}
          </button>

          {step === 'info' && (
            <button
              onClick={() => setStep('content')}
              disabled={!name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}

          {step === 'content' && (
            <button
              onClick={handlePreview}
              disabled={!textContent.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>
          )}

          {step === 'preview' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Universe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UniverseCreationModal;
