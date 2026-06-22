import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Loader2, BookOpen, Plus } from 'lucide-react';
import flashcardService, { FlashcardDeck } from '@/services/flashcardService';
import { toast } from 'react-toastify';

interface DeckSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: string) => void;
}

export default function DeckSelectionModal({ isOpen, onClose, onSelectDeck }: DeckSelectionModalProps) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDecks();
    }
  }, [isOpen]);

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const response = await flashcardService.getDecks();
      if (response.success && response.data) {
        setDecks(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách bộ thẻ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await flashcardService.createDeck({ title: newTitle.trim(), isPublic: false });
      if (response.success && response.data) {
        toast.success("Tạo bộ thẻ thành công!");
        onSelectDeck(response.data._id); // Auto select new deck
      } else {
        toast.error(response.message || "Không thể tạo bộ thẻ");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo bộ thẻ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#111827]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Chọn bộ thẻ Flashcard</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400">Đang tải danh sách bộ thẻ...</p>
              </div>
            ) : isCreating ? (
              <form onSubmit={handleCreateDeck} className="flex flex-col gap-4 py-4">
                <h3 className="text-lg font-bold text-white mb-2">Tạo bộ thẻ mới</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tên bộ thẻ</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Từ vựng IELTS chủ đề Environment"
                    className="w-full bg-[#1A1D24] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setNewTitle(''); }}
                    className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Tạo và chọn
                  </button>
                </div>
              </form>
            ) : decks.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                  <BookOpen className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Chưa có bộ thẻ nào</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Bạn chưa tạo bộ thẻ Flashcard nào. Hãy tạo một bộ thẻ mới để lưu từ vựng nhé.
                </p>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Tạo bộ thẻ mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex flex-col items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-xl transition-all text-center group min-h-[120px]"
                >
                  <Plus className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-blue-400 font-bold">Tạo bộ thẻ mới</span>
                </button>
                {decks.map((deck) => (
                  <button
                    key={deck._id}
                    onClick={() => onSelectDeck(deck._id)}
                    className="flex flex-col items-start p-4 bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl transition-all text-left group min-h-[120px]"
                  >
                    <h3 className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{deck.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{deck.description || 'Không có mô tả'}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <span className="px-2 py-1 bg-gray-800 rounded-md">{deck.cardsCount || 0} thẻ</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
