"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Loader2 } from 'lucide-react';
import { courseService } from '@/services/courseService';

interface StudentsFilterProps {
  filters: {
    search: string;
    status: string;
    courseId: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    status: string;
    courseId: string;
  }>>;
}

export function StudentsFilter({ filters, setFilters }: StudentsFilterProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { userService } = await import('@/services/userService');
      const response = await userService.getAdminStudents({
        page: 1,
        limit: 9999,
        search: filters.search || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        courseId: filters.courseId !== "all" ? filters.courseId : undefined,
      });

      const list = response.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        alert("Không có học viên nào phù hợp với bộ lọc để xuất!");
        return;
      }

      const headers = ["ID", "Họ tên", "Email", "Trạng thái", "Khóa học", "Điểm Placement Test", "Mốc thời gian"];
      const rows = list.map((s: any) => [
        `"${s.id || ''}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${s.email || ''}"`,
        `"${s.status === 'active' ? 'Hoạt động' : 'Bị khóa'}"`,
        `"${(s.courses || '').replace(/"/g, '""')}"`,
        `"${s.score !== undefined ? s.score : 'Chưa có'}"`,
        `"${s.courseSubtext || ''}"`
      ]);

      // \uFEFF là BOM giúp Excel đọc tiếng Việt UTF-8 không bị lỗi font
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `danh_sach_hoc_vien_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi xuất CSV:", error);
      alert("Đã xảy ra lỗi khi tải xuống file CSV!");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resAdmin = await courseService.getPublicCourses();
        const listAdmin = (resAdmin as any).data || resAdmin;
        if (Array.isArray(listAdmin) && listAdmin.length > 0) {
          setCourses(listAdmin);
          return;
        }
      } catch (err) {
        console.warn("getAllCourses failed, trying public API...", err);
      }

      try {
        // Fallback sang Public API nếu Admin API lỗi hoặc rỗng
        const resPublic = await courseService.getPublicCourses();
        const listPublic = (resPublic as any).data || resPublic;
        if (Array.isArray(listPublic)) {
          setCourses(listPublic);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            placeholder="Tìm theo tên hoặc email..."
          />
        </div>

        {/* Status Select */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60 whitespace-nowrap">Trạng thái:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none min-w-[140px] cursor-pointer"
          >
            <option value="all" className="bg-[#0f2326] text-white">Tất cả</option>
            <option value="active" className="bg-[#0f2326] text-white">Hoạt động</option>
            <option value="blocked" className="bg-[#0f2326] text-white">Bị khóa</option>
          </select>
        </div>

        {/* Course Select */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60 whitespace-nowrap">Khóa học:</label>
          <select
            value={filters.courseId}
            onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none min-w-[180px] cursor-pointer max-w-[250px] truncate"
          >
            <option value="all" className="bg-[#0f2326] text-white">Tất cả khóa học</option>
            {courses.map((c, idx) => {
              const idVal = String(c._id || c.id || idx);
              return (
                <option key={idVal} value={idVal} className="bg-[#0f2326] text-white">
                  {c.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </button>
      </div>
    </div>
  );
}
