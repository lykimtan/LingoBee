import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';

export function StudentsHeader() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    userService.getAdminStudentStats().then(res => {
      const data = (res as any).data || res;
      if (data?.totalStudents !== undefined) {
        setTotal(data.totalStudents);
      }
    }).catch(err => console.error("Failed to fetch header stats:", err));
  }, []);

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-white mb-2">
        Quản lý Học viên
      </h1>
      <p className="text-white/60 text-sm">
        Quản lý cơ sở dữ liệu {total !== null ? `gồm ${total.toLocaleString('vi-VN')} học viên` : 'học viên'} và hồ sơ học tập.
      </p>
    </div>
  );
}
