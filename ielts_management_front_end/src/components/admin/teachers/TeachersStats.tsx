import React, { useEffect, useState } from 'react';
import { GraduationCap, UserCheck, UserX, BookOpen } from 'lucide-react';
import { userService } from '@/services/userService';

export function TeachersStats() {
  const [statsData, setStatsData] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    blockedTeachers: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    userService.getAdminTeacherStats().then(res => {
      const data = (res as any).data || res;
      if (data) {
        setStatsData({
          totalTeachers: data.totalTeachers || 0,
          activeTeachers: data.activeTeachers || 0,
          blockedTeachers: data.blockedTeachers || 0,
          totalCourses: data.totalCourses || 0,
        });
      }
    }).catch(err => console.error("Failed to load teacher stats:", err));
  }, []);

  const activeRate = statsData.totalTeachers > 0 
    ? Math.round((statsData.activeTeachers / statsData.totalTeachers) * 100) 
    : 0;

  const stats = [
    {
      title: "Tổng số Giảng viên",
      value: statsData.totalTeachers.toLocaleString('vi-VN'),
      badge: "Toàn hệ thống",
      icon: GraduationCap,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Đang giảng dạy",
      value: statsData.activeTeachers.toLocaleString('vi-VN'),
      badge: `${activeRate}% Tỷ lệ hoạt động`,
      icon: UserCheck,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Tài khoản bị khóa",
      value: statsData.blockedTeachers.toLocaleString('vi-VN'),
      badge: "Vô hiệu hóa",
      icon: UserX,
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },
    {
      title: "Tổng số Khóa học",
      value: statsData.totalCourses.toLocaleString('vi-VN'),
      badge: "Học phần online",
      icon: BookOpen,
      iconBg: "bg-teal-500/20",
      iconColor: "text-teal-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className="text-xs text-white/50 font-medium px-2 py-1 bg-white/5 rounded-full">
                {stat.badge}
              </span>
            </div>
            
            <div>
              <p className="text-white/60 text-sm mb-1">{stat.title}</p>
              <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
