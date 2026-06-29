'use client';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2, Volume2, ArrowLeft, Check, Trash2 } from 'lucide-react';
import { visualVocabService, VisualVocabResult } from '@/services/visualVocabService';
import { playAudio } from '@/utils/audioUtils';
import VisualVocabHistory from '@/components/learning/VisualVocab/VisualVocabHistory';
import VisualVocabList from '@/components/learning/VisualVocab/VisualVocabList';
import DeckSelectionModal from '@/components/learning/Flashcard/DeckSelectionModal';
import FlashcardModal from '@/components/learning/Flashcard/FlashcardModal';
import flashcardService, { Flashcard } from '@/services/flashcardService';
import { VocabItem } from '@/services/visualVocabService';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from "@/components/Navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { Footer } from "@/components/Footer";

export default function VisualVocabPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VisualVocabResult | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingWord, setDeletingWord] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Flashcard states
  const [addingVocabItem, setAddingVocabItem] = useState<VocabItem | null>(null);
  const [isDeckSelectionOpen, setIsDeckSelectionOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
    setResult(null);
    setSelectedIndices(new Set());
    setIsSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setIsSaved(false);
    try {
      const data = await visualVocabService.analyzeImage(file);
      setResult(data);
      setSelectedIndices(new Set(data.vocabularies.map((_, i) => i)));
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi phân tích hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: VisualVocabResult) => {
    setResult(item);
    setPreview(item.imageUrl);
    setFile(null);
    setSelectedIndices(new Set(item.vocabularies.map((_, i) => i)));
    setIsSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleSave = async () => {
    if (!result || selectedIndices.size === 0) return;
    setIsSaving(true);
    setError('');
    try {
      const selectedVocabs = result.vocabularies.filter((_, i) => selectedIndices.has(i));
      const savedData = await visualVocabService.saveVocabularies(result.imageUrl, selectedVocabs);
      setIsSaved(true);
      setResult({
        ...result,
        _id: savedData._id,
        vocabularies: selectedVocabs
      });
      setSelectedIndices(new Set(selectedVocabs.map((_, i) => i)));
      toast.success("Đã lưu từ vựng thành công!");
      setHistoryRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu từ vựng.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = () => {
    if (!result?._id) return;
    setConfirmModal({
      isOpen: true,
      title: 'Xóa bản ghi này?',
      message: 'Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác và sẽ xóa cả ảnh trên hệ thống.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setIsDeleting(true);
        try {
          await visualVocabService.deleteVisualVocab(result._id as string);
          setResult(null);
          setFile(null);
          setPreview(null);
          setIsSaved(false);
          toast.success("Xóa bản ghi thành công");
          setHistoryRefreshKey(prev => prev + 1);
        } catch (error: any) {
          setError(error.message || 'Lỗi khi xóa bản ghi.');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleDeleteWord = (word: string) => {
    if (!result?._id) return;
    setConfirmModal({
      isOpen: true,
      title: 'Xóa từ vựng',
      message: `Bạn có chắc muốn xóa từ "${word}" khỏi danh sách?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setDeletingWord(word);
        try {
          await visualVocabService.deleteVocabularyItem(result._id as string, word);
          setResult(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              vocabularies: prev.vocabularies.filter(v => v.word !== word)
            };
          });
          toast.success("Xóa từ vựng thành công!");
        } catch (error: any) {
          setError(error.message || 'Lỗi khi xóa từ vựng.');
        } finally {
          setDeletingWord(null);
        }
      }
    });
  };

  const handleAddToFlashcard = (vocab: VocabItem) => {
    setAddingVocabItem(vocab);
    setIsDeckSelectionOpen(true);
  };

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setIsDeckSelectionOpen(false);
    setIsFlashcardModalOpen(true);
  };

  const handleSaveFlashcard = async (data: Partial<Flashcard>) => {
    if (!selectedDeckId) return;
    try {
      const response = await flashcardService.createCard(selectedDeckId, data);
      if (response.success || response.status === 'success') {
        toast.success('Đã thêm vào bộ thẻ Flashcard thành công!');
        setIsFlashcardModalOpen(false);
        setAddingVocabItem(null);
        setSelectedDeckId(null);
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi thêm thẻ.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi server khi thêm thẻ.');
    }
  };

  return (
    <div className="relative w-full min-h-screen  text-white font-sans flex flex-col overflow-hidden">
      <Navigation />

      {/* Spacer to push content down below fixed navigation */}
      <div className="h-16 lg:h-24" />

      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-purple-900/10 to-pink-900/10 z-0 pointer-events-none"></div>
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        <Link href="/vocabulary-tools" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại Vocabulary Tools
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-yellow-500 to-red-500">
            Visual Vocabulary
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Học từ vựng trực quan thông qua hình ảnh. Tải lên một bức ảnh bất kỳ và AI sẽ tự động gọi tên các đồ vật bằng tiếng Anh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Upload Area */}
          <div className="flex flex-col gap-6">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300 ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 bg-gray-800/30 hover:border-gray-500'
                } ${preview ? 'border-none p-0 overflow-hidden' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {preview ? (
                <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result?.imageUrl || preview} alt="Preview" className="max-w-full max-h-[600px] object-contain rounded-3xl" />
                  {!isLoading && !result && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center cursor-pointer">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Tải ảnh lên</h3>
                  <p className="text-gray-500">Kéo thả hoặc click để chọn ảnh từ thiết bị</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {preview && !result && (
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang phân tích hình ảnh ....
                  </>
                ) : (
                  <>
                    Khám phá từ vựng
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col gap-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-800/20 rounded-3xl border border-gray-700/50 p-8">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-300">Đang quét hình ảnh...</h3>
                <p className="text-gray-500 text-center max-w-sm">YOLOv10 đang nhận diện vật thể và Gemini đang biên dịch các từ vựng mới nhất cho bạn.</p>
              </div>
            )}

            <AnimatePresence>
              {result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-medium">Tìm thấy {result.vocabularies.length} từ vựng!</span>
                    <button
                      onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                      className="text-sm underline hover:text-green-300"
                    >
                      Thử ảnh khác
                    </button>
                  </div>

                  <VisualVocabList
                    vocabularies={result.vocabularies}
                    isSaved={isSaved}
                    selectedIndices={selectedIndices}
                    toggleSelection={toggleSelection}
                    resultId={result._id}
                    handleDeleteWord={handleDeleteWord}
                    deletingWord={deletingWord}
                    onAddToFlashcard={handleAddToFlashcard}
                  />

                  {!isSaved ? (
                    <div className="pt-4 border-t border-gray-800">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || selectedIndices.size === 0}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-green-500/25"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Check className="w-6 h-6" />
                            Lưu {selectedIndices.size} từ vựng đã chọn
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-800 flex gap-4">
                      <div className="flex-1 bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3">
                        <Check className="w-6 h-6" />
                        Đã lưu thành công!
                      </div>
                      {result._id && (
                        <button
                          onClick={handleDeleteRecord}
                          disabled={isDeleting}
                          className="px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          title="Xóa bản ghi này"
                        >
                          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!isLoading && !result && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-800/20 rounded-3xl border border-gray-700/50 border-dashed p-8 text-center opacity-50">
                <h3 className="text-xl font-semibold mb-2 text-gray-400">Kết quả sẽ hiển thị ở đây</h3>
                <p className="text-gray-600 max-w-sm">Hãy upload một bức ảnh và bấm phân tích để bắt đầu học nhé.</p>
              </div>
            )}
          </div>
        </div>

        <VisualVocabHistory onSelectHistory={handleSelectHistory} refreshTrigger={historyRefreshKey} />
      </main>

      <Footer />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xóa"
        cancelText="Hủy"
        isDestructive={true}
      />

      <DeckSelectionModal
        isOpen={isDeckSelectionOpen}
        onClose={() => {
          setIsDeckSelectionOpen(false);
          setAddingVocabItem(null);
        }}
        onSelectDeck={handleSelectDeck}
      />

      <FlashcardModal
        isOpen={isFlashcardModalOpen}
        onClose={() => {
          setIsFlashcardModalOpen(false);
          setAddingVocabItem(null);
          setSelectedDeckId(null);
        }}
        mode="add"
        initialData={addingVocabItem ? {
          frontText: addingVocabItem.word,
          backText: addingVocabItem.translation,
          phonetic: addingVocabItem.phonetic,
          partOfSpeech: addingVocabItem.partOfSpeech,
          exampleSentence: addingVocabItem.example,
          synonyms: addingVocabItem.synonyms || [],
          imageUrl: result?.imageUrl || ''
        } : undefined}
        onSubmit={handleSaveFlashcard}
      />
    </div>
  );
}
