"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw, Calendar, X } from "lucide-react";
import { courseService, TeacherStudentsOverview } from "@/services/courseService";
import { TeacherStudentsHeader } from "@/components/teacher/students/TeacherStudentsHeader";
import { TeacherStudentsTable } from "@/components/teacher/students/TeacherStudentsTable";

export default function TeacherStudentsPage() {
  const [data, setData] = useState<TeacherStudentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateFilterPreset, setDateFilterPreset] = useState<"all" | "today" | "7days" | "30days" | "thisMonth" | "custom">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getTeacherStudents(
        selectedCourseId,
        search,
        filterStatus,
        startDate,
        endDate
      );
      if (res.status === "success" && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error loading teacher students:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, search, filterStatus, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleExportCSV = () => {
    if (!data || !data.enrollments || data.enrollments.length === 0) return;

    const headers = [
      "STT",
      "Họ tên",
      "Email",
      "Số điện thoại",
      "Khóa học",
      "Cấp độ",
      "Ngày tham gia",
      "Tiến độ (%)",
      "Kết quả Thi thử #1",
      "Kết quả Thi thử #2",
      "Trạng thái",
    ];

    const rows = data.enrollments.map((item, idx) => {
      const u = item.userId || {};
      const c = item.courseId || {};
      const dateStr = new Date(item.enrollmentDate).toLocaleDateString("vi-VN");
      const statusText =
        item.status === "completed" || item.progress === 100
          ? "Hoàn thành"
          : item.status === "dropped"
          ? "Tạm dừng"
          : "Đang học";

      const pt1 = item.placementTests && item.placementTests[0]
        ? `${item.placementTests[0].totalScore}/${item.placementTests[0].maxScore} (${new Date(item.placementTests[0].date).toLocaleDateString("vi-VN")})`
        : "Chưa làm";
      const pt2 = item.placementTests && item.placementTests[1]
        ? `${item.placementTests[1].totalScore}/${item.placementTests[1].maxScore} (${new Date(item.placementTests[1].date).toLocaleDateString("vi-VN")})`
        : "Chưa làm";

      return [
        idx + 1,
        `"${(u.name || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        `"${(u.phone || "").replace(/"/g, '""')}"`,
        `"${(c.title || "").replace(/"/g, '""')}"`,
        `"${(c.level || "").replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        item.progress || 0,
        `"${pt1}"`,
        `"${pt2}"`,
        `"${statusText}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `danh_sach_hoc_vien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full min-h-screen pb-12">
      {/* KPI Header */}
      <TeacherStudentsHeader summary={data?.summary} isFiltered={Boolean(startDate || endDate)} />

      {/* Main Container */}
      <div className="px-6 flex-1 flex flex-col">
        <div className="flex-1 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-sm flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo họ tên hoặc email..."
                className="w-full rounded-full border border-gray-200/80 bg-white/80 py-2 pl-10 pr-4 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#1f6f5e] focus:outline-none focus:ring-1 focus:ring-[#1f6f5e]"
              />
            </div>

            {/* Right Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Course Selector */}
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="rounded-full border border-gray-200/80 bg-white/80 py-2 pl-9 pr-8 text-xs font-medium text-gray-700 focus:border-[#1f6f5e] focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả khóa học ({data?.courses?.length || 0})</option>
                  {data?.courses?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} {c.level ? `(${c.level})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 rounded-full bg-gray-100/80 p-1">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Đang học" },
                  { value: "completed", label: "Hoàn thành" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      filterStatus === tab.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => void loadData()}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/80 bg-white/80 text-gray-600 hover:bg-gray-100 transition-colors"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#1f6f5e]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Time Filter Bar */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 transition-all shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1f6f5e]/10 text-[#1f6f5e]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Lọc học viên theo thời gian</h3>
                  <p className="text-[11px] text-gray-500">Lọc danh sách & thống kê học viên tham gia từ ngày đến ngày</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'today', label: 'Hôm nay' },
                  { id: '7days', label: '7 ngày qua' },
                  { id: '30days', label: '30 ngày qua' },
                  { id: 'thisMonth', label: 'Tháng này' },
                  { id: 'custom', label: 'Từ ngày - Đến ngày...' },
                ].map((preset) => {
                  const isActive = dateFilterPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setDateFilterPreset(preset.id as any);
                        if (preset.id === 'all') {
                          setStartDate('');
                          setEndDate('');
                        } else if (preset.id === 'today') {
                          const now = new Date().toISOString().split('T')[0];
                          setStartDate(now);
                          setEndDate(now);
                        } else if (preset.id === '7days') {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 6);
                          setStartDate(start.toISOString().split('T')[0]);
                          setEndDate(end.toISOString().split('T')[0]);
                        } else if (preset.id === '30days') {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 29);
                          setStartDate(start.toISOString().split('T')[0]);
                          setEndDate(end.toISOString().split('T')[0]);
                        } else if (preset.id === 'thisMonth') {
                          const now = new Date();
                          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                          setStartDate(firstDay.toISOString().split('T')[0]);
                          setEndDate(lastDay.toISOString().split('T')[0]);
                        } else if (preset.id === 'custom') {
                          if (!startDate) {
                            const now = new Date();
                            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                            setStartDate(firstDay.toISOString().split('T')[0]);
                          }
                          const now = new Date();
                          setEndDate(now.toISOString().split('T')[0]);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1f6f5e] text-white shadow-sm'
                          : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 border border-gray-200/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {dateFilterPreset === 'custom' && (
              <div className="w-full flex flex-wrap items-center justify-end gap-3 pt-3 mt-3 border-t border-gray-100 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Từ ngày:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-50 text-gray-900 text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:border-[#1f6f5e] focus:outline-none transition-colors cursor-pointer font-medium"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Đến ngày:</label>
                  <input
                    type="date"
                    value={endDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-50 text-gray-900 text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:border-[#1f6f5e] focus:outline-none transition-colors cursor-pointer font-medium"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDateFilterPreset('all');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
                    title="Xóa bộ lọc"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Students Table */}
          <TeacherStudentsTable
            enrollments={data?.enrollments || []}
            isLoading={loading}
            onExportCSV={handleExportCSV}
            isFiltered={Boolean(startDate || endDate)}
          />
        </div>
      </div>
    </div>
  );
}
