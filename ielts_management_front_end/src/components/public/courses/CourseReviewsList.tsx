"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquareText, Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { apiClient } from "@/utils/api";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";

interface Review {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  rating: number;
  createdAt: string;
}

export const CourseReviewsList = ({ courseId }: { courseId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Edit state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get<Review[]>(`/api/comments/public/target/Course/${courseId}`);
        if (res.success && res.data) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  const confirmDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const executeDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setIsDeleting(true);
      const res = await apiClient.delete(`/api/comments/${reviewToDelete}`);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
        toast.success("Đã xóa đánh giá thành công!");
        setDeleteModalOpen(false);
        setReviewToDelete(null);
      } else {
        toast.error(res.message || "Không thể xóa đánh giá.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa đánh giá.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review._id);
    setEditContent(review.content);
    setEditRating(review.rating);
    setHoverRating(0);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editContent.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiClient.put<Review>(`/api/comments/${reviewId}`, {
        content: editContent.trim(),
        rating: editRating,
      });

      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, content: editContent.trim(), rating: editRating }
              : r
          )
        );
        setEditingReviewId(null);
        toast.success("Đã cập nhật đánh giá thành công!");
      } else {
        toast.error(res.message || "Không thể cập nhật đánh giá.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật đánh giá.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#1c7c78] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
        <MessageSquareText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-400">Hãy là người đầu tiên đánh giá khóa học này sau khi hoàn thành nhé!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isMyReview = user && (review.author._id === user.id || review.author._id === (user as any).id);
        const isEditing = editingReviewId === review._id;

        return (
          <div
            key={review._id}
            className={`bg-[#0c1824]/50 border ${isMyReview ? "border-[#1c7c78]/60 shadow-lg shadow-[#1c7c78]/5" : "border-white/10"
              } rounded-2xl p-6 relative overflow-hidden transition-all`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#1c7c78]/30">
                <Image
                  src={review.author.avatar || "/default_images/avatar.jpg"}
                  alt={review.author.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-white">{review.author.name}</h4>
                    {isMyReview && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#1c7c78]/20 text-[#2dd4bf] border border-[#1c7c78]/40 rounded-full">
                        Đánh giá của bạn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>

                    {/* Action buttons for author */}
                    {isMyReview && !isEditing && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={() => handleStartEdit(review)}
                          title="Chỉnh sửa đánh giá"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteClick(review._id)}
                          title="Xóa đánh giá"
                          className="p-1.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating display or edit mode */}
                {isEditing ? (
                  <div className="mt-3 bg-[#0c1824] p-4 rounded-xl border border-white/10 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Chọn lại số sao:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${star <= (hoverRating || editRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600"
                                } transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Nội dung nhận xét:
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Cập nhật nhận xét của bạn về khóa học..."
                        className="w-full h-24 p-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1c7c78] transition-all"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(review._id)}
                        disabled={isSaving || !editContent.trim()}
                        className="px-4 py-1.5 text-xs font-semibold text-[#0a1a1c] bg-[#2dd4bf] hover:bg-[#26b8a5] rounded-lg disabled:opacity-50 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-600 text-gray-600"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mt-3 whitespace-pre-line">
                      {review.content}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setReviewToDelete(null);
          }
        }}
        onConfirm={executeDeleteReview}
        title="Xác nhận xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa bài đánh giá này? Điểm số trung bình của khóa học sẽ được hệ thống tính toán và cập nhật lại ngay lập tức."
        confirmText="Xóa đánh giá"
        cancelText="Hủy"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

