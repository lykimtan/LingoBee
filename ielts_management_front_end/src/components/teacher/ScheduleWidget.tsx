"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, Video, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { courseService } from "@/services/courseService";
import { TeacherCourseItem } from "@/types";

export function ScheduleWidget() {
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [allCourses, setAllCourses] = useState<TeacherCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getMyCourses()
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setAllCourses(res.data);
          setCourses(res.data.slice(0, 4)); // Get top 4 most recent courses
        }
      })
      .catch((err) => console.error("Error loading courses for widget:", err))
      .finally(() => setLoading(false));
  }, []);

  const publishedCount = allCourses.filter((c) => c.status === "published").length;
  const draftCount = allCourses.filter((c) => c.status !== "published").length;
  const totalCount = allCourses.length;

  const pieData = [
    { name: "Đã xuất bản", value: publishedCount, color: "#1f6f5e" },
    { name: "Bản nháp", value: draftCount, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tiến độ Khóa học phụ trách</h3>
          <p className="text-xs text-gray-400 mt-0.5">Các lớp được phân công giảng dạy & trợ giảng</p>
        </div>
        <Link
          href="/teacher/courses"
          className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Recharts Pie Chart & Status Overview */}
      {!loading && totalCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-50/70 p-3.5 border border-gray-100/80">
          <div className="flex items-center gap-4 w-full">
            <div className="h-24 w-24 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} khóa`, "Số lượng"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "11px", padding: "4px 8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-bold text-gray-900">{totalCount}</span>
                <span className="text-[9px] text-gray-400">Khóa</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1f6f5e]" />
                  <span className="text-xs font-medium text-gray-700">Đã xuất bản:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">{publishedCount}</span>
                  <span className="text-[10px] text-gray-400">
                    ({totalCount ? Math.round((publishedCount / totalCount) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs font-medium text-gray-700">Bản nháp:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">{draftCount}</span>
                  <span className="text-[10px] text-gray-400">
                    ({totalCount ? Math.round((draftCount / totalCount) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mt-1">
        {loading ? (
          /* Loading Skeletons */
          [...Array(3)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-4 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-36 rounded bg-gray-200" />
                  <div className="h-2.5 w-24 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-xs font-medium text-gray-500">Chưa có khóa học nào được phân công</p>
          </div>
        ) : (
          courses.map((course) => {
            const isPublished = course.status === "published";
            return (
              <Link
                key={course._id}
                href={`/teacher/courses/${course.slug || course._id}`}
                className="group flex items-center justify-between rounded-2xl bg-gray-50/60 p-3.5 hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200/60"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-sm ${
                    isPublished ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                  }`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-gray-900 group-hover:text-[#1f6f5e] transition-colors">
                        {course.title}
                      </h4>
                      {course.level && (
                        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200 shadow-2xs">
                          {course.level}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-indigo-500" />
                        <strong>{course.totalStudents || 0}</strong> học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3 text-blue-500" />
                        <strong>{course.totalVideos || 0}</strong> bài giảng
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <strong>{course.durationInHours || 0}</strong>h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap shadow-2xs ${
                      isPublished
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Xuất bản
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" /> Bản nháp
                      </>
                    )}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
