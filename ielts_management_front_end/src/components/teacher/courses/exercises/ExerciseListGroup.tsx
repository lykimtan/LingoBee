"use client";

import { CourseVideo } from "@/types";
import ExerciseCard from "./ExerciseCard";
import Link from "next/link";
import { PlusCircle, Video as VideoIcon } from "lucide-react";
import Image from "next/image";

interface ExerciseListGroupProps {
  videos: CourseVideo[];
  slug: string;
}

export default function ExerciseListGroup({ videos, slug }: ExerciseListGroupProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 py-20">
        <VideoIcon className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900">Chưa có video nào</h3>
        <p className="mt-2 text-sm text-gray-500">
          Hãy tải lên video trước khi tạo bài tập.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {videos.map((video) => {
        const exercises = video.exercises || [];

        return (
          <section
            key={video._id}
            id={`video-${video._id}`}
            className="flex flex-col rounded-3xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
          >
            {/* Header section for the video */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={128}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <VideoIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{video.title}</h3>
                  <p className="text-sm font-medium text-gray-500">
                    {exercises.length} Bài tập
                  </p>
                </div>
              </div>
              <Link
                href={`/teacher/courses/${slug}/videos/${video._id}/exercises`}
                className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Thêm bài tập</span>
              </Link>
            </div>

            {/* List of exercises */}
            <div className="p-6 sm:p-8">
              {exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-10">
                  <p className="text-sm font-medium text-gray-500">
                    Video này chưa có bài tập nào.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {exercises.map((exercise) => (
                    <ExerciseCard key={exercise._id} exercise={exercise} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
