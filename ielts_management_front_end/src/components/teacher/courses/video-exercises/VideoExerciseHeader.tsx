import Link from "next/link";

interface VideoExerciseHeaderProps {
  slug: string;
  courseTitle?: string;
  videoTitle?: string;
}

export default function VideoExerciseHeader({
  slug,
  courseTitle,
  videoTitle,
}: VideoExerciseHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/teacher/courses/${slug}/videos`}
        className="inline-flex w-fit items-center text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 transition-colors hover:text-gray-900"
      >
        Quay lại danh sách video
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          Tạo bài tập cho video
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          {courseTitle ? `Khoa hoc: ${courseTitle}. ` : ""}
          {videoTitle ? `Video: ${videoTitle}.` : "Chon video de bat dau."}
        </p>
      </div>
    </div>
  );
}
