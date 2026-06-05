"use client";

import { useMemo } from "react";
import Image from "next/image";

interface GradingSidebarProps {
  queueItems: any[];
  isLoading: boolean;
  selectedAttemptId: string | null;
  onSelectAttempt: (id: string) => void;
}

export default function GradingSidebar({
  queueItems,
  isLoading,
  selectedAttemptId,
  onSelectAttempt,
}: GradingSidebarProps) {
  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval > 24) return Math.floor(interval / 24) + "d ago";
    if (interval >= 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6fb]">
      {/* Header */}
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Grading Queue</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Đang tải..." : `${queueItems.length} Pending Tasks`}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : queueItems.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-10">
            Không có bài tập nào cần chấm.
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.map((item) => {
              const isSelected = selectedAttemptId === item._id;
              // determine type based on questions in exercise if available, or fallback
              // Since queue only populates title, we might have to infer or just show "Submission"
              const title = item.exerciseId?.title || "Exercise Submission";
              const submittedAgo = timeSince(item.submittedAt);
              
              return (
                <div
                  key={item._id}
                  onClick={() => onSelectAttempt(item._id)}
                  className={`cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-[#162130] text-white shadow-lg"
                      : "bg-white text-gray-800 hover:bg-gray-50 border border-transparent shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                      {item.studentId?.userId?.avatar ? (
                        <Image
                          src={item.studentId.userId.avatar}
                          alt="avatar"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600 font-medium">
                          {(item.studentId?.userId?.fullName || "HV")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {item.studentId?.userId?.fullName || "Học viên ẩn danh"}
                      </h4>
                      <p className={`text-xs truncate ${isSelected ? "text-gray-400" : "text-gray-500"}`}>
                        {title}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-[11px] font-medium uppercase tracking-wider flex justify-between ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
                    <span>{submittedAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Filter */}
      <div className="p-4 bg-[#f4f6fb]">
        <button className="w-full py-3 bg-black text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Queue
        </button>
      </div>
    </div>
  );
}
