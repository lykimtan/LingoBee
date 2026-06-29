import React from 'react';
import { motion } from 'framer-motion';
import { Check, Volume2, Trash2, Loader2, BookPlus } from 'lucide-react';
import { VocabItem } from '@/services/visualVocabService';
import { playAudio } from '@/utils/audioUtils';

interface VisualVocabListProps {
  vocabularies: VocabItem[];
  isSaved: boolean;
  selectedIndices: Set<number>;
  toggleSelection: (index: number) => void;
  resultId?: string;
  handleDeleteWord: (word: string) => void;
  deletingWord: string | null;
  onAddToFlashcard?: (vocab: VocabItem) => void;
}

export default function VisualVocabList({
  vocabularies,
  isSaved,
  selectedIndices,
  toggleSelection,
  resultId,
  handleDeleteWord,
  deletingWord,
  onAddToFlashcard
}: VisualVocabListProps) {
  return (
    <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
      {vocabularies.map((vocab, idx) => (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={idx}
          className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 hover:border-purple-500/50 rounded-2xl p-6 transition-colors group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-4">
              {!isSaved && (
                <button
                  onClick={() => toggleSelection(idx)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${selectedIndices.has(idx)
                    ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-transparent border-gray-500 hover:border-purple-400'
                    }`}
                >
                  <Check className={`w-4 h-4 text-white transition-opacity ${selectedIndices.has(idx) ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                </button>
              )}
              <div>
                <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors capitalize">
                  {vocab.word}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md font-mono">{vocab.phonetic}</span>
                  <span className="text-gray-400 italic">{vocab.partOfSpeech}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {onAddToFlashcard && (
                <button
                  onClick={() => onAddToFlashcard(vocab)}
                  className="p-3 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 rounded-full transition-all flex-shrink-0"
                  title="Thêm vào Flashcard"
                >
                  <BookPlus className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => playAudio(vocab.word)}
                className="p-3 bg-gray-700/50 hover:bg-purple-500 hover:text-white rounded-full transition-all flex-shrink-0"
                title="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              {resultId && isSaved && (
                <button
                  onClick={() => handleDeleteWord(vocab.word)}
                  disabled={deletingWord === vocab.word}
                  className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-full transition-all flex-shrink-0"
                  title="Xóa từ này"
                >
                  {deletingWord === vocab.word ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-lg text-gray-200 mb-2 font-medium">{vocab.translation}</p>
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 mb-3">
              <p className="text-gray-400 text-sm">" {vocab.example} "</p>
            </div>
            {vocab.synonyms && vocab.synonyms.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Từ đồng nghĩa ở level cao hơn:</span>
                {vocab.synonyms.map((synonym, sIdx) => (
                  <span key={sIdx} className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-300 border border-purple-500/30 rounded-md">
                    {synonym}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
