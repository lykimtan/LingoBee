"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar, Hash } from 'lucide-react';
import Image from 'next/image';
import { paymentService } from '@/services/paymentService';

interface TopSpender {
  studentId: string;
  name: string;
  email: string;
  avatar: string | null;
  totalSpent: number;
  coursesBought: number;
}

export function TopSpendersTab() {
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [spenders, setSpenders] = useState<TopSpender[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopSpenders();
  }, [timeFilter, limit, startDate, endDate]);

  const fetchTopSpenders = async () => {
    try {
      setLoading(true);

      const res = await paymentService.getTopSpenders({
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (res.success && res.data) {
        setSpenders(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch top spenders", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300 drop-shadow-md" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600 drop-shadow-md" />;
    return <span className="text-white/50 font-bold w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Top Học Viên VIP
          </h2>
          <p className="text-sm text-white/50 mt-1">Danh sách học viên mua nhiều khóa học nhất</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0f2326] rounded-xl p-1 border border-white/10">
            <Hash className="w-4 h-4 text-white/40 ml-2" />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-transparent text-white text-sm outline-none px-2 py-1.5 cursor-pointer font-bold"
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bộ lọc thời gian (Time Filter Bar) */}
      <div className="p-5 rounded-3xl bg-[#0f2326] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 text-white/80">
          <Calendar className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-bold uppercase tracking-wider">Lọc chi tiêu theo thời gian:</span>
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
            const isActive = timeFilter === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setTimeFilter(preset.id as any);
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

        {timeFilter === 'custom' && (
          <div className="w-full flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/10 animate-fadeIn">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70 font-medium">Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#142e32] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70 font-medium">Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#142e32] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : spenders.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
            <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
            <p>Không có dữ liệu trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {spenders.map((spender, index) => (
              <div
                key={spender.studentId}
                className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 border-2 border-white/10">
                    <Image
                      src={spender.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + spender.email}
                      alt={spender.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold group-hover:text-yellow-400 transition-colors">
                      {spender.name}
                    </h3>
                    <p className="text-xs text-white/50">{spender.email}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-8">
                  <div className="hidden md:block">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Số khóa học</p>
                    <p className="text-white font-semibold">{spender.coursesBought} khóa</p>
                  </div>
                  <div className="w-32">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Tổng chi tiêu</p>
                    <p className="text-green-400 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(spender.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
