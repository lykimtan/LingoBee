import { Users, GraduationCap, BookOpen, Clock } from "lucide-react";

interface TopStatsProps {
  activeStudents?: number;
  totalTeachers?: number;
  ongoingCourses?: number;
}

export function TopStats({ activeStudents, totalTeachers, ongoingCourses }: TopStatsProps) {
  const stats = [
    { label: "Học viên tích cực", value: activeStudents !== undefined ? activeStudents.toLocaleString() : "...", icon: Users },
    { label: "Tổng số giáo viên", value: totalTeachers !== undefined ? totalTeachers.toLocaleString() : "...", icon: GraduationCap },
    { label: "Khóa học đã xuất bản", value: ongoingCourses !== undefined ? ongoingCourses.toLocaleString() : "...", icon: BookOpen },
  ];

  return (
    <div className="mb-6 flex flex-col justify-between gap-6 px-6 md:flex-row md:items-end">
      <div>
        <h1 className="text-4xl font-normal text-white md:text-5xl">
          Welcome back, <span className="font-medium text-[#ffb800]">Admin</span>
        </h1>
      </div>

      <div className="flex gap-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-4xl font-light text-white md:text-5xl">{stat.value}</span>
                <span className="flex items-center gap-1 text-sm text-white/60">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
