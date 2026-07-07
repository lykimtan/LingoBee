"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { courseService, TeacherStudentsOverview } from "@/services/courseService";
import { TeacherStudentsHeader } from "@/components/teacher/students/TeacherStudentsHeader";
import { TeacherStudentsTable } from "@/components/teacher/students/TeacherStudentsTable";

export default function TeacherStudentsPage() {
  const [data, setData] = useState<TeacherStudentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getTeacherStudents(
        selectedCourseId,
        search,
        filterStatus
      );
      if (res.status === "success" && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error loading teacher students:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, search, filterStatus]);

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
      <TeacherStudentsHeader summary={data?.summary} />

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

          {/* Students Table */}
          <TeacherStudentsTable
            enrollments={data?.enrollments || []}
            isLoading={loading}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>
    </div>
  );
}
