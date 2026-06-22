import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { dictionaryService, DictionaryMeaning } from '@/services/dictionaryService';
import { uploadService } from '@/services/uploadService';
import { Flashcard } from '@/services/flashcardService';
import { playAudio } from '@/utils/audioUtils';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialData?: Partial<Flashcard>;
  onSubmit: (data: Partial<Flashcard>) => Promise<void>;
}

export default function FlashcardModal({ isOpen, onClose, mode, initialData, onSubmit }: FlashcardModalProps) {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isMeaningModalOpen, setIsMeaningModalOpen] = useState(false);
  const [dictionaryMeanings, setDictionaryMeanings] = useState<DictionaryMeaning[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFrontText(initialData.frontText || '');
        setBackText(initialData.backText || '');
        setPartOfSpeech(initialData.partOfSpeech || '');
        setExampleSentence(initialData.exampleSentence || '');
        setPhonetic(initialData.phonetic || '');
        setImageUrl(initialData.imageUrl || '');
        setSynonymsInput(initialData.synonyms?.join(', ') || '');
      } else {
        setFrontText('');
        setBackText('');
        setPartOfSpeech('');
        setExampleSentence('');
        setPhonetic('');
        setImageUrl('');
        setSynonymsInput('');
      }
      setIsMeaningModalOpen(false);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const sigResponse = await uploadService.requestSignature({
        folder: 'flashcard',
        resourceType: 'image'
      });

      if (!sigResponse || sigResponse.status === 'error' || !sigResponse.data) {
        throw new Error(sigResponse?.message || "Không thể lấy chữ ký tải ảnh");
      }

      const uploadData = await uploadService.uploadToCloudinary(file, sigResponse.data);

      if (uploadData.secure_url) {
        setImageUrl(uploadData.secure_url);
        toast.success("Upload ảnh thành công!");
      } else {
        throw new Error("Không nhận được URL");
      }
    } catch (error: any) {
      console.error("Lỗi upload ảnh:", error);
      toast.error(error.message || "Tải ảnh thất bại, vui lòng thử lại.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAutoFill = async () => {
    if (!frontText.trim()) {
      toast.warning("Vui lòng nhập từ vựng trước khi tự động điền!");
      return;
    }

    setIsAutoFilling(true);
    try {
      const data = await dictionaryService.fetchWordData(frontText);

      setPhonetic(data.phonetic || '');

      if (data.meanings && data.meanings.length > 0) {
        setDictionaryMeanings(data.meanings);
        setIsMeaningModalOpen(true);
      } else {
        toast.warning("Không tìm thấy định nghĩa chi tiết cho từ này.");
      }
    } catch (error) {
      toast.error("Không tìm thấy từ này trong từ điển!");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSelectMeaning = (meaning: DictionaryMeaning) => {
    setPartOfSpeech(meaning.partOfSpeech);
    setBackText(meaning.definition);
    setExampleSentence(meaning.example);
    setSynonymsInput(meaning.synonyms?.join(', ') || '');
    setIsMeaningModalOpen(false);
    toast.success("Đã áp dụng định nghĩa!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) {
      toast.error("Vui lòng nhập đầy đủ mặt trước và mặt sau!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        frontText: frontText.trim(),
        backText: backText.trim(),
        partOfSpeech: partOfSpeech.trim(),
        exampleSentence: exampleSentence.trim(),
        phonetic: phonetic.trim(),
        imageUrl: imageUrl.trim(),
        synonyms: synonymsInput.split(',').map(s => s.trim()).filter(Boolean)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-blue-900/20">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'add' ? 'Thêm từ vựng mới' : 'Sửa từ vựng'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {mode === 'add' ? 'Điền thông tin thẻ flashcard để lưu vào bộ thẻ này.' : 'Chỉnh sửa thông tin thẻ flashcard.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mặt trước (Từ vựng) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  placeholder="VD: Serendipity"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isAutoFilling || !frontText.trim()}
                  className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Tự động điền"
                >
                  {isAutoFilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mặt sau (Định nghĩa) *</label>
              <textarea
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                placeholder="VD: Sự tình cờ may mắn..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Từ loại</label>
                <input
                  type="text"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  placeholder="VD: noun, verb..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phiên âm IPA</label>
                <div className="flex gap-2">
                    <input
                      type="text"
                      value={phonetic}
                      onChange={(e) => setPhonetic(e.target.value)}
                      placeholder="VD: /prəˈkræstɪneɪt/"
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    {frontText && (
                      <button
                        type="button"
                        onClick={() => playAudio(frontText)}
                        className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 rounded-xl px-3 flex items-center justify-center transition-colors flex-shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Câu ví dụ</label>
              <textarea
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="VD: He reinforced the handle..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-16 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Từ đồng nghĩa</label>
              <input
                type="text"
                value={synonymsInput}
                onChange={(e) => setSynonymsInput(e.target.value)}
                placeholder="VD: serendipitous, lucky (cách nhau bằng dấu phẩy)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Hình ảnh minh họa (Link / URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="VD: https://example.com/image.jpg"
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <label className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl px-3 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0" title="Tải ảnh lên">
                  {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
                {imageUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 bg-black/50">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'add' ? 'Lưu thẻ' : 'Lưu thay đổi')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dictionary Meaning Selection Modal */}
      {isMeaningModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1A1D24] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-blue-900/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> Chọn nghĩa phù hợp
                </h2>
                <p className="text-gray-400 text-sm mt-1">Từ này có nhiều nghĩa, hãy chọn nghĩa đúng với ngữ cảnh của bạn nhất.</p>
              </div>
              <button 
                onClick={() => setIsMeaningModalOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {dictionaryMeanings.map((meaning, index) => (
                <div 
                  key={index}
                  onClick={() => handleSelectMeaning(meaning)}
                  className="group bg-white/[0.03] hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 rounded-xl p-4 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 rounded-md">
                          {meaning.partOfSpeech}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm leading-relaxed mb-2">
                        {meaning.definition}
                      </p>
                      {meaning.example && (
                        <p className="text-gray-400 text-sm italic border-l-2 border-gray-600 pl-3">
                          "{meaning.example}"
                        </p>
                      )}
                    </div>
                    <button type="button" className="flex-shrink-0 opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200">
                      Chọn
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsMeaningModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
