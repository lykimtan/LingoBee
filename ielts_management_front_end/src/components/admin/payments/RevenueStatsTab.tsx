"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Search, ArrowUpRight, CheckCircle2, XCircle, Clock, Tag, RefreshCw } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { toast } from 'react-toastify';

export function RevenueStatsTab() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      const res = await paymentService.getAdminRevenueStats();
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
      const res = await paymentService.getAdminPayments({ page, limit: 10, search, status: statusFilter });
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
  }, []);

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
        {/* Chart 1: Revenue 30 Days */}
        <div className="rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Biểu đồ doanh thu 30 ngày qua</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Tổng: <strong className="text-emerald-400">{formatVND(stats?.revenue30DaysTotal || 0)}</strong></p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/70">
              Cập nhật liên tục
            </span>
          </div>

          <div className="h-64 w-full">
            {loadingStats ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Đang tải dữ liệu biểu đồ...</div>
            ) : (stats?.revenue30DaysChart || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">Chưa có phát sinh doanh thu trong 30 ngày qua</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenue30DaysChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} interval={6} axisLine={false} tickLine={false} />
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-400" />
                <span>Doanh thu theo từng khóa học</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Top các khóa học mang lại doanh thu cao nhất</p>
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

          <div className="flex items-center gap-3">
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
