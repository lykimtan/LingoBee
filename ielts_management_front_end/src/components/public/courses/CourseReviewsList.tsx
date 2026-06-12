"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquareText } from "lucide-react";
import { apiClient } from "@/utils/api";
import Image from "next/image";

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
      {reviews.map((review) => (
        <div key={review._id} className="bg-[#0c1824]/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#0c1824]/80 transition-colors">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div>
                  <h4 className="text-base font-bold text-white">{review.author.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-600 text-gray-600'}`} 
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 sm:mt-0">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mt-3">
                {review.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
