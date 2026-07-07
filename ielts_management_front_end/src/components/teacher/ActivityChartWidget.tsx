"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { courseService, TeacherEnrollmentStats } from "@/services/courseService";
import Link from "next/link";

export function ActivityChartWidget() {
  const [stats, setStats] = useState<TeacherEnrollmentStats | null>(null);

  useEffect(() => {
    courseService
      .getTeacherEnrollmentStats()
      .then((res) => {
        if (res.status === "success" && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.error("Error fetching enrollment stats:", err));
  }, []);

  const defaultChartData = [
    { day: "T2", value: 15, count: 0, active: false },
    { day: "T3", value: 15, count: 0, active: false },
    { day: "T4", value: 15, count: 0, active: false },
    { day: "T5", value: 15, count: 0, active: false },
    { day: "T6", value: 15, count: 0, active: false },
    { day: "T7", value: 15, count: 0, active: false },
    { day: "CN", value: 30, count: 0, active: true },
  ];

  const chartData = stats?.chartData || defaultChartData;
  const totalEnrolls = stats?.totalEnrollments ?? 0;
  const newThisWeek = stats?.newThisWeek ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const publishedCourses = stats?.publishedCourses ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Enrollments Chart */}
      <div className="flex flex-col justify-between rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Học viên mới trong tuần</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-light text-gray-900">{totalEnrolls}</span>
              <span className="mb-1 text-xs text-emerald-600 font-medium">+{newThisWeek} tuần này</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Tổng học viên các lớp phụ trách</p>
          </div>
          <Link href="/teacher/courses" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowUpRight className="h-4 w-4 text-gray-600" />
          </Link>
        </div>

        <div className="mt-8 flex h-32 items-end justify-between px-2 relative">
          {/* Center dashed line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>

          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10">
              <div className="relative flex w-2 justify-center">
                {d.active && (
                  <div className="absolute -top-8 rounded-full bg-[#ffb800] px-2 py-1 text-[10px] font-medium whitespace-nowrap shadow-sm text-gray-900">
                    {d.count} Enrolls
                  </div>
                )}
                <div
                  className={`w-2 rounded-full transition-all duration-500 ${d.active ? "bg-[#ffb800]" : "bg-gray-800"
                    }`}
                  style={{ height: `${Math.max(d.value, 15)}%` }}
                  title={`${d.day}: ${d.count} học viên`}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Published Courses Summary */}
      <div className="flex flex-col items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div className="w-full flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Khóa học phụ trách</h3>
            <p className="text-xs text-gray-500 mt-0.5">Lớp giảng dạy & trợ giảng</p>
          </div>
          <Link href="/teacher/courses" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowUpRight className="h-4 w-4 text-gray-600" />
          </Link>
        </div>

        <div className="relative my-4 flex h-36 w-36 items-center justify-center">
          {/* Circular dashed border */}
          <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
            <circle
              cx="72"
              cy="72"
              r="62"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="6"
              strokeDasharray="4 4"
            />
            <circle
              cx="72"
              cy="72"
              r="62"
              fill="transparent"
              stroke="#1f6f5e"
              strokeWidth="6"
              strokeDasharray={`${totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 390) : 0} 390`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{publishedCourses} <span className="text-sm font-normal text-gray-400">/ {totalCourses}</span></div>
            <div className="text-[11px] font-medium text-[#1f6f5e] mt-1">Đã xuất bản</div>
          </div>
        </div>

        <div className="flex w-full justify-between items-center pt-2 border-t border-gray-100 text-xs text-gray-600 font-medium">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-600" /> Tổng học viên: <strong>{totalEnrolls}</strong></span>
          <span className="text-emerald-600 font-semibold">Hoạt động tốt</span>
        </div>
      </div>
    </div>
  );
}
