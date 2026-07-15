import React from "react";
import { Users, CheckCircle2, GraduationCap, TrendingUp } from "lucide-react";
import { TeacherStudentsOverview } from "@/services/courseService";

interface TeacherStudentsHeaderProps {
  summary?: TeacherStudentsOverview["summary"];
  isFiltered?: boolean;
}

export function TeacherStudentsHeader({ summary, isFiltered }: TeacherStudentsHeaderProps) {
  const totalStudents = summary?.totalStudents || 0;
  const activeCount = summary?.activeCount || 0;
  const completedCount = summary?.completedCount || 0;
  const avgProgress = summary?.avgProgress || 0;

  return (
    <div className="mb-6 flex flex-col justify-between gap-6 px-6 lg:flex-row lg:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Student Management</p>
        <h1 className="text-4xl font-normal text-gray-900 md:text-5xl flex flex-wrap items-center gap-3">
          <span>My <span className="font-medium text-[#1f6f5e]">Students</span></span>
          {isFiltered && (
            <span className="text-xs px-3 py-1 rounded-full bg-[#1f6f5e]/10 text-[#1f6f5e] font-semibold border border-[#1f6f5e]/20">
              Đang lọc theo thời gian
            </span>
          )}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600">
          Theo dõi tiến độ hoàn thành khóa học, trạng thái hoạt động và quản lý chi tiết từng học viên trong các lớp do bạn phụ trách.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Total Students */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f6f5e]/10 text-[#1f6f5e]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Tổng học viên</p>
            <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>

        {/* Active Students */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Đang học</p>
            <p className="text-lg font-bold text-emerald-600">{activeCount}</p>
          </div>
        </div>

        {/* Completed Students */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Hoàn thành</p>
            <p className="text-lg font-bold text-blue-600">{completedCount}</p>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Tiến độ TB</p>
            <p className="text-lg font-bold text-amber-600">{avgProgress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
