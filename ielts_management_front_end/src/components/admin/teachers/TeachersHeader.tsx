"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '@/services/userService';
import { GraduationCap, UserPlus } from 'lucide-react';

export function TeachersHeader() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    userService.getAdminTeacherStats().then(res => {
      const data = (res as any).data || res;
      if (data?.totalTeachers !== undefined) {
        setTotal(data.totalTeachers);
      }
    }).catch(err => console.error("Failed to fetch teacher header stats:", err));
  }, []);

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <GraduationCap className="w-4 h-4 text-yellow-400" />
          <span>Đội ngũ Giảng dạy</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Quản lý Giảng viên
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Quản lý {total !== null ? `đội ngũ ${total.toLocaleString('vi-VN')} Giảng viên` : 'đội ngũ Giảng viên'} chính thức và các khóa học phụ trách.
        </p>
      </div>

      <Link
        href="/admin/students"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm shadow-lg shadow-yellow-400/20 transition-all active:scale-95 flex-shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        <span>+ Thăng cấp từ Học viên</span>
      </Link>
    </div>
  );
}
