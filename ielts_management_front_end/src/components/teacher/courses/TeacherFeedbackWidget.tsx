"use client";

import React, { useEffect, useState } from "react";
import { feedbackService, FeedbackRecord } from "@/services/feedbackService";
import { MessageSquareWarning, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createSafeHtml } from '@/utils/utils';

interface TeacherFeedbackWidgetProps {
  courseId: string;
}

export function TeacherFeedbackWidget({ courseId }: TeacherFeedbackWidgetProps) {
  const params = useParams();
  const slug = params?.slug as string;
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const res = await feedbackService.getCourseFeedbacks(courseId);
        if (res.success || res.status === "success") {
          setFeedbacks(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching course feedbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchFeedbacks();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-bold text-gray-900">Admin Feedback</h2>
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return null; // Don't show the widget if there are no feedbacks
  }

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Admin Feedback</h2>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
          {feedbacks.length}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {feedbacks.map((fb) => {
          const videoObj = typeof fb.videoId === 'object' ? fb.videoId : null;
          const videoTitle = videoObj?.title || "Unknown Video";
          const videoId = videoObj?._id || fb.videoId;
          
          return (
            <Link 
              href={`/teacher/courses/${slug}/videos/${videoId}/exercises`}
              key={fb._id} 
              className="block rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:bg-gray-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                      Video
                    </span>
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={videoTitle}>
                      {videoTitle}
                    </span>
                  </div>
                  <div className='mt-2' dangerouslySetInnerHTML={createSafeHtml(fb.message)} />
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {fb.status === 'pending_fix' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700 border border-yellow-200">
                      <Clock className="h-3 w-3" /> Chờ sửa
                    </span>
                  )}
                  {fb.status === 'teacher_updated' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                      <AlertCircle className="h-3 w-3" /> Đã cập nhật
                    </span>
                  )}
                  {fb.status === 'resolved' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
                      <CheckCircle2 className="h-3 w-3" /> Đã giải quyết
                    </span>
                  )}
                  {fb.status === 'ignored' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-300">
                      <MessageSquareWarning className="h-3 w-3" /> Bỏ qua
                    </span>
                  )}

                  <span className="text-[10px] font-medium text-gray-400 mt-1">
                    {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 overflow-hidden rounded-full bg-gray-200 text-xs font-medium flex items-center justify-center text-gray-500">
                    {fb.adminId?.profilePicture ? (
                      <Image src={fb.adminId.profilePicture} alt="Admin" width={20} height={20} className="object-cover h-full w-full" />
                    ) : (
                      fb.adminId?.firstName?.[0] || 'A'
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Admin: <span className="font-semibold text-gray-700">{fb.adminId?.firstName} {fb.adminId?.lastName}</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
