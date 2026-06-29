import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { userService } from '@/services/userService';

export function StudentsStats() {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newStudents24h: 0
  });

  useEffect(() => {
    userService.getAdminStudentStats().then(res => {
      const data = (res as any).data || res;
      if (data) {
        setStatsData({
          totalStudents: data.totalStudents || 0,
          activeStudents: data.activeStudents || 0,
          newStudents24h: data.newStudents24h || 0
        });
      }
    }).catch(err => console.error("Failed to load student stats:", err));
  }, []);

  const activeRate = statsData.totalStudents > 0 
    ? Math.round((statsData.activeStudents / statsData.totalStudents) * 100) 
    : 0;

  const stats = [
    {
      title: "Tổng số học viên",
      value: statsData.totalStudents.toLocaleString('vi-VN'),
      badge: "Cập nhật thời gian thực",
      icon: Users,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Tài khoản Hoạt động",
      value: statsData.activeStudents.toLocaleString('vi-VN'),
      badge: `${activeRate}% Tỷ lệ hoạt động`,
      icon: UserCheck,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Đăng ký mới",
      value: statsData.newStudents24h.toLocaleString('vi-VN'),
      badge: "24 giờ qua",
      icon: UserPlus,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className="text-sm text-white/60 font-medium">
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
