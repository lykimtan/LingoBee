import Image from "next/image";
import { Mail } from "lucide-react";

type CourseUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
};

interface TeacherCourseInstructorCardProps {
  teacher?: CourseUser | null;
  teacherName: string;
}

export default function TeacherCourseInstructorCard({
  teacher,
  teacherName,
}: TeacherCourseInstructorCardProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <h2 className="text-xl font-bold text-gray-900">Giao vien</h2>
      <div className="mt-6 flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
          {teacher?.profilePicture ? (
            <Image
              src={teacher.profilePicture}
              alt="Avatar"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800 text-lg font-bold text-white">
              {teacher?.firstName?.[0] || teacher?.email?.[0]?.toUpperCase() || "T"}
            </div>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{teacherName}</p>
          <p className="text-xs font-medium text-gray-500">Senior Instructor</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-sm font-medium text-gray-600">
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="truncate">{teacher?.email || "Chua cap nhat email"}</span>
      </div>
    </section>
  );
}
