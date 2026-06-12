import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';
import { toast } from 'react-toastify';

interface CourseReviewModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseReviewModal = ({ courseId, isOpen, onClose, onSuccess }: CourseReviewModalProps) => {
  const [courseRating, setCourseRating] = useState(0);
  const [teacherRating, setTeacherRating] = useState(0);
  const [hoverCourseRating, setHoverCourseRating] = useState(0);
  const [hoverTeacherRating, setHoverTeacherRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseRating || !teacherRating || !comment.trim()) {
      toast.error('Vui lòng chọn số sao và nhập bình luận.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post(`/api/comments/course/${courseId}/reviews`, {
        courseRating,
        teacherRating,
        comment
      });

      if (res.success) {
        toast.success(res.message || 'Cảm ơn bạn đã gửi đánh giá!');
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Có lỗi xảy ra.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá khóa học</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Đánh giá nội dung khóa học</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`course-${star}`}
                    type="button"
                    onClick={() => setCourseRating(star)}
                    onMouseEnter={() => setHoverCourseRating(star)}
                    onMouseLeave={() => setHoverCourseRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverCourseRating || courseRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Đánh giá giáo viên</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`teacher-${star}`}
                    type="button"
                    onClick={() => setTeacherRating(star)}
                    onMouseEnter={() => setHoverTeacherRating(star)}
                    onMouseLeave={() => setHoverTeacherRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverTeacherRating || teacherRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bình luận chi tiết</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Khóa học này như thế nào? Giáo viên giảng dạy ra sao?"
                className="w-full h-32 p-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !courseRating || !teacherRating || !comment.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Gửi đánh giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
