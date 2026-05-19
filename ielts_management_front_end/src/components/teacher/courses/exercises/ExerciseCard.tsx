"use client";

import { Exercise } from "../TeacherVideoList";
import { FileText, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ExerciseCardProps {
  exercise: Exercise;
  onDeleteRequest?: (exerciseId: string) => void;
}

export default function ExerciseCard({ exercise, onDeleteRequest }: ExerciseCardProps) {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const questionCount = exercise.questions?.length || 0;

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Icon/Thumbnail */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
        <FileText className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-20">
        <h3 className="truncate text-sm font-bold text-gray-900">{exercise.title}</h3>
        <p className="mt-1 truncate text-xs font-medium text-gray-500">
          {exercise.description || "Bài tập rèn luyện kỹ năng"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            {questionCount} Câu hỏi
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            {new Date(exercise.createdAt || Date.now()).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 opacity-0 transition-all group-hover:opacity-100">
        <Link
          href={`/teacher/courses/${slug}/videos/${exercise.videoId}/exercises/${exercise._id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100"
          title="Chỉnh sửa bài tập"
        >
          <Edit className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDeleteRequest?.(exercise._id)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
          title="Xóa bài tập"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
