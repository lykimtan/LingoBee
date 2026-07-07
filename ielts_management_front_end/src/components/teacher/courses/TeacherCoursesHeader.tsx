import { useMemo } from "react";
import { TeacherCourseItem } from "@/types";
import { BookOpen, Video, Clock } from "lucide-react";

interface TeacherCoursesHeaderProps {
  courses?: TeacherCourseItem[];
}

export function TeacherCoursesHeader({ courses = [] }: TeacherCoursesHeaderProps) {
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalVideos = courses.reduce((acc, c) => acc + (c.totalVideos || 0), 0);
    const totalHoursRaw = courses.reduce((acc, c) => acc + (c.durationInHours || 0), 0);
    const totalHours = Number(totalHoursRaw.toFixed(1));
    return { totalCourses, totalVideos, totalHours };
  }, [courses]);

  return (
    <div className="mb-6 flex flex-col justify-between gap-6 px-6 lg:flex-row lg:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Teaching space</p>
        <h1 className="text-4xl font-normal text-gray-900 md:text-5xl">
          My <span className="font-medium text-[#1f6f5e]">Class</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600">
          Theo dõi các khóa học bạn đang phụ trách, quản lý nội dung video bài giảng và thống kê thời lượng giảng dạy.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f6f5e]/10 text-[#1f6f5e]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Khóa học</p>
            <p className="text-base font-bold text-gray-900">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Tổng video</p>
            <p className="text-base font-bold text-gray-900">{stats.totalVideos}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Tổng thời lượng</p>
            <p className="text-base font-bold text-[#1f6f5e]">{stats.totalHours} <span className="text-xs font-normal text-gray-500">giờ</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
