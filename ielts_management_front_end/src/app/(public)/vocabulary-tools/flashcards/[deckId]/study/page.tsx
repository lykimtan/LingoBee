"use client";

import { useEffect, useState, use } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { X, Trophy, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import flashcardService, { Flashcard } from "@/services/flashcardService";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import TinderCard from "@/components/learning/Flashcard/TinderCard";
import { apiClient } from "@/utils/api";
import FlashcardModal from "@/components/learning/Flashcard/FlashcardModal";

// Sử dụng React.use() để unwrap params theo Next.js 15
export default function FlashcardPlayerPage({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.deckId;

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, forgotten: 0 });
  const [isNoDueCards, setIsNoDueCards] = useState(false);

  // Add Card Modal State
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, [deckId]);

  const fetchDueCards = async () => {
    setIsLoading(true);
    try {
      // Đầu tiên lấy các thẻ đến hạn ôn tập (Due Cards) theo SM-2
      const response = await flashcardService.getDueCards(deckId);
      let cardsData = response.data || [];

      // Nếu không có thẻ nào đến hạn, lấy toàn bộ thẻ trong bộ (All Cards) để người dùng luôn có thể học
      if (cardsData.length === 0) {
        setIsNoDueCards(true);
        const allCardsResponse = await flashcardService.getCardsInDeck(deckId);
        if (allCardsResponse.success || allCardsResponse.status === 'success') {
          let allCards = allCardsResponse.data || [];
          // Trộn ngẫu nhiên
          for (let i = allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
          }
          cardsData = allCards;
        }
      } else {
        setIsNoDueCards(false);
      }

      setCards(cardsData);

      // Nếu sau cả 2 bước mà vẫn không có thẻ (tức là bộ thẻ trống), mới hiện màn hình "Hoàn thành"
      if (cardsData.length === 0) {
        setIsFinished(true);
      } else {
        setIsFinished(false);
      }
    } catch (error) {
      toast.error("Không thể tải thẻ từ vựng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const card = cards[currentIndex];

    // Quality: 0 (Quên), 2 (Nhớ)
    const quality = direction === 'right' ? 2 : 0;

    try {
      await flashcardService.submitReview(card._id, quality);

      setStats(prev => ({
        remembered: direction === 'right' ? prev.remembered + 1 : prev.remembered,
        forgotten: direction === 'left' ? prev.forgotten + 1 : prev.forgotten
      }));

    } catch (error) {
      console.error("Lỗi cập nhật tiến độ", error);
    }

    // Chuyển sang thẻ tiếp theo
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
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
        setIsAddCardOpen(false);
        fetchDueCards();
        setIsFinished(false);
        setCurrentIndex(0);
      } else {
        toast.error(response.message || "Thêm thẻ thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thêm thẻ");
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col bg-[#111827]">
      {/* Dark mode background for focus */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#111827] to-[#111827] z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Minimal Nav specifically for Player */}
        <div className="w-full flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
          <Link href={`/vocabulary-tools/flashcards/${deckId}`} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <X className="w-6 h-6" />
          </Link>
          <div className="text-white font-display font-bold text-xl">LingoBee Flashcards</div>
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-xl transition-colors font-semibold text-sm border border-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Thêm từ
          </button>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[70vh]">

          {!isLoading && !isFinished && isNoDueCards && (
            <div className="bg-yellow-500/20 border rounded-xl p-2 mb-8 max-w-2xl text-center text-yellow-100 text-sm backdrop-blur-md shadow-lg shadow-yellow-500/10 animate-fade-in">
              <span className="font-bold text-yellow-400 block mb-1 text-base">Chú ý:</span>
              Bạn đã học xong số lượng từ cần ôn tập trong hôm nay. Bạn có thể dừng lại việc ôn tập và quay lại vào hôm sau.
              <span className="font-bold text-yellow-400">TUY NHIÊN</span>, nếu bây giờ bạn vẫn muốn ôn tập tiếp, các từ bạn đang học sẽ xuất hiện <span className="underline font-semibold">NGẪU NHIÊN</span> ở dưới.
            </div>
          )}

          {isLoading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : isFinished ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Tuyệt vời!</h2>
              <p className="text-gray-300 mb-8">Bạn đã hoàn thành mục tiêu ôn tập cho bộ thẻ này hôm nay.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-green-400">{stats.remembered}</div>
                  <div className="text-sm text-green-200">Thẻ đã nhớ</div>
                </div>
                <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-red-400">{stats.forgotten}</div>
                  <div className="text-sm text-red-200">Cần ôn lại</div>
                </div>
              </div>

              <Link href={`/vocabulary-tools/flashcards/${deckId}`} className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-center">
                Trở về Chi tiết bộ thẻ
              </Link>
            </div>
          ) : (
            <>
              <div className="relative w-full h-[65vh] max-w-md sm:max-w-lg">

                {/* Progress Bar */}
                <div className="absolute -top-12 left-0 w-full flex items-center gap-4">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${(currentIndex / cards.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white/60 text-sm font-bold font-mono">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                {/* Cards Stack */}
                {cards.map((card, index) => {
                  // Chỉ render thẻ hiện tại và 2 thẻ tiếp theo để tối ưu hiệu năng
                  if (index < currentIndex || index > currentIndex + 2) return null;

                  return (
                    <TinderCard
                      key={card._id}
                      card={card}
                      active={index === currentIndex}
                      index={index - currentIndex}
                      onSwipe={handleSwipe}
                    />
                  );
                })}
              </div>

              {/* Help Text */}
              <div className="w-full max-w-sm sm:max-w-md mx-auto flex justify-between text-white/40 text-[13px] sm:text-sm font-semibold uppercase tracking-wider px-4 mt-8 z-10 relative">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Quên (Trái)</span>
                <span className="flex items-center gap-2">Nhớ (Phải) <span className="w-2 h-2 rounded-full bg-green-500"></span></span>
              </div>
            </>
          )}

        </main>
      </div>

      <FlashcardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        mode="add"
        onSubmit={handleAddCard}
      />
    </div>
  );
}
