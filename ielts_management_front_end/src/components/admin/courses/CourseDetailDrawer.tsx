"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, CheckCircle2, DollarSign, Star, BookOpen, Clock, Award, MessageSquare, TrendingUp, ExternalLink, Calendar, ShieldAlert, Eye, EyeOff, Settings2, Loader2, UserPlus, Search } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { commentService } from '@/services/commentService';
import { userService, UserListItem } from '@/services/userService';
import { invitationService } from '@/services/invatationService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

interface CourseDetailDrawerProps {
  courseId: string | null;
  onClose: () => void;
}

export function CourseDetailDrawer({ courseId, onClose }: CourseDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'reviews' | 'revenue' | 'assistants'>('students');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterPreset, setDateFilterPreset] = useState<'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom'>('all');

  const [isUpdateLimitModalOpen, setIsUpdateLimitModalOpen] = useState(false);
  const [newMaxStudents, setNewMaxStudents] = useState<number>(0);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // States for inviting Teaching Assistants
  const [isSearchAssistantOpen, setIsSearchAssistantOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<string | null>(null);

  useEffect(() => {
    setStartDate('');
    setEndDate('');
    setDateFilterPreset('all');
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    courseService.getCourseAdminStats(courseId, startDate, endDate)
      .then(res => {
        const payload = (res as any).data || res;
        setData(payload);
      })
      .catch(err => {
        console.error("Lỗi lấy thông tin thống kê khóa học:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId, startDate, endDate]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await userService.searchTeachers(searchQuery);
      if (res.success && res.data) {
        setSearchResults(res.data.results);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteAssistant = async (teacherId: string) => {
    if (!courseId) return;
    setIsInviting(teacherId);
    try {
      const res = await invitationService.inviteAssistant(courseId, { teacherId });
      if (res.success || res.status === "success") {
        toast.success("Đã gửi lời mời trợ giảng thành công!");
        setSearchQuery("");
      } else {
        toast.error(res.message || "Không thể gửi lời mời.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsInviting(null);
    }
  };


  const handleToggleHide = async (commentId: string) => {
    try {
      const res = await commentService.toggleHideComment(commentId);
      if (res && ((res as any).success || res.data)) {
        toast.success((res as any).message || "Đã cập nhật trạng thái bình luận");
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedReviews = (prev.reviews || []).map((r: any) => {
            if (r._id === commentId) {
              return { ...r, status: r.status === 'hidden' ? 'active' : 'hidden' };
            }
            return r;
          });
          return { ...prev, reviews: updatedReviews };
        });
      } else {
        toast.error("Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi cập nhật bình luận");
    }
  };

  const handleUpdateLimit = async () => {
    const currentTotal = data?.totalStudents || 0;
    if (newMaxStudents > 0 && newMaxStudents < currentTotal) {
      toast.error(`Giới hạn mới (${newMaxStudents}) không được nhỏ hơn số học viên hiện tại (${currentTotal}).`);
      return;
    }

    setIsUpdatingLimit(true);
    try {
      const res = await courseService.updateCourse(courseId!, { maxStudents: newMaxStudents });
      if (res.status === 'success') {
        toast.success("Cập nhật giới hạn học viên thành công!");
        setIsUpdateLimitModalOpen(false);
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            course: {
              ...prev.course,
              maxStudents: newMaxStudents
            }
          };
        });
      } else {
        toast.error("Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Error updating limit:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật.");
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const course = data?.course || {};
  const totalStudents = data?.totalStudents || 0;
  const completedStudents = data?.completedStudents || 0;
  const completionRate = data?.completionRate || 0;
  const studentList = data?.studentList || [];
  const reviews = data?.reviews || [];
  const totalRevenue = data?.totalRevenue || 0;
  const payments = data?.payments || [];

  const thumbnail = course.publicInfo?.thumbnail || "";
  const teacherName = course.teacher ? `${course.teacher.name || course.teacher.email}` : "Chưa gán";

  // Recharts data preparation
  const revenueChartData = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    const map: Record<string, number> = {};
    payments.forEach((pm: any) => {
      const d = pm.paymentDate ? new Date(pm.paymentDate) : new Date(pm.createdAt);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      map[key] = (map[key] || 0) + (pm.finalAmount || pm.totalAmount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount })).reverse();
  }, [payments]);

  const ratingChartData = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const star = Math.round(r.rating || 5) as 1 | 2 | 3 | 4 | 5;
      if (counts[star] !== undefined) counts[star]++;
    });
    return [
      { stars: '5 ★', count: counts[5], fill: '#10b981' },
      { stars: '4 ★', count: counts[4], fill: '#3b82f6' },
      { stars: '3 ★', count: counts[3], fill: '#f59e0b' },
      { stars: '2 ★', count: counts[2], fill: '#f97316' },
      { stars: '1 ★', count: counts[1], fill: '#ef4444' },
    ];
  }, [reviews]);

  const progressChartData = useMemo(() => {
    const buckets = [
      { name: '0-25%', count: 0, fill: '#64748b' },
      { name: '26-50%', count: 0, fill: '#3b82f6' },
      { name: '51-75%', count: 0, fill: '#8b5cf6' },
      { name: '76-99%', count: 0, fill: '#f59e0b' },
      { name: '100%', count: 0, fill: '#10b981' },
    ];
    studentList.forEach((s: any) => {
      const p = s.progress || 0;
      const isDone = s.status === 'completed' || p >= 100;
      if (isDone) buckets[4].count++;
      else if (p >= 76) buckets[3].count++;
      else if (p >= 51) buckets[2].count++;
      else if (p >= 26) buckets[1].count++;
      else buckets[0].count++;
    });
    return buckets;
  }, [studentList]);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };
  const formatCompactVND = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  if (!courseId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-3xl bg-[#0f2326] border-l border-white/10 text-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">

        {/* Header Drawer */}
        <div className="relative p-6 border-b border-white/10 flex items-center justify-between overflow-hidden bg-[#142e32]/80">
          {thumbnail && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 blur-sm"
              style={{ backgroundImage: `url(${thumbnail})` }}
            />
          )}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a2f32] border-2 border-teal-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {thumbnail ? (
                <img src={thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 text-teal-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/30">
                  {course.category || 'Chưa phân loại'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffb800]/20 text-[#ffb800] text-[10px] font-bold border border-[#ffb800]/30">
                  {course.level || 'N/A'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-medium uppercase tracking-wider">
                  {course.status || 'draft'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white line-clamp-1">
                {loading ? 'Đang tải thông tin...' : course.title || 'Khóa học'}
              </h2>
              <p className="text-xs text-white/60 mt-0.5">Giảng viên: <span className="text-teal-400 font-medium">{teacherName}</span></p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            {course.slug && (
              <Link
                href={`/admin/courses/${course.slug}/preview`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Kiểm duyệt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bộ lọc thời gian (Time Filter Bar) */}
        <div className="p-4 bg-[#112a2e] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-md z-10">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Lọc thời gian:</span>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 border border-teal-400'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {dateFilterPreset === 'custom' && (
            <div className="w-full flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-white/5 mt-1 animate-fadeIn">
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/70 font-medium">Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0f2326] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/70 font-medium">Đến ngày:</label>
                <input
                  type="date"
                  value={endDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0f2326] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setDateFilterPreset('all');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-500/30"
                  title="Xóa bộ lọc"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/60">
            <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Đang tổng hợp dữ liệu thống kê...</p>
          </div>
        ) : (
          <>
            {/* Top Stat Overview Grid */}
            <div className="grid grid-cols-4 gap-3 p-6 bg-black/20 border-b border-white/10">
              {/* Stat 1: Tổng học viên */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Học viên</span>
                  <div className="flex items-center gap-2 relative z-10">
                    <button
                      onClick={() => {
                        setNewMaxStudents(course.maxStudents || 0);
                        setIsUpdateLimitModalOpen(true);
                      }}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                      title="Cập nhật giới hạn học viên"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</span>
                    <span className="text-sm font-bold text-white/40">
                      / {course.maxStudents && course.maxStudents > 0 ? course.maxStudents.toLocaleString() : '∞'}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-300 font-medium whitespace-nowrap ml-2">Đăng ký</span>
                </div>
              </div>

              {/* Stat 2: Tỷ lệ hoàn thành */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Hoàn thành</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-emerald-400">{completionRate}%</span>
                  <span className="text-[10px] text-white/50">{completedStudents}/{totalStudents} HV</span>
                </div>
              </div>

              {/* Stat 3: Doanh thu */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Doanh thu</span>
                  <DollarSign className="w-4 h-4 text-[#ffb800]" />
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-[#ffb800]">
                    {totalRevenue.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Stat 4: Đánh giá */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Đánh giá</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-yellow-400">
                    {Number(course.averageRating || 0).toFixed(1)} ★
                  </span>
                  <span className="text-[10px] text-white/50">{reviews.length} nhận xét</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 px-6 bg-[#142e32]/40">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'students'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-white/60 hover:text-white'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>Học viên ({studentList.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'reviews'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-white/60 hover:text-white'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Bình luận & Đánh giá ({reviews.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'revenue'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-white/60 hover:text-white'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Lịch sử giao dịch ({payments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('assistants')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'assistants'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-white/60 hover:text-white'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>Trợ giảng ({course.teachingAssistants?.length || 0})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab 1: Danh sách học viên */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {(startDate || endDate) && (
                    <div className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs text-teal-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>
                          Đang hiển thị học viên đăng ký từ <strong className="text-white">{startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'khởi tạo'}</strong> đến <strong className="text-white">{endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'hiện tại'}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setDateFilterPreset('all');
                        }}
                        className="text-white/60 hover:text-white underline text-[11px] font-medium cursor-pointer"
                      >
                        Xem toàn bộ thời gian
                      </button>
                    </div>
                  )}
                  {/* Recharts: Biểu đồ phân bổ tiến độ */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                      <span>Phân bổ tiến độ học tập của học viên</span>
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(val: any) => [`${val} học viên`, "Số lượng"]}
                            labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            contentStyle={{ backgroundColor: '#0f292d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px' }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                            {progressChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {studentList.length === 0 ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        Chưa có học viên nào tham gia khóa học này.
                      </div>
                    ) : (
                      studentList.map((item: any) => {
                        const u = item.user || {};
                        const isDone = item.status === 'completed' || item.progress >= 100;
                        return (
                          <div key={item._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1a2f32] border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 overflow-hidden shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name ? u.name.substring(0, 2).toUpperCase() : 'HV'
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-white">{u.name || 'Học viên'}</p>
                                <p className="text-xs text-white/60">{u.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="w-32">
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="text-white/70">Tiến độ</span>
                                  <span className="font-bold text-white">{item.progress || 0}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isDone ? 'bg-emerald-400' : 'bg-teal-400'}`}
                                    style={{ width: `${item.progress || 0}%` }}
                                  />
                                </div>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${isDone
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                }`}>
                                {isDone ? 'Đã hoàn thành' : 'Đang học'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Đánh giá & Bình luận */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {(startDate || endDate) && (
                    <div className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs text-teal-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>
                          Đang hiển thị bình luận đánh giá từ <strong className="text-white">{startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'khởi tạo'}</strong> đến <strong className="text-white">{endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'hiện tại'}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setDateFilterPreset('all');
                        }}
                        className="text-white/60 hover:text-white underline text-[11px] font-medium cursor-pointer"
                      >
                        Xem toàn bộ thời gian
                      </button>
                    </div>
                  )}
                  {/* Recharts: Biểu đồ phân bổ đánh giá sao */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-4 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>Thống kê các mức đánh giá sao</span>
                    </h4>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={ratingChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="stars" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#fff', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={35} />
                          <Tooltip
                            formatter={(val: any) => [`${val} lượt đánh giá`, "Số lượng"]}
                            labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            contentStyle={{ backgroundColor: '#0f292d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px' }}
                          />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                            {ratingChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        Khóa học chưa có bình luận hoặc đánh giá nào.
                      </div>
                    ) : (
                      reviews.map((rev: any) => {
                        const author = rev.author || {};
                        const rating = rev.rating || 5;
                        const isHidden = rev.status === 'hidden';
                        return (
                          <div key={rev._id} className={`p-4 rounded-2xl border transition-all space-y-2 ${isHidden ? 'bg-red-500/5 border-red-500/20 opacity-60' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs overflow-hidden">
                                  {author.avatar ? (
                                    <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    author.name ? author.name.substring(0, 2).toUpperCase() : 'US'
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-xs text-white">{author.name || 'Người dùng'}</p>
                                    {isHidden && (
                                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-medium">Đã ẩn</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-white/50">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {rev.rating && (
                                  <div className="flex items-center gap-0.5 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-lg">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                      />
                                    ))}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleHide(rev._id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${isHidden
                                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                    }`}
                                  title={isHidden ? "Hiện lại bình luận này" : "Ẩn bình luận này"}
                                >
                                  {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span>{isHidden ? 'Hiện lại' : 'Ẩn'}</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-white/80 pl-10 leading-relaxed">
                              {rev.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Doanh thu */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  {(startDate || endDate) && (
                    <div className="px-4 py-2.5 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-between text-xs text-[#ffb800]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#ffb800] shrink-0" />
                        <span>
                          Đang hiển thị doanh thu từ <strong className="text-white">{startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'khởi tạo'}</strong> đến <strong className="text-white">{endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'hiện tại'}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setDateFilterPreset('all');
                        }}
                        className="text-white/60 hover:text-white underline text-[11px] font-medium cursor-pointer"
                      >
                        Xem toàn bộ thời gian
                      </button>
                    </div>
                  )}
                  {/* Recharts: Biểu đồ xu hướng doanh thu */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-4 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#ffb800]" />
                      <span>Biểu đồ xu hướng doanh thu theo thời gian</span>
                    </h4>
                    {revenueChartData.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-white/40 text-xs">Chưa có dữ liệu biểu đồ doanh thu</div>
                    ) : (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCourseRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffb800" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#ffb800" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} tickFormatter={formatCompactVND} axisLine={false} tickLine={false} />
                            <Tooltip
                              formatter={(val: any) => [formatVND(val || 0), "Doanh thu"]}
                              labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                              contentStyle={{ backgroundColor: '#0f292d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px' }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#ffb800" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCourseRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {payments.length === 0 ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        Chưa có giao dịch thanh toán thành công nào cho khóa học này.
                      </div>
                    ) : (
                      payments.map((pm: any) => {
                        const stu = pm.studentId?.userId || {};
                        const amount = pm.finalAmount || pm.totalAmount || 0;
                        return (
                          <div key={pm._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-center text-[#ffb800]">
                                <DollarSign className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-white">{stu.name || stu.email || 'Học viên'}</p>
                                <p className="text-xs text-white/60">Gói: <span className="text-teal-300 font-medium">{pm.priceTier?.name || 'Mặc định'}</span></p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-base font-bold text-[#ffb800]">+{amount.toLocaleString('vi-VN')} đ</p>
                              <p className="text-[11px] text-white/50">
                                {pm.paymentDate ? new Date(pm.paymentDate).toLocaleDateString('vi-VN') : new Date(pm.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}



              {/* Tab 4: Danh sách trợ giảng & Mời trợ giảng */}
              {activeTab === 'assistants' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Danh sách Trợ giảng</h3>
                    <button
                      onClick={() => setIsSearchAssistantOpen(!isSearchAssistantOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${isSearchAssistantOpen
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                        : "bg-teal-500 text-white hover:bg-teal-600 border border-teal-400"
                        }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      {isSearchAssistantOpen ? "Đóng tìm kiếm" : "Mời trợ giảng"}
                    </button>
                  </div>

                  {isSearchAssistantOpen && (
                    <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Nhập tên hoặc email giáo viên..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-[#0b1d20] border border-white/10 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm text-white"
                          autoFocus
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500 w-5 h-5 animate-spin" />
                        )}
                      </div>

                      {searchQuery.length > 0 && searchQuery.length < 2 && (
                        <div className="text-center py-4 text-sm text-white/50">
                          Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.
                        </div>
                      )}

                      {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="text-center py-4 text-sm text-white/50">
                          Không tìm thấy giáo viên nào phù hợp.
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {searchResults.map((teacher) => {
                            const existingAssistantIds = (course?.teachingAssistants || []).map((a: any) => a._id);
                            const isAlreadyAssistant = existingAssistantIds.includes(teacher._id);

                            return (
                              <div
                                key={teacher._id}
                                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#0b1d20] hover:border-teal-500/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 border border-white/20">
                                    <Image
                                      src={teacher.avatar || "/default_images/avatar.jpg"}
                                      alt={teacher.name}
                                      fill
                                      sizes="32px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="truncate">
                                    <h4 className="text-sm font-semibold text-white truncate">{teacher.name}</h4>
                                    <p className="text-xs text-white/50 truncate">{teacher.email}</p>
                                  </div>
                                </div>
                                <button
                                  disabled={isAlreadyAssistant || isInviting === teacher._id}
                                  onClick={() => handleInviteAssistant(teacher._id)}
                                  className={`shrink-0 ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${isAlreadyAssistant
                                    ? "bg-white/5 text-white/40 cursor-not-allowed"
                                    : "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30"
                                    }`}
                                >
                                  {isInviting === teacher._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : isAlreadyAssistant ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserPlus className="w-3.5 h-3.5" />
                                  )}
                                  {isAlreadyAssistant ? "Đã là trợ giảng" : "Mời"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {(!course.teachingAssistants || course.teachingAssistants.length === 0) ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        Khóa học này chưa có trợ giảng nào.
                      </div>
                    ) : (
                      course.teachingAssistants.map((ta: any) => (
                        <div key={ta._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1a2f32] border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 overflow-hidden shrink-0">
                              {ta.avatar ? (
                                <img src={ta.avatar} alt={ta.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{(ta.name || ta.email || "TA")[0].toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-white">{ta.name || 'Trợ giảng'}</p>
                              <p className="text-xs text-white/50 truncate max-w-[200px]">{ta.email}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-xs font-semibold">
                            Trợ giảng
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#142e32]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>

      {/* Modal Cập nhật giới hạn học viên */}
      {isUpdateLimitModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0b1d20] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Cập nhật giới hạn học viên</h3>
              <button 
                onClick={() => setIsUpdateLimitModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-300">Số học viên hiện tại</p>
                    <p className="text-2xl font-black text-blue-400">{totalStudents || 0}</p>
                    <p className="text-xs text-blue-400/80 mt-1">Giới hạn mới không được nhỏ hơn số lượng này.</p>
                  </div>
                </div>
              </div>
              
              <label className="block text-sm font-bold text-white/80 mb-2">Giới hạn mới</label>
              <input 
                type="number" 
                min="0"
                value={newMaxStudents}
                onChange={(e) => setNewMaxStudents(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 focus:border-[#1c7c78] focus:ring-4 focus:ring-[#1c7c78]/10 outline-none transition-all text-white font-medium"
                placeholder="Nhập 0 để không giới hạn"
              />
              <p className="text-xs text-white/40 mt-2">Nhập 0 nếu bạn muốn bỏ giới hạn số lượng học viên tham gia.</p>
            </div>
            
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setIsUpdateLimitModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-white/70 hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateLimit}
                disabled={isUpdatingLimit}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1c7c78] hover:bg-[#16605d] transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isUpdatingLimit && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdatingLimit ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}