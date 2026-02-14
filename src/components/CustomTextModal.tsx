import { useState } from 'react';
import type { CustomText } from '../utils/storage';

interface CustomTextModalProps {
  onSave: (text: Omit<CustomText, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  existingTexts: CustomText[];
}

export function CustomTextModal({
  onSave,
  onClose,
  existingTexts,
}: CustomTextModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    if (!trimmedTitle) {
      setError('Please enter a title');
      return;
    }

    if (trimmedText.length < 10) {
      setError('Text must be at least 10 characters');
      return;
    }

    if (trimmedText.length > 500) {
      setError('Text must be 500 characters or less');
      return;
    }

    onSave({
      title: trimmedTitle,
      text: trimmedText,
      difficulty,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add Custom Text</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Custom Text"
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text to Type
              <span className="text-gray-500 ml-2">({text.length}/500)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to practice typing..."
              maxLength={500}
              rows={5}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                    difficulty === d
                      ? d === 'easy'
                        ? 'bg-green-600 text-white'
                        : d === 'medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="text-red-400 text-sm">{error}</div>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Text
            </button>
          </div>
        </form>

        {/* Existing Custom Texts */}
        {existingTexts.length > 0 && (
          <div className="px-6 pb-6 border-t border-gray-700 pt-4">
            <div className="text-sm text-gray-400 mb-2">Your Custom Texts ({existingTexts.length})</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {existingTexts.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-white truncate flex-1">{t.title}</span>
                  <span className="text-xs text-gray-500 ml-2">{t.text.length} chars</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomTextModal;
