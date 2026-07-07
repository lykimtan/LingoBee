"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  FileCheck,
  PlayCircle,
  Award,
  AlertTriangle,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import { courseService } from "@/services/courseService";
import { toast } from "react-toastify";

interface TeacherCourseAnalyticsTabProps {
  courseId: string;
}

interface StudentInfo {
  _id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  progress: number;
  status: string;
  attemptsCount: number;
  enrollmentDate: string;
}

interface CourseStatsData {
  course: {
    _id: string;
    title: string;
    level?: string;
    targetBand?: string;
  };
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  avgProgress: number;
  totalVideos: number;
  totalAttempts: number;
  pendingGrading: number;
  progressSegments: {
    completed: number;
    inProgress: number;
    started: number;
    notStarted: number;
  };
  topStudents: StudentInfo[];
  needsAttentionStudents: StudentInfo[];
  studentList: StudentInfo[];
}

export const TeacherCourseAnalyticsTab: React.FC<TeacherCourseAnalyticsTabProps> = ({ courseId }) => {
  const [stats, setStats] = useState<CourseStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await courseService.getCourseTeacherStats(courseId);
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        toast.error(res.message || "Không thể tải dữ liệu thống kê khóa học.");
      }
    } catch (error) {
      console.error("Error fetching teacher course stats:", error);
      toast.error("Lỗi kết nối khi tải thống kê.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-white/60 backdrop-blur-md rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1c7c78]/20 animate-pulse" />
          <Loader2 className="w-8 h-8 text-[#1c7c78] animate-spin relative z-10" />
        </div>
        <p className="text-slate-600 font-medium animate-pulse">Đang tổng hợp phân tích học tập khóa học...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-sm">
        <BarChart3 className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Chưa có dữ liệu thống kê</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">Khóa học hiện chưa có học viên đăng ký hoặc dữ liệu chưa được cập nhật.</p>
      </div>
    );
  }

  const filteredStudents = stats.studentList.filter((item) => {
    const matchesSearch =
      item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "completed") return item.progress >= 80;
    if (activeFilter === "inProgress") return item.progress >= 50 && item.progress < 80;
    if (activeFilter === "attention") return item.progress < 40;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Students */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50/80 rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1c7c78]/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#1c7c78]/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Học viên tham gia</span>
            <div className="w-10 h-10 rounded-2xl bg-[#1c7c78]/10 flex items-center justify-center text-[#1c7c78]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalStudents}</span>
            <span className="text-xs font-semibold text-[#1c7c78] bg-[#1c7c78]/10 px-2 py-0.5 rounded-full">
              {stats.completionRate}% hoàn thành
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Tổng số học viên đang theo học</p>
        </div>

        {/* Card 2: Avg Progress */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiến độ trung bình</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.avgProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${stats.avgProgress}%` }}
            />
          </div>
        </div>

        {/* Card 3: Pending Grading */}
        <div className="bg-gradient-to-br from-white via-white to-rose-50/30 rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chờ chấm điểm</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.pendingGrading}</span>
            <span className="text-xs font-medium text-slate-400">bài nộp</span>
          </div>
          <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
            {stats.pendingGrading > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                Cần chấm điểm cho học viên
              </>
            ) : (
              <span className="text-emerald-600">Đã chấm toàn bộ bài nộp</span>
            )}
          </p>
        </div>

        {/* Card 4: Total Videos & Attempts */}
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tài nguyên & Bài tập</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.totalVideos}</span>
              <span className="text-xs text-slate-400 ml-1">video</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.totalAttempts}</span>
              <span className="text-xs text-slate-400 ml-1">lượt nộp</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Đã phát hành cho học viên</p>
        </div>
      </div>

      {/* 2. Middle Section: Progress Breakdown & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Progress Segments Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1c7c78]" />
                  Phân bố tiến độ học tập
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ phân nhóm học viên theo % hoàn thành khóa học</p>
              </div>
            </div>

            {/* Segment Stack Bar */}
            <div className="w-full h-8 rounded-2xl bg-slate-100 flex overflow-hidden p-1 gap-1 mb-6 shadow-inner">
              {stats.totalStudents > 0 ? (
                <>
                  {stats.progressSegments.completed > 0 && (
                    <div
                      style={{ width: `${(stats.progressSegments.completed / stats.totalStudents) * 100}%` }}
                      className="bg-emerald-500 h-full rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden px-1"
                      title={`Hoàn thành xuất sắc: ${stats.progressSegments.completed}`}
                    />
                  )}
                  {stats.progressSegments.inProgress > 0 && (
                    <div
                      style={{ width: `${(stats.progressSegments.inProgress / stats.totalStudents) * 100}%` }}
                      className="bg-[#1c7c78] h-full rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden px-1"
                      title={`Đang tiến triển: ${stats.progressSegments.inProgress}`}
                    />
                  )}
                  {stats.progressSegments.started > 0 && (
                    <div
                      style={{ width: `${(stats.progressSegments.started / stats.totalStudents) * 100}%` }}
                      className="bg-amber-400 h-full rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-900 overflow-hidden px-1"
                      title={`Mới bắt đầu: ${stats.progressSegments.started}`}
                    />
                  )}
                  {stats.progressSegments.notStarted > 0 && (
                    <div
                      style={{ width: `${(stats.progressSegments.notStarted / stats.totalStudents) * 100}%` }}
                      className="bg-slate-300 h-full rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden px-1"
                      title={`Chưa bắt đầu: ${stats.progressSegments.notStarted}`}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Chưa có dữ liệu
                </div>
              )}
            </div>

            {/* Segment Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setActiveFilter("completed")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeFilter === "completed"
                    ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Xuất sắc (80%+)
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.progressSegments.completed}</div>
                <div className="text-[11px] text-slate-400">học viên</div>
              </div>

              <div
                onClick={() => setActiveFilter("inProgress")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeFilter === "inProgress"
                    ? "bg-[#1c7c78]/10 border-[#1c7c78] ring-2 ring-[#1c7c78]/20"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-1.5 text-[#1c7c78] text-xs font-bold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1c7c78]" />
                  Ổn định (50-79%)
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.progressSegments.inProgress}</div>
                <div className="text-[11px] text-slate-400">học viên</div>
              </div>

              <div
                onClick={() => setActiveFilter("all")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeFilter === "all"
                    ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Mới học (1-49%)
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.progressSegments.started}</div>
                <div className="text-[11px] text-slate-400">học viên</div>
              </div>

              <div
                onClick={() => setActiveFilter("attention")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeFilter === "attention"
                    ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Chưa học / Tụt hậu
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.progressSegments.notStarted}</div>
                <div className="text-[11px] text-slate-400">học viên</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Performers Showcase (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#1c7c78]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bảng vàng Top Học Viên</h3>
                  <p className="text-[11px] text-slate-400">Học viên tích cực và xuất sắc nhất khóa</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {stats.topStudents && stats.topStudents.length > 0 ? (
                stats.topStudents.map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? "bg-amber-400 text-slate-950" :
                          idx === 1 ? "bg-slate-300 text-slate-950" :
                            idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-slate-400"
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/20">
                        {st.user?.avatar ? (
                          <Image src={st.user.avatar} alt={st.user.name || "HS"} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-[#1c7c78] text-white">
                            {(st.user?.name || "H").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate max-w-[140px]">{st.user?.name || "Học viên"}</div>
                        <div className="text-[11px] text-slate-400">{st.attemptsCount} bài đã làm</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400">{st.progress}%</span>
                      <div className="w-16 bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${st.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Chưa có học viên nào hoàn thành tiến độ cao.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Students Progress Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Chi tiết tiến độ học viên</h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi chi tiết mức độ hoàn thành bài giảng và bài tập của từng học viên</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên hoặc email học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c7c78]/20 focus:border-[#1c7c78] transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Tất cả ({stats.studentList.length})
              </button>
              <button
                onClick={() => setActiveFilter("attention")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeFilter === "attention" ? "bg-rose-500 text-white shadow-sm" : "text-rose-600 hover:bg-rose-50"}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Cần quan tâm
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Học viên</th>
                <th className="py-4 px-6">Tiến độ khóa học</th>
                <th className="py-4 px-6 text-center">Số bài tập đã nộp</th>
                <th className="py-4 px-6">Ngày tham gia</th>
                <th className="py-4 px-6 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {st.user?.avatar ? (
                            <Image src={st.user.avatar} alt={st.user.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-[#1c7c78] text-white">
                              {(st.user?.name || "H").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{st.user?.name || "Học viên"}</div>
                          <div className="text-xs text-slate-500">{st.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700">{st.progress}% hoàn thành</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${st.progress >= 80 ? "bg-emerald-500" :
                              st.progress >= 50 ? "bg-[#1c7c78]" :
                                st.progress > 0 ? "bg-amber-400" : "bg-slate-300"
                            }`}
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                        {st.attemptsCount} lượt
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {st.enrollmentDate ? new Date(st.enrollmentDate).toLocaleDateString("vi-VN") : "N/A"}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {st.progress >= 100 || st.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hoàn thành
                        </span>
                      ) : st.progress < 30 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/60" title="Học viên tiến độ chậm, cần nhắc nhở">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Cần quan tâm
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          Đang học
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy học viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
