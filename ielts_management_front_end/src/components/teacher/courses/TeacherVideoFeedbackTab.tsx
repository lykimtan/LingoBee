"use client";

import React, { useEffect, useState } from "react";
import { feedbackService, FeedbackRecord } from "@/services/feedbackService";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { createSafeHtml } from "@/utils/utils";

interface TeacherVideoFeedbackTabProps {
  videoId: string;
}

export function TeacherVideoFeedbackTab({ videoId }: TeacherVideoFeedbackTabProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const res = await feedbackService.getVideoFeedbacks(videoId);
        if (res.success || res.status === "success") {
          setFeedbacks(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching video feedbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchFeedbacks();
    }
  }, [videoId]);

  const handleStatusChange = async (feedbackId: string, newStatus: FeedbackRecord["status"]) => {
    try {
      setUpdatingId(feedbackId);
      const res = await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
      if (res.success || res.status === "success") {
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === feedbackId ? { ...fb, status: newStatus } : fb))
        );
        toast.success("Cập nhật trạng thái thành công!");
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-100 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white text-center">
        <CheckCircle2 className="h-12 w-12 text-green-200 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Không có feedback</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">Admin chưa gửi feedback nào cho video này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {feedbacks.map((fb) => (
        <div key={fb._id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 text-sm font-bold flex items-center justify-center text-gray-500">
                {fb.adminId?.profilePicture ? (
                  <Image src={fb.adminId.profilePicture} alt="Admin" width={40} height={40} className="object-cover h-full w-full" />
                ) : (
                  fb.adminId?.firstName?.[0] || 'A'
                )}
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900">
                  {fb.adminId?.firstName} {fb.adminId?.lastName}
                </span>
                <span className="block text-xs font-medium text-gray-500">
                  {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Display current status as a badge */}
            <div>
              {fb.status === 'pending_fix' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                  <Clock className="h-3.5 w-3.5" /> Chờ sửa
                </span>
              )}
              {fb.status === 'teacher_updated' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  <AlertCircle className="h-3.5 w-3.5" /> Đã cập nhật
                </span>
              )}
              {fb.status === 'resolved' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Đã giải quyết
                </span>
              )}
            </div>
          </div>

          <div className='mt-2' dangerouslySetInnerHTML={createSafeHtml(fb.message)} />


          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Cập nhật trạng thái xử lý
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={`status-${fb._id}`}
                  checked={fb.status === 'pending_fix'}
                  onChange={() => handleStatusChange(fb._id, 'pending_fix')}
                  disabled={updatingId === fb._id}
                  className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-600"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Chờ sửa
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={`status-${fb._id}`}
                  checked={fb.status === 'teacher_updated'}
                  onChange={() => handleStatusChange(fb._id, 'teacher_updated')}
                  disabled={updatingId === fb._id}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Đã cập nhật
                </span>
              </label>

              {updatingId === fb._id && (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang cập nhật
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
