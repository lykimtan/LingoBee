"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { X, Users, CheckCircle2, DollarSign, Star, BookOpen, Clock, Award, MessageSquare, TrendingUp, ExternalLink, Calendar, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { commentService } from '@/services/commentService';
import { toast } from 'react-toastify';
import Link from 'next/link';
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
  const [activeTab, setActiveTab] = useState<'students' | 'reviews' | 'revenue'>('students');

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    courseService.getCourseAdminStats(courseId)
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
  }, [courseId]);

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
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</span>
                  <span className="text-[10px] text-blue-300 font-medium">Đăng ký</span>
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
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab 1: Danh sách học viên */}
              {activeTab === 'students' && (
                <div className="space-y-6">
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
    </div>
  );
}