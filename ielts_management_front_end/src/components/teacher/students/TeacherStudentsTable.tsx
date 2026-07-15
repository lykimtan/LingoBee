"use client";

import React from "react";
import Image from "next/image";
import { Download, CheckCircle2, Clock, AlertTriangle, User, BookOpen } from "lucide-react";
import { TeacherStudentEnrollment } from "@/services/courseService";

interface TeacherStudentsTableProps {
  enrollments: TeacherStudentEnrollment[];
  isLoading: boolean;
  onExportCSV: () => void;
  isFiltered?: boolean;
}

export function TeacherStudentsTable({
  enrollments,
  isLoading,
  onExportCSV,
  isFiltered,
}: TeacherStudentsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-16 w-full animate-pulse rounded-2xl bg-gray-100/80" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table Action Bar */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <span>Danh sách ({enrollments.length} lượt đăng ký)</span>
          {isFiltered && <span className="text-[#1f6f5e] font-bold">• Đang lọc theo thời gian</span>}
        </span>
        <button
          onClick={onExportCSV}
          disabled={enrollments.length === 0}
          className="flex items-center gap-1.5 rounded-full bg-[#1f6f5e] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#18584b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Xuất danh sách (CSV / Excel)</span>
        </button>
      </div>

      {/* Table Container */}
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <BookOpen className="h-10 w-10 text-gray-300 mb-3" />
          <h4 className="text-sm font-semibold text-gray-700">Không tìm thấy học viên phù hợp</h4>
          <p className="mt-1 text-xs text-gray-400">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc khóa học</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-4">Học viên</th>
                <th className="pb-3">Khóa học</th>
                <th className="pb-3">Ngày tham gia</th>
                <th className="pb-3">Tiến độ học tập</th>
                <th className="pb-3">Thi thử gần nhất (#1)</th>
                <th className="pb-3">Thi thử trước đó (#2)</th>
                <th className="pb-3 pr-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-sm">
              {enrollments.map((item) => {
                const u = item.userId;
                const c = item.courseId;
                const dateStr = new Date(item.enrollmentDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                const progress = Math.min(100, Math.max(0, item.progress || 0));
                let progressColor = "bg-amber-500";
                if (progress >= 80) progressColor = "bg-emerald-600";
                else if (progress >= 40) progressColor = "bg-blue-500";

                return (
                  <tr key={item.enrollmentId} className="group hover:bg-gray-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        {u?.avatar ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 shadow-2xs">
                            <Image src={u.avatar} alt={u.name || "Student"} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-semibold text-sm">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{u?.name || "Học viên ẩn danh"}</p>
                          <p className="text-xs text-gray-400 truncate">{u?.email || "Không có email"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course Title */}
                    <td className="py-3.5 max-w-[220px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-800 truncate" title={c?.title}>
                          {c?.title || "Khóa học đã xóa"}
                        </span>
                        {c?.level && (
                          <span className="w-fit rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {c.level}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Enrollment Date */}
                    <td className="py-3.5 text-xs text-gray-600 whitespace-nowrap">{dateStr}</td>

                    {/* Progress */}
                    <td className="py-3.5 w-44">
                      <div className="flex flex-col gap-1.5 pr-6">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-700">{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Placement Test 1 */}
                    <td className="py-3.5 whitespace-nowrap">
                      {item.placementTests && item.placementTests[0] ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1f6f5e] text-xs">
                            {item.placementTests[0].totalScore} / {item.placementTests[0].maxScore} điểm
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.placementTests[0].date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa làm</span>
                      )}
                    </td>

                    {/* Placement Test 2 */}
                    <td className="py-3.5 whitespace-nowrap">
                      {item.placementTests && item.placementTests[1] ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 text-xs">
                            {item.placementTests[1].totalScore} / {item.placementTests[1].maxScore} điểm
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.placementTests[1].date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa làm</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      {item.status === "completed" || progress === 100 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Hoàn thành</span>
                        </span>
                      ) : item.status === "dropped" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Tạm dừng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Đang học</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
