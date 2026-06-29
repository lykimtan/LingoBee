"use client";

import React, { useMemo } from "react";
import { AdminCourseItem } from "@/types";
import { BookOpen, Users, Star, Award, TrendingUp, BarChart3, CheckCircle2, Clock } from "lucide-react";

interface CourseStatisticsProps {
  courses: AdminCourseItem[];
  isLoading: boolean;
  onSelectCourse?: (courseId: string) => void;
}

export function CourseStatistics({ courses, isLoading, onSelectCourse }: CourseStatisticsProps) {
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === "published").length;
    const reviewCourses = courses.filter((c) => c.status === "review").length;
    const draftCourses = courses.filter((c) => c.status === "draft").length;

    const totalStudents = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);

    const ratedCourses = courses.filter((c) => (c.averageRating || 0) > 0);
    const avgRating = ratedCourses.length > 0
      ? (ratedCourses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / ratedCourses.length).toFixed(1)
      : "0.0";

    // Group by category
    const categoryMap: Record<string, { count: number; students: number }> = {};
    courses.forEach((c) => {
      const cat = c.category || "khác";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, students: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].students += c.totalStudents || 0;
    });

    const categoryList = Object.entries(categoryMap).map(([key, val]) => ({
      category: key,
      count: val.count,
      students: val.students,
      percentage: totalCourses > 0 ? Math.round((val.count / totalCourses) * 100) : 0,
    })).sort((a, b) => b.students - a.students);

    // Group by level
    const levelMap: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    courses.forEach((c) => {
      if (c.level && levelMap[c.level] !== undefined) {
        levelMap[c.level] += 1;
      }
    });
    const levelList = Object.entries(levelMap).map(([lvl, cnt]) => ({
      level: lvl,
      count: cnt,
    }));

    // Top courses by students
    const topCourses = [...courses]
      .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
      .slice(0, 5);

    return {
      totalCourses,
      publishedCourses,
      reviewCourses,
      draftCourses,
      totalStudents,
      avgRating,
      categoryList,
      levelList,
      topCourses,
    };
  }, [courses]);

  const categoryNames: Record<string, string> = {
    speaking: "Speaking (Nói)",
    listening: "Listening (Nghe)",
    reading: "Reading (Đọc)",
    writing: "Writing (Viết)",
    "full-test": "Full Test (Toàn diện)",
    grammar: "Grammar (Ngữ pháp)",
    vocabulary: "Vocabulary (Từ vựng)",
    khác: "Chưa phân loại",
  };

  const categoryColors: Record<string, string> = {
    speaking: "bg-[#ffb800]",
    listening: "bg-[#3b82f6]",
    reading: "bg-[#1f6f5e]",
    writing: "bg-[#8b5cf6]",
    "full-test": "bg-[#ec4899]",
    grammar: "bg-[#f97316]",
    vocabulary: "bg-[#06b6d4]",
    khác: "bg-gray-500",
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffb800] border-t-transparent" />
          <span>Đang tổng hợp dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-white">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Thống Kê Khóa Học</h2>
        <p className="text-sm text-white/60">Tổng hợp phân tích quy mô, lượng học viên và mức độ tương tác của các khóa học.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng khóa học</span>
            <BookOpen className="h-5 w-5 text-[#ffb800]" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats.totalCourses}</span>
            <span className="rounded-full bg-[#1f6f5e]/30 px-2 py-0.5 text-xs text-emerald-300 border border-[#1f6f5e]/50">
              {stats.publishedCourses} đang mở
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-xs font-medium uppercase tracking-wider">Lượt đăng ký</span>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats.totalStudents.toLocaleString()}</span>
            <span className="flex items-center gap-1 text-xs text-blue-300">
              <TrendingUp className="h-3.5 w-3.5" /> Thường xuyên
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-xs font-medium uppercase tracking-wider">Đánh giá TB</span>
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-yellow-400">{stats.avgRating} ★</span>
            <span className="text-xs text-white/50">Chất lượng cao</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-xs font-medium uppercase tracking-wider">Trạng thái duyệt</span>
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {stats.publishedCourses} Đã duyệt
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Clock className="h-3.5 w-3.5" /> {stats.reviewCourses} Chờ duyệt
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Category Breakdown & Level Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md backdrop-blur-md">
          <div>
            <h3 className="text-lg font-medium text-white">Phân Bổ Theo Kỹ Năng</h3>
            <p className="text-xs text-white/50">Tỷ trọng số lượng khóa học và học viên đăng ký theo từng kỹ năng</p>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {stats.categoryList.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/40">Chưa có dữ liệu phân bổ kỹ năng.</p>
            ) : (
              stats.categoryList.map((item) => {
                const colorClass = categoryColors[item.category] || "bg-gray-500";
                return (
                  <div key={item.category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white/90">
                        {categoryNames[item.category] || item.category}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <span>{item.count} khóa</span>
                        <span className="font-semibold text-[#ffb800]">{item.students} học viên</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md backdrop-blur-md">
          <div>
            <h3 className="text-lg font-medium text-white">Phân Bổ Trình Độ (CEFR)</h3>
            <p className="text-xs text-white/50">Số lượng khóa học tương ứng với các khung cấp độ từ A1 đến C2</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {stats.levelList.map((lvl) => (
              <div
                key={lvl.level}
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-center transition hover:bg-white/10 hover:border-white/20"
              >
                <span className="text-2xl font-bold text-[#ffb800]">{lvl.level}</span>
                <span className="mt-1 text-xl font-semibold text-white">{lvl.count}</span>
                <span className="text-[11px] text-white/50">khóa học</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">Top Khóa Học Quan Tâm Nhất</h3>
            <p className="text-xs text-white/50">Các khóa học thu hút số lượng học viên đăng ký đông đảo nhất</p>
          </div>
          <Award className="h-6 w-6 text-[#ffb800]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase text-white/50">
                <th className="pb-3 pr-4">Hạng</th>
                <th className="pb-3 px-4">Tên Khóa Học</th>
                <th className="pb-3 px-4">Kỹ Năng</th>
                <th className="pb-3 px-4">Trình Độ</th>
                <th className="pb-3 px-4 text-right">Học Viên</th>
                <th className="pb-3 pl-4 text-right">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.topCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/40">Chưa có dữ liệu khóa học.</td>
                </tr>
              ) : (
                stats.topCourses.map((course, idx) => (
                  <tr key={course._id || idx} onClick={() => course._id && onSelectCourse?.(course._id)} className="group transition hover:bg-white/10 cursor-pointer">
                    <td className="py-3 pr-4 font-bold text-[#ffb800]">#{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-white">{course.title}</td>
                    <td className="py-3 px-4 uppercase text-xs tracking-wider text-white/70">{course.category || "Khác"}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                        {course.level || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                      {(course.totalStudents || 0).toLocaleString()}
                    </td>
                    <td className="py-3 pl-4 text-right text-yellow-400 font-medium">
                      {Number(course.averageRating || 0).toFixed(1)} ★
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
