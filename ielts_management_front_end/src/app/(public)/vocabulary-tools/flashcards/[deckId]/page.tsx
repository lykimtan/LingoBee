"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Search, ChevronDown, Edit, Trash2, ArrowLeft, Play, Lock, Globe, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import flashcardService, { FlashcardDeck, Flashcard } from "@/services/flashcardService";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import FlashcardModal from "@/components/learning/Flashcard/FlashcardModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function FlashcardDeckManagePage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const router = useRouter();
  const { user } = useAuthContext();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete Confirm Modal State (for Card)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Deck State
  const [isDeleteDeckModalOpen, setIsDeleteDeckModalOpen] = useState(false);
  const [isDeletingDeck, setIsDeletingDeck] = useState(false);

  useEffect(() => {
    fetchData();
  }, [deckId]);

  const fetchData = async () => {
    try {
      const [deckRes, cardsRes] = await Promise.all([
        flashcardService.getDeckById(deckId),
        flashcardService.getCardsInDeck(deckId)
      ]);
      if (deckRes.success && deckRes.data) {
        setDeck(deckRes.data);
      }
      if (cardsRes.success && cardsRes.data) {
        setCards(cardsRes.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu bộ thẻ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!deck) return;
    setIsPublishing(true);
    try {
      const response = await flashcardService.updateDeck(deck._id, { isPublic: !deck.isPublic });
      if (response.success && response.data) {
        setDeck(response.data);
        toast.success(`Đã chuyển bộ thẻ sang chế độ ${response.data.isPublic ? 'Công khai' : 'Riêng tư'}`);
      }
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái bộ thẻ");
    } finally {
      setIsPublishing(false);
    }
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleUpdateCard = async (data: Partial<Flashcard>) => {
    if (!editingCard) return;

    try {
      const response = await flashcardService.updateCard(editingCard._id, data);

      if (response.success || response.status === 'success') {
        toast.success("Đã cập nhật thẻ!");
        setCards(cards.map(c => c._id === editingCard._id ? { ...c, ...(response.data || {}) } : c));
        setIsEditModalOpen(false);
      } else {
        toast.error(response.message || "Cập nhật thẻ thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật thẻ");
    }
  };

  const handleAddCard = async (data: Partial<Flashcard>) => {
    try {
      const response = await flashcardService.createCard(deckId, {
        ...data,
        order: cards.length + 1
      });

      if (response.success || response.status === 'success') {
        toast.success("Đã thêm thẻ mới!");
        if (response.data) {
          setCards([...cards, response.data]);
        } else {
          fetchData();
        }
        setIsAddModalOpen(false);
      } else {
        toast.error(response.message || "Thêm thẻ thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thêm thẻ");
    }
  };

  const promptDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setIsConfirmModalOpen(true);
  };

  const executeDeleteCard = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      const response = await flashcardService.deleteCard(cardToDelete);
      if (response.success) {
        setCards(cards.filter(c => c._id !== cardToDelete));
        toast.success("Đã xóa thẻ");
      }
    } catch (error) {
      toast.error("Không thể xóa thẻ");
    } finally {
      setIsDeleting(false);
      setIsConfirmModalOpen(false);
      setCardToDelete(null);
    }
  };

  const executeDeleteDeck = async () => {
    setIsDeletingDeck(true);
    try {
      const response = await flashcardService.deleteDeck(deckId);
      if (response.success) {
        toast.success("Đã xóa bộ thẻ thành công");
        router.push('/vocabulary-tools/flashcards');
      } else {
        toast.error(response.message || "Xóa bộ thẻ thất bại");
      }
    } catch (error) {
      toast.error("Không thể xóa bộ thẻ");
    } finally {
      setIsDeletingDeck(false);
      setIsDeleteDeckModalOpen(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.frontText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.backText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (card.partOfSpeech && card.partOfSpeech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPoSColor = (pos?: string) => {
    if (!pos) return 'text-gray-400';
    const lower = pos.toLowerCase();
    if (lower.includes('noun')) return 'text-blue-400';
    if (lower.includes('verb')) return 'text-yellow-400';
    if (lower.includes('adj')) return 'text-indigo-400';
    if (lower.includes('adv')) return 'text-orange-400';
    return 'text-purple-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col">
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col">
        <Navigation />
        <div className="flex-1 flex justify-center items-center text-white">
          Không tìm thấy bộ thẻ
        </div>
      </div>
    );
  }

  const isOwner = user?.id === deck.creatorId || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 w-full  max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 pb-6 border-b border-white/10 pt-20">
          <div>
            <Link href="/vocabulary-tools/flashcards" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Trở về Thư viện
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">{deck.title}</h1>
            <p className="text-gray-400 max-w-2xl">{deck.description || "Chưa có mô tả"}</p>
          </div>



          <div className="flex gap-3 w-full md:w-auto">
            {isOwner && (
              <button
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors ${deck.isPublic
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
              >
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (deck.isPublic ? <Globe className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />)}
                {deck.isPublic ? 'Đã chia sẻ' : 'Riêng tư'}
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm thẻ
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setIsDeleteDeckModalOpen(true)}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors"
                title="Xóa bộ thẻ này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <Link
              href={`/vocabulary-tools/flashcards/${deck._id}/study`}
              className="flex-1 md:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20"
            >
              <Play className="w-4 h-4 mr-2 fill-current" /> Học ngay
            </Link>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-sm font-medium mb-1">Tổng số từ</span>
            <span className="text-2xl sm:text-3xl font-bold text-white">{deck?.cardsCount || cards.length}</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <span className="text-blue-400 text-sm font-medium mb-1">Cần học hôm nay</span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-500">{deck?.dueCount || 0}</span>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <span className="text-green-400 text-sm font-medium mb-1">Đã nhớ</span>
            <span className="text-2xl sm:text-3xl font-bold text-green-500">{deck?.memorizedCount || 0}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm flashcard"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1D24] border border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Card List */}
        <div className="flex flex-col gap-3 mb-6">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1D24]/50 rounded-2xl border border-white/5">
              <p className="text-gray-400">Không tìm thấy thẻ nào.</p>
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card._id}
                className="group flex items-center bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl p-4 transition-all duration-300 ease-in-out"
              >

                <div className="flex items-center flex-1 min-w-0 gap-4">
                  {/* Thumbnail - Cũng được làm hiệu ứng kính lõm xuống (inner shadow) */}
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.frontText} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white/30" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 items-center">
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-base font-bold text-white truncate drop-shadow-sm">{card.frontText}</h4>
                      <p className="text-xs text-white/60 truncate">{card.backText || card.exampleSentence || 'No description'}</p>
                    </div>

                    <div className="flex flex-col hidden md:flex">
                      <span className={`text-[13px] font-bold ${getPoSColor(card.partOfSpeech)} capitalize drop-shadow-sm`}>
                        {card.partOfSpeech || 'N/A'}
                      </span>
                      <span className="text-[11px] text-white/40 font-medium mt-0.5">Part of Speech</span>
                    </div>

                    <div className="flex flex-col hidden md:flex">
                      <span className="text-[13px] font-bold text-gray-200 drop-shadow-sm">
                        Never
                      </span>
                      <span className="text-[11px] text-white/40 font-medium mt-0.5">Last Reviewed</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="flex items-center gap-2 ml-4 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => openEditModal(card)}
                      className="p-2 text-white/50 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors backdrop-blur-sm"
                      title="Sửa thẻ"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => promptDeleteCard(card._id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors backdrop-blur-sm"
                      title="Xóa thẻ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination / Footer */}
        {filteredCards.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 mt-6 pt-6 border-t border-white/5">
            <div className="mb-4 sm:mb-0">
              Hiển thị từ 1 đến {filteredCards.length} trong tổng số {cards.length} thẻ
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#1A1D24] hover:bg-white/5 border border-white/5 rounded-lg transition-colors disabled:opacity-50" disabled>
                Trang trước đó
              </button>
              <button className="px-4 py-2 bg-[#1A1D24] hover:bg-white/5 border border-white/5 rounded-lg transition-colors disabled:opacity-50" disabled>
                Trang tiếp theo
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />

      <FlashcardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        initialData={editingCard || undefined}
        onSubmit={handleUpdateCard}
      />

      <FlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={handleAddCard}
      />

      {/* Delete Card Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeDeleteCard}
        title="Xóa thẻ từ vựng"
        message="Bạn có chắc chắn muốn xóa thẻ này? Hành động này không thể hoàn tác."
        confirmText={isDeleting ? "Đang xóa..." : "Xóa thẻ"}
        cancelText="Hủy"
        isDestructive={true}
      />

      {/* Delete Deck Modal */}
      <ConfirmModal
        isOpen={isDeleteDeckModalOpen}
        onClose={() => setIsDeleteDeckModalOpen(false)}
        onConfirm={executeDeleteDeck}
        title="Xóa bộ thẻ"
        message={`Bạn có chắc chắn muốn xóa bộ thẻ "${deck?.title}" không? Hành động này sẽ xóa toàn bộ thẻ và tiến độ học bên trong bộ bài.`}
        confirmText={isDeletingDeck ? "Đang xóa..." : "Xóa bộ thẻ"}
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}
