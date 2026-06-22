"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { BookOpen, Layers, Plus, Search, Loader2, Upload } from "lucide-react";
import flashcardService, { FlashcardDeck } from "@/services/flashcardService";
import { uploadService } from "@/services/uploadService";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function FlashcardDecksPage() {
  const { user } = useAuthContext();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_decks' | 'public_decks'>('my_decks');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        setNewThumbnailUrl(uploadData.secure_url);
        toast.success("Upload ảnh bìa thành công!");
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

  useEffect(() => {
    fetchDecks();
  }, [activeTab]);

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const isPublic = activeTab === 'public_decks';
      const response = await flashcardService.getDecks({ isPublic });
      if (response.success || response.status === 'success') {
        setDecks(response.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách bộ thẻ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ!");
      return;
    }

    setIsCreating(true);
    try {
      const response = await flashcardService.createDeck({
        title: newTitle.trim(),
        description: newDesc.trim(),
        thumbnailUrl: newThumbnailUrl.trim(),
        isPublic: false
      });

      if (response.success || response.status === 'success') {
        toast.success("Tạo bộ thẻ thành công!");
        setIsModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewThumbnailUrl('');
        // Refresh
        fetchDecks();
      } else {
        toast.error(response.message || "Tạo bộ thẻ thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo bộ thẻ");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredDecks = decks.filter(deck =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (deck.tags && deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-blue-900/20 to-transparent z-0 pointer-events-none"></div>
      <div className="fixed top-20 right-10 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />

        {/* Spacer to push content down below fixed navigation */}
        <div className="h-16 lg:h-24" />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Link href="/vocabulary-tools" className="text-blue-400 hover:text-blue-300 font-medium text-sm mb-3 flex items-center inline-flex transition-colors">
                &larr; Trở về Công cụ từ vựng
              </Link>
              <h1 className="text-4xl font-extrabold text-white tracking-tight font-display flex items-center gap-3">
                <Layers className="w-8 h-8 text-blue-500" />
                Smart Flashcards
              </h1>
              <p className="text-gray-400 mt-2">Khám phá và ôn tập các bộ từ vựng IELTS</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tạo bộ thẻ mới
            </button>
          </div>

          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('my_decks')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my_decks' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                Bộ thẻ của tôi
              </button>
              <button
                onClick={() => setActiveTab('public_decks')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'public_decks' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                Cộng đồng
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bộ thẻ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Grid Decks */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : decks.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-900/30 mx-auto rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Chưa có bộ thẻ nào</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">Bạn chưa có bộ Flashcard nào ở đây. Hãy tự tạo bộ thẻ của riêng mình hoặc khám phá từ Cộng đồng.</p>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-900/30 mx-auto rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                <Search className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy bộ thẻ nào</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">Không có bộ thẻ nào khớp với từ khóa "{searchQuery}". Vui lòng thử lại với từ khóa khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDecks.map(deck => (
                <Link key={deck._id} href={`/vocabulary-tools/flashcards/${deck._id}`} className="group block h-full">
                  <div className="flex flex-col h-full bg-gradient-to-b from-gray-400 to-gray-700 rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1">

                    {/* Top Thumbnail Section */}
                    <div className="relative w-full h-[200px] bg-gray-900 overflow-hidden flex-shrink-0">
                      {deck.thumbnailUrl ? (
                        <img
                          src={deck.thumbnailUrl}
                          alt={deck.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                          <BookOpen className="w-16 h-16 text-gray-700" />
                        </div>
                      )}

                      {/* Badge Floating */}
                      <span className="absolute top-4 right-4 bg-black/80 text-yellow-500 border border-yellow-600/30 font-bold px-3 py-1 rounded text-[11px] uppercase tracking-wider backdrop-blur-md shadow-lg">
                        {deck.tags && deck.tags.length > 0 ? deck.tags[0] : (deck.isPublic ? 'Đã chia sẻ' : 'Riêng tư')}
                      </span>
                    </div>

                    {/* Bottom Info Section */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-3xl font-bold text-white mb-3 line-clamp-2 leading-tight drop-shadow-md">
                        {deck.title}
                      </h3>

                      <p className="text-[15px] text-gray-200 line-clamp-3 mb-8 flex-1 font-medium leading-relaxed drop-shadow-sm">
                        {deck.description || "No description provided."}
                      </p>

                      <div className="mt-auto">
                        <div className="flex justify-between items-center text-[13px] font-bold text-gray-200 mb-2">
                          <span>{deck.cardsCount || 0} Cards</span>
                          <span>{deck.learnedCount || 0} Learned</span>
                        </div>
                        <div className="w-full h-[6px] bg-gray-800/60 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-[#A8B2E7] rounded-full transition-all duration-1000"
                            style={{ width: `${deck.cardsCount ? ((deck.learnedCount || 0) / deck.cardsCount) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </main>

        <Footer />
      </div>

      {/* Create Deck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-blue-900/20">
            <h2 className="text-2xl font-bold text-white mb-2">Tạo bộ thẻ mới</h2>
            <p className="text-gray-400 text-sm mb-6">Tạo một bộ flashcard mới để bắt đầu ôn tập từ vựng.</p>

            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tên bộ thẻ *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Từ vựng IELTS chủ đề Environment"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả (Không bắt buộc)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ghi chú về bộ thẻ này..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh bìa (Link / URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newThumbnailUrl}
                    onChange={(e) => setNewThumbnailUrl(e.target.value)}
                    placeholder="VD: https://example.com/cover.jpg"
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
                  {newThumbnailUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 bg-black/50">
                      <img
                        src={newThumbnailUrl}
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
