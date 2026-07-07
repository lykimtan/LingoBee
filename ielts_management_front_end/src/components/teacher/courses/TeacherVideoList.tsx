"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PlaySquare, Trash2, FilePlus, Pencil } from "lucide-react";
import { CourseVideo } from "@/types";



const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatDateRelative = (dateString?: string) => {
  if (!dateString) return "Không rõ";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 172800) return "Hôm qua";
  return date.toLocaleDateString("vi-VN");
};

interface TeacherVideoListProps {
  videos: CourseVideo[];
  onPlay: (video: CourseVideo) => void;
  onDeleteRequest: (videoId: string) => void;
  onEdit?: (video: CourseVideo) => void;
}

export default function TeacherVideoList({ videos, onPlay, onDeleteRequest, onEdit }: TeacherVideoListProps) {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  return (
    <section className="flex flex-col w-full lg:w-[400px] xl:w-[450px] shrink-0 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlaySquare className="h-7 w-7 text-gray-900" />
          <h2 className="text-2xl font-bold text-gray-900">Danh sách video</h2>
        </div>
        <span className="rounded-full bg-[#1f6f5e]/10 px-4 py-1.5 text-xs font-bold text-[#1f6f5e]">
          {videos.length} Videos
        </span>
      </div>

      {videos.length === 0 ? (
        <div className="mt-8 flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50">
          <p className="text-sm font-medium text-gray-500">Chưa có video nào.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {videos.map((video) => (
            <div
              key={video._id}
              className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              {/* Thumbnail */}
              <div
                className="group/thumb relative h-20 w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-blue-50"
                onClick={() => onPlay(video)}
              >
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    width={128}
                    height={80}
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    preload="metadata"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm">
                    <PlaySquare className="h-4 w-4 fill-white text-white" />
                  </div>
                </div>
                <div className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 py-1 pr-20">
                <h3 className="truncate text-sm font-bold text-gray-900">{video.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {video.isPublished ? "PUBLISHED" : "DRAFT"}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    {formatDateRelative(video.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 opacity-0 transition-all group-hover:opacity-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(video)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100"
                    title="Cập nhật video"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <Link
                  href={`/teacher/courses/${slug}/videos/${video._id}/exercises`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                  title="Quản lý bài tập"
                >
                  <FilePlus className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(video._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                  title="Xóa video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
