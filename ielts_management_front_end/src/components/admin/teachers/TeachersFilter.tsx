"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';

interface TeachersFilterProps {
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

export function TeachersFilter({ filters, setFilters }: TeachersFilterProps) {
  const [exporting, setExporting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    import('@/services/courseService').then(({ courseService }) => {
      courseService.getAllCourses().then(res => {
        const list = (res as any).data || res || [];
        setCourses(Array.isArray(list) ? list : []);
      }).catch(err => console.error("Lỗi tải danh sách khóa học:", err));
    });
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { userService } = await import('@/services/userService');
      const response = await userService.getAdminTeachers({
        page: 1,
        limit: 9999,
        search: filters.search || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        courseId: filters.courseId !== "all" ? filters.courseId : undefined,
      });

      const list = response.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        alert("Không có giảng viên nào phù hợp để xuất!");
        return;
      }

      const headers = ["ID", "Họ tên", "Email", "Trạng thái", "Khóa học phụ trách", "Ngày tham gia"];
      const rows = list.map((item: any) => [
        `"${item.id}"`,
        `"${item.name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.status || ''}"`,
        `"${item.courses || ''}"`,
        `"${item.joinedAt || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `danh_sach_giang_vien_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Lỗi xuất file CSV giảng viên:", err);
      alert("Xuất CSV thất bại!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 transition-all"
            placeholder="Tìm kiếm giảng viên theo họ tên hoặc email..."
          />
        </div>

        {/* Status Select */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60 whitespace-nowrap">Trạng thái:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 appearance-none min-w-[130px] cursor-pointer"
          >
            <option value="all" className="bg-[#0f2326] text-white">Tất cả</option>
            <option value="active" className="bg-[#0f2326] text-white">Hoạt động</option>
            <option value="blocked" className="bg-[#0f2326] text-white">Bị khóa</option>
          </select>
        </div>

        {/* Course Select */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/60 whitespace-nowrap">Khóa học:</label>
          <select
            value={filters.courseId}
            onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 appearance-none min-w-[160px] max-w-[200px] truncate cursor-pointer"
          >
            <option value="all" className="bg-[#0f2326] text-white">Tất cả khóa học</option>
            {courses.map((c: any) => (
              <option key={c.id || c._id} value={c.id || c._id} className="bg-[#0f2326] text-white">
                {c.title || c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <button 
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl transition-colors text-sm font-semibold disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin text-yellow-400" /> : <Download className="w-4 h-4 text-yellow-400" />}
          {exporting ? 'Đang xuất CSV...' : 'Xuất danh sách CSV'}
        </button>
      </div>
    </div>
  );
}
