"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Search, ArrowUpRight, CheckCircle2, XCircle, Clock, Tag, RefreshCw, Download, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { toast } from 'react-toastify';

export function RevenueStatsTab() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [chartDays, setChartDays] = useState<'7' | '30' | '90' | '365' | 'all'>('30');
  const [courseDays, setCourseDays] = useState<'7' | '30' | '90' | '365' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterPreset, setDateFilterPreset] = useState<'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom'>('all');

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await paymentService.getAdminPayments({ page: 1, limit: 1000 });
      const allPayments = (res as any).data || payments || [];

      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += "BÁO CÁO THỐNG KÊ DOANH THU LINGOBEE\n";
      csvContent += `Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}\n\n`;

      csvContent += "1. TỔNG QUAN CHỈ SỐ\n";
      csvContent += `Chỉ số,Giá trị\n`;
      csvContent += `Tổng doanh thu thực tế,${stats?.totalRevenue || 0} VND\n`;
      csvContent += `Giao dịch thành công,${stats?.totalTransactions || 0}\n`;
      csvContent += `Giá trị đơn trung bình (AOV),${stats?.averageOrderValue || 0} VND\n\n`;

      if (stats?.revenueByCourse && stats.revenueByCourse.length > 0) {
        csvContent += "2. DOANH THU THEO KHÓA HỌC\n";
        csvContent += "Tên khóa học,Số giao dịch,Tổng doanh thu (VND)\n";
        stats.revenueByCourse.forEach((c: any) => {
          const name = `"${(c.name || '').replace(/"/g, '""')}"`;
          csvContent += `${name},${c.transactions || 0},${c.revenue || 0}\n`;
        });
        csvContent += "\n";
      }

      csvContent += "3. CHI TIẾT LỊCH SỬ GIAO DỊCH\n";
      csvContent += "Mã giao dịch,Khóa học,Số tiền (VND),Phương thức,Ngày thanh toán,Trạng thái\n";
      allPayments.forEach((pm: any) => {
        const code = `"${pm.orderId || pm.vnp_TxnRef || pm._id || ''}"`;
        const courseName = `"${(pm.courseId?.title || pm.courseTitle || 'Khóa học').replace(/"/g, '""')}"`;
        const amount = pm.finalAmount || pm.totalAmount || 0;
        const method = `"${pm.paymentMethod || 'vnpay'}"`;
        const date = pm.paymentDate ? new Date(pm.paymentDate).toLocaleDateString('vi-VN') : new Date(pm.createdAt).toLocaleDateString('vi-VN');
        const status = pm.paymentStatus === 'completed' ? 'Thành công' : pm.paymentStatus === 'failed' ? 'Thất bại' : 'Đang chờ';
        csvContent += `${code},${courseName},${amount},${method},${date},${status}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bao_Cao_Doanh_Thu_LingoBee_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Xuất file báo cáo thống kê doanh thu thành công!');
    } catch (err) {
      console.error("Lỗi xuất báo cáo:", err);
      toast.error('Có lỗi khi xuất file báo cáo!');
    } finally {
      setExporting(false);
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
  };

  const formatCompactVND = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await paymentService.getAdminRevenueStats({ chartDays, courseDays, startDate, endDate });
      const payload = (res as any).data || res;
      setStats(payload);
    } catch (err) {
      console.error("Lỗi tải thống kê doanh thu:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await paymentService.getAdminPayments({ page, limit: 10, search, status: statusFilter, startDate, endDate });
      const payload = (res as any).data || res;
      setPayments(payload || []);
      if ((res as any).pagination) {
        setTotalPages((res as any).pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử giao dịch:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadPayments();
  }, [chartDays, courseDays, startDate, endDate]);

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPayments();
  };

  const courseColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Bộ lọc thời gian (Time Filter Bar) */}
      <div className="p-5 rounded-3xl bg-[#0f2326] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 text-white/80">
          <Calendar className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-bold uppercase tracking-wider">Lọc doanh thu theo thời gian:</span>
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
            const isActive = dateFilterPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setDateFilterPreset(preset.id as any);
                  if (preset.id === 'all') {
                    setStartDate('');
                    setEndDate('');
                    setChartDays('all');
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
                    setChartDays('7');
                  } else if (preset.id === '30days') {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 29);
                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(end.toISOString().split('T')[0]);
                    setChartDays('30');
                  } else if (preset.id === 'thisMonth') {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    setStartDate(firstDay.toISOString().split('T')[0]);
                    setEndDate(lastDay.toISOString().split('T')[0]);
                    setChartDays('30');
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                value={endDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#142e32] text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setDateFilterPreset('all');
                  setChartDays('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-500/30"
                title="Xóa bộ lọc"
              >
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Tổng doanh thu thực tế</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-white tracking-tight">
            {loadingStats ? 'Đang tải...' : formatVND(stats?.totalRevenue || 0)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Doanh thu thuần từ các thanh toán thành công</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Giao dịch thành công</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-white tracking-tight">
            {loadingStats ? 'Đang tải...' : (stats?.totalTransactions || 0).toLocaleString('vi-VN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
            <span>Tổng lượt đăng ký khóa học qua VNPay</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Giá trị đơn trung bình (AOV)</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-white tracking-tight">
            {loadingStats ? 'Đang tải...' : formatVND(stats?.averageOrderValue || 0)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
            <span>Mức chi tiêu trung bình / khóa học</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Revenue Chart */}
        <div className="rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Biểu đồ doanh thu ({chartDays === '7' ? '7 ngày qua' : chartDays === '30' ? '30 ngày qua' : chartDays === '90' ? '3 tháng qua' : chartDays === '365' ? '1 năm qua' : 'Tất cả'})</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Tổng: <strong className="text-emerald-400">{formatVND(stats?.revenueChartTotal ?? stats?.revenue30DaysTotal ?? 0)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto flex-wrap">
              {[
                { key: '7', label: '7 ngày' },
                { key: '30', label: '30 ngày' },
                { key: '90', label: '3 tháng' },
                { key: '365', label: '1 năm' },
                { key: 'all', label: 'Tất cả' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setChartDays(opt.key as any)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    chartDays === opt.key
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {loadingStats ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Đang tải dữ liệu biểu đồ...</div>
            ) : (stats?.revenueChart || stats?.revenue30DaysChart || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Chưa có phát sinh doanh thu trong khoảng thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueChart || stats?.revenue30DaysChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} interval={chartDays === '7' ? 0 : chartDays === '30' ? 5 : chartDays === '90' ? 14 : 0} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickFormatter={formatCompactVND} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatVND(val || 0), "Doanh thu"]}
                    labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    contentStyle={{ backgroundColor: '#0a1a1c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '10px 14px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevAdmin)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Revenue breakdown by course */}
        <div className="rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-400" />
                <span>Doanh thu theo từng khóa học</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                {courseDays === 'all' ? 'Top doanh thu cao nhất mọi thời điểm' : `Trong ${courseDays === '7' ? '7 ngày qua' : courseDays === '30' ? '30 ngày qua' : courseDays === '90' ? '3 tháng qua' : '1 năm qua'}`}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto flex-wrap">
              {[
                { key: '7', label: '7 ngày' },
                { key: '30', label: '30 ngày' },
                { key: '90', label: '3 tháng' },
                { key: '365', label: '1 năm' },
                { key: 'all', label: 'Tất cả' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setCourseDays(opt.key as any)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    courseDays === opt.key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {loadingStats ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Đang tải dữ liệu khóa học...</div>
            ) : (stats?.revenueByCourse || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Chưa có dữ liệu doanh thu khóa học</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={(stats.revenueByCourse || []).slice(0, 5)} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickFormatter={formatCompactVND} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#fff', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [formatVND(val || 0), `${item?.payload?.transactions || 0} giao dịch`]}
                    labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    contentStyle={{ backgroundColor: '#0a1a1c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '10px 14px' }}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={22}>
                    {(stats.revenueByCourse || []).slice(0, 5).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={courseColors[index % courseColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-3xl bg-[#0f2326] border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Lịch sử giao dịch thanh toán</h3>
            <p className="text-xs text-white/50 mt-0.5">Toàn bộ các yêu cầu thanh toán qua cổng VNPay</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã TxnRef, mã giảm giá..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition w-60"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none focus:border-teal-400 transition cursor-pointer"
            >
              <option value="" className="bg-[#0f2326]">Tất cả trạng thái</option>
              <option value="completed" className="bg-[#0f2326]">Thành công (Completed)</option>
              <option value="pending" className="bg-[#0f2326]">Đang chờ (Pending)</option>
              <option value="failed" className="bg-[#0f2326]">Thất bại (Failed)</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xuất...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Xuất báo cáo (CSV)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-white/50">
                <th className="py-4 px-6">Mã giao dịch (TxnRef)</th>
                <th className="py-4 px-6">Học viên</th>
                <th className="py-4 px-6">Khóa học</th>
                <th className="py-4 px-6 text-right">Giá gốc</th>
                <th className="py-4 px-6 text-right">Mã giảm giá</th>
                <th className="py-4 px-6 text-right">Thực thu</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {loadingPayments ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/50 text-sm">Đang tải danh sách thanh toán...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/50 text-sm">Không tìm thấy giao dịch nào phù hợp</td>
                </tr>
              ) : (
                payments.map((pm) => {
                  const stu = pm.studentId?.userId || {};
                  const course = pm.courseId || {};
                  const isSuccess = pm.paymentStatus === 'completed';
                  const isPending = pm.paymentStatus === 'pending';
                  const discountCodeStr = pm.discountCode?.code;
                  const discountAmt = pm.discountCode?.discountAmount || pm.discountedAmount || 0;

                  return (
                    <tr key={pm._id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-teal-300 font-medium">
                        #{pm.txnRef || pm._id.substring(0, 8)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {stu.avatar ? (
                              <img src={stu.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              stu.name ? stu.name.substring(0, 2).toUpperCase() : 'HV'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-white">{stu.name || 'Học viên ẩn'}</p>
                            <p className="text-[11px] text-white/50">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-xs text-white line-clamp-1 max-w-[180px]">{course.title || 'Khóa học đã xóa'}</p>
                        <p className="text-[10px] text-teal-400 mt-0.5">{pm.priceTier?.name || 'Mặc định'}</p>
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-white/70">
                        {formatVND(pm.totalAmount || 0)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {discountCodeStr ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-purple-300">
                              {discountCodeStr}
                            </span>
                            {discountAmt > 0 && <p className="text-[10px] text-emerald-400 mt-1">-{formatVND(discountAmt)}</p>}
                          </div>
                        ) : (
                          <span className="text-white/30 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-xs text-emerald-400">
                        {formatVND(pm.finalAmount || pm.totalAmount || 0)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isPending
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {!isSuccess && !isPending && <XCircle className="w-3 h-3" />}
                          <span>{isSuccess ? 'Thành công' : isPending ? 'Đang chờ' : 'Thất bại'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-white/60">
                        {new Date(pm.paymentDate || pm.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/60">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium text-white transition cursor-pointer"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium text-white transition cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
