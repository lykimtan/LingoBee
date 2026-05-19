import CardCourse from "./CardCourse";
import { TeacherCourseItem } from "@/types";

interface TeacherCoursesListProps {
  courses: TeacherCourseItem[];
  isLoading: boolean;
  error?: string | null;
}

export function TeacherCoursesList({ courses, isLoading, error }: TeacherCoursesListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-gray-500">
        Đang tải danh sách khóa học...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-gray-500">
        Bạn chưa có khóa học nào.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {courses.map((course) => (
        <CardCourse key={course._id} course={course} />
      ))}
    </div>
  );
}
