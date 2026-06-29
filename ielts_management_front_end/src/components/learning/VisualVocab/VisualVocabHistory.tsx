'use client';

import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { visualVocabService, VisualVocabResult } from '@/services/visualVocabService';

interface VisualVocabHistoryProps {
  onSelectHistory?: (item: VisualVocabResult) => void;
  refreshTrigger?: number;
}

export default function VisualVocabHistory({ onSelectHistory, refreshTrigger = 0 }: VisualVocabHistoryProps) {
  const [history, setHistory] = useState<VisualVocabResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchHistory = async (pageNumber: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await visualVocabService.getHistory(pageNumber, 4); // Fetch 4 at a time to match 4 columns

      if (isLoadMore) {
        setHistory(prev => [...prev, ...response.data]);
      } else {
        setHistory(response.data);
      }

      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return (
      <>
        {month} {day},<br />{year}
      </>
    );
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return null; // Không hiển thị nếu chưa có lịch sử
  }

  return (
    <div className="mt-20 border-t border-white/10 pt-16">
      <h2 className="text-2xl font-bold text-white mb-8">Lịch sử học gần đây</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {history.map((item) => (
          <div
            key={item._id}
            className="relative rounded-[20px] overflow-hidden group border border-white/5 bg-[#0a0a0a] aspect-[4/5] shadow-lg flex flex-col"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={item.imageUrl}
                alt="Analyzed image"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
              />
            </div>

            {/* Cyan Dot */}
            <div className="absolute top-4 right-4 z-20 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050510] via-[#050510]/90 to-transparent z-10 pointer-events-none"></div>

            {/* Content Container */}
            <div className="relative z-20 mt-auto p-5 pb-5 flex flex-col gap-4">
              {/* Info Row */}
              <div className="flex justify-between items-end">
                <div className="flex gap-2">
                  <Eye className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-white font-medium leading-tight">
                    <span className="text-xl font-bold">{item.vocabularies.length} từ vựng</span><br />
                    <span className="text-gray-300">được phát hiện</span>
                  </div>
                </div>
                <div className="text-gray-400 text-sm text-right leading-snug">
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => onSelectHistory && onSelectHistory(item)}
                className="w-full py-2.5 rounded-xl border border-cyan-800/40 bg-[#0f172a]/80 text-cyan-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-cyan-900/40 transition-colors group/btn backdrop-blur-sm"
              >
                Xem chi tiết
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Tải thêm
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
