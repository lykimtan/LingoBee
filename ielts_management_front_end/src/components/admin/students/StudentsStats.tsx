import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus, Calendar, X } from 'lucide-react';
import { userService } from '@/services/userService';

interface StudentsStatsProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    datePreset?: string;
    [key: string]: any;
  };
  setFilters?: React.Dispatch<React.SetStateAction<any>>;
}

export function StudentsStats({ filters, setFilters }: StudentsStatsProps) {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newStudents24h: 0
  });

  // Local state fallback for standalone usage
  const [localStartDate, setLocalStartDate] = useState<string>('');
  const [localEndDate, setLocalEndDate] = useState<string>('');
  const [localPreset, setLocalPreset] = useState<string>('all');

  const startDate = filters?.startDate !== undefined ? filters.startDate : localStartDate;
  const endDate = filters?.endDate !== undefined ? filters.endDate : localEndDate;
  const datePreset = filters?.datePreset !== undefined ? filters.datePreset : localPreset;

  const updateFilters = (newPreset: string, newStart: string, newEnd: string) => {
    if (setFilters && filters) {
      setFilters((prev: any) => ({
        ...prev,
        datePreset: newPreset,
        startDate: newStart,
        endDate: newEnd
      }));
    } else {
      setLocalPreset(newPreset);
      setLocalStartDate(newStart);
      setLocalEndDate(newEnd);
    }
  };

  useEffect(() => {
    userService.getAdminStudentStats({
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).then(res => {
      const data = (res as any).data || res;
      if (data) {
        setStatsData({
          totalStudents: data.totalStudents || 0,
          activeStudents: data.activeStudents || 0,
          newStudents24h: data.newStudents24h || 0
        });
      }
    }).catch(err => console.error("Failed to load student stats:", err));
  }, [startDate, endDate]);

  const activeRate = statsData.totalStudents > 0
    ? Math.round((statsData.activeStudents / statsData.totalStudents) * 100)
    : 0;

  const stats = [
    {
      title: "Tổng số học viên",
      value: statsData.totalStudents.toLocaleString('vi-VN'),
      badge: (startDate || endDate) ? "Trong khoảng thời gian chọn" : "Cập nhật thời gian thực",
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
      badge: (startDate || endDate) ? "Đăng ký trong kỳ" : "24 giờ qua",
      icon: UserPlus,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6 mb-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-500/30 transition-colors"
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

      {/* Date Filter Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Thống kê theo thời gian</h3>
              <p className="text-xs text-white/50">Lọc chi tiết dữ liệu học viên đăng ký từ ngày đến ngày</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: '7days', label: '7 ngày qua' },
              { id: '30days', label: '30 ngày qua' },
              { id: 'thisMonth', label: 'Tháng này' },
              { id: 'custom', label: 'Từ ngày - Đến ngày...' },
            ].map((preset) => {
              const isActive = datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (preset.id === 'all') {
                      updateFilters('all', '', '');
                    } else if (preset.id === 'today') {
                      const now = new Date().toISOString().split('T')[0];
                      updateFilters('today', now, now);
                    } else if (preset.id === '7days') {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 6);
                      updateFilters('7days', start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
                    } else if (preset.id === '30days') {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 29);
                      updateFilters('30days', start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
                    } else if (preset.id === 'thisMonth') {
                      const now = new Date();
                      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                      updateFilters('thisMonth', firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
                    } else if (preset.id === 'custom') {
                      const now = new Date();
                      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                      const startStr = startDate || firstDay.toISOString().split('T')[0];
                      const endStr = endDate || now.toISOString().split('T')[0];
                      updateFilters('custom', startStr, endStr);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 border border-teal-400'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                    }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="w-full flex flex-wrap items-center justify-end gap-3 pt-3 mt-3 border-t border-white/10 animate-fadeIn">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70 font-medium">Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateFilters('custom', e.target.value, endDate)}
                className="bg-[#142e32] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70 font-medium">Đến ngày:</label>
              <input
                type="date"
                value={endDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFilters('custom', startDate, e.target.value)}
                className="bg-[#142e32] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => updateFilters('all', '', '')}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-500/30"
                title="Xóa bộ lọc"
              >
                <X className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
