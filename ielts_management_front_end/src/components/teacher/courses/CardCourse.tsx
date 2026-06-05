import Link from "next/link";
import clsx from "clsx";
import type { TeacherCourseItem } from "@/types";

interface CardCourseProps {
  course: TeacherCourseItem;
}

const statusTone = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "review":
      return "bg-amber-100 text-amber-700";
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "invited":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const CardCourse = ({ course }: CardCourseProps) => {
  return (
    <Link
      href={`/teacher/courses/${course.slug}`}
      className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f6f5e]/40 hover:shadow-md"
    >
      {course.publicInfo?.thumbnail ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${course.publicInfo.thumbnail})` }}
          />
          {/* ĐÃ SỬA: Dùng gradient thay cho bg-white/80 để phần giữa trong suốt hơn */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/20 to-white/90 transition-all group-hover:via-white/10" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-white/80" />
      )}

      {/* Các đốm màu trang trí (có thể giảm opacity nếu vẫn thấy hơi rối) */}
      <div className="pointer-events-none absolute z-0 -right-12 -top-12 h-24 w-24 rounded-full bg-[#1f6f5e]/10 blur-2xl" />
      <div className="pointer-events-none absolute z-0 -bottom-12 -left-10 h-24 w-24 rounded-full bg-[#ffb800]/15 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-500">
              {course.category} • {course.level}
            </p>
          </div>
          <span
            className={clsx(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm capitalize",
              statusTone(course.status)
            )}
          >
            {course.status}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 text-xs text-gray-700 font-medium">
          <span>Học viên: {course.totalStudents ?? 0}</span>
          {course.updatedAt && (
            <span>Cập nhật: {new Date(course.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        <div className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-[#1f6f5e] opacity-0 transition group-hover:opacity-100">
          Xem chi tiết
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
};

export default CardCourse;