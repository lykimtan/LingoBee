"use client";

import { CourseVideo } from "@/types";
import { PlaySquare, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ExerciseVideoSidebarProps {
  videos: CourseVideo[];
  activeVideoId?: string;
}

export default function ExerciseVideoSidebar({ videos, activeVideoId }: ExerciseVideoSidebarProps) {
  const scrollToVideo = (videoId: string) => {
    const element = document.getElementById(`video-${videoId}`);
    if (element) {
      // Offset for a sticky header if you have one, plus some padding
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <aside className="sticky top-8 flex h-max flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:w-[320px]">
      <div className="mb-6 flex items-center gap-3">
        <PlaySquare className="h-6 w-6 text-gray-900" />
        <h2 className="text-xl font-bold text-gray-900">Danh sách Video</h2>
      </div>

      <div className="flex flex-col gap-2">
        {videos.map((video) => {
          const isActive = activeVideoId === video._id;
          const exercisesCount = video.exercises?.length || 0;

          return (
            <button
              key={video._id}
              onClick={() => scrollToVideo(video._id)}
              className={`group flex items-center justify-between rounded-2xl p-3 text-left transition-colors ${
                isActive ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <PlaySquare className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-gray-900 group-hover:text-black">
                    {video.title}
                  </h4>
                  <p className="text-xs font-medium text-gray-500">
                    {exercisesCount} Bài tập
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "text-gray-900" : "text-gray-300 group-hover:text-gray-600"
                }`}
              />
            </button>
          );
        })}

        {videos.length === 0 && (
          <div className="py-4 text-center text-sm font-medium text-gray-500">
            Chưa có video nào trong khóa học này.
          </div>
        )}
      </div>
    </aside>
  );
}
