"use client";

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Search, CheckCircle2, XCircle, Trash2, Edit3, Calendar, Users, Percent, DollarSign, X, PieChart as PieIcon, Mail, Hourglass } from 'lucide-react';
import { discountService, DiscountCode } from '@/services/discountService';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';
import { toast } from 'react-toastify';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ConfirmModal from '@/components/ConfirmModal';

export function DiscountsTab() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Email Send Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedDiscountForEmail, setSelectedDiscountForEmail] = useState<DiscountCode | null>(null);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailSearchResults, setEmailSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Confirm Delete Modal State
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    targetId: string;
    loading: boolean;
  }>({
    isOpen: false,
    targetId: '',
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'fixed' | 'percentage',
    discountValue: 10,
    maxDiscountAmount: '',
    maxUsageTotal: -1,
    maxUsagePerStudent: 1,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    applicableCourses: [] as string[],
    isActive: true
  });

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
  };

  const formatCompactVND = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await discountService.getDiscounts({ page, limit: 10, search, status: statusFilter });
      const payload = (res as any).data || res;
      setDiscounts(payload || []);
      if ((res as any).pagination) {
        setTotalPages((res as any).pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Lỗi tải mã khuyến mãi:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      const payload = (res as any).data || res;
      setCourses(payload || []);
    } catch (err) {
      console.error("Lỗi tải khóa học:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await discountService.getDiscountStats();
      const payload = (res as any).data || res;
      setStats(payload || null);
    } catch (err) {
      console.error("Lỗi tải thống kê ưu đãi:", err);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, [page, statusFilter]);

  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDiscounts();
  };

  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: '',
      maxUsageTotal: -1,
      maxUsagePerStudent: 1,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      applicableCourses: [],
      isActive: true
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!emailSearchQuery || emailSearchQuery.trim().length < 2) {
      setEmailSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await userService.searchUsersAdmin(emailSearchQuery);
        const payload = (res as any)?.data?.results || (res as any)?.results || (res as any)?.data || res;
        setEmailSearchResults(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Lỗi tìm kiếm user:", err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [emailSearchQuery]);

  const handleOpenEmailModal = (discount: DiscountCode) => {
    setSelectedDiscountForEmail(discount);
    setSelectedUsers([]);
    setEmailSearchQuery('');
    setEmailSearchResults([]);
    setCustomEmailMessage(discount.description || '');
    setIsEmailModalOpen(true);
  };

  const handleToggleUserSelection = (user: any) => {
    setSelectedUsers(prev => {
      const exists = prev.some(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSendDiscountEmails = async () => {
    if (!selectedDiscountForEmail) return;
    if (selectedUsers.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một học viên để gửi email");
      return;
    }
    setSendingEmail(true);
    try {
      const userIds = selectedUsers.map(u => u._id);
      const res = await discountService.sendDiscountEmail(selectedDiscountForEmail._id, userIds, customEmailMessage);
      if (res && ((res as any).success || res.status === 'success' || (res as any).status === 200)) {
        toast.success((res as any).message || "Đã gửi email khuyến mãi thành công!");
        setIsEmailModalOpen(false);
      } else {
        toast.error("Không thể gửi email");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi gửi email qua Resend");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenEditModal = (item: DiscountCode) => {
    setEditingDiscount(item);
    setFormData({
      code: item.code,
      description: item.description || '',
      discountType: item.discountType,
      discountValue: item.discountValue,
      maxDiscountAmount: item.maxDiscountAmount ? item.maxDiscountAmount.toString() : '',
      maxUsageTotal: item.maxUsageTotal,
      maxUsagePerStudent: item.maxUsagePerStudent,
      validFrom: new Date(item.validFrom).toISOString().slice(0, 10),
      validTo: new Date(item.validTo).toISOString().slice(0, 10),
      applicableCourses: (item.applicableCourses || []).map(c => c._id),
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await discountService.toggleStatus(id);
      if (res && ((res as any).success || res.data)) {
        toast.success("Đã cập nhật trạng thái mã khuyến mãi");
        loadDiscounts();
      } else {
        toast.error("Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteModal({
      isOpen: true,
      targetId: id,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteModal.targetId) return;
    setConfirmDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await discountService.deleteDiscount(confirmDeleteModal.targetId);
      if (res && ((res as any).success || (res as any).status === 200 || res.status === 'success')) {
        toast.success((res as any).message || "Đã xóa mã khuyến mãi");
        loadDiscounts();
      } else {
        toast.error("Không thể xóa mã khuyến mãi");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa mã khuyến mãi");
    } finally {
      setConfirmDeleteModal({ isOpen: false, targetId: '', loading: false });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.warning("Vui lòng nhập mã khuyến mãi");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        maxUsageTotal: Number(formData.maxUsageTotal),
        maxUsagePerStudent: Number(formData.maxUsagePerStudent),
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        applicableCourses: formData.applicableCourses,
        isActive: formData.isActive
      };

      let res;
      if (editingDiscount) {
        res = await discountService.updateDiscount(editingDiscount._id, payload);
      } else {
        res = await discountService.createDiscount(payload);
      }

      if (res && ((res as any).success || res.data)) {
        toast.success(editingDiscount ? "Cập nhật mã khuyến mãi thành công" : "Tạo mã khuyến mãi thành công");
        setIsModalOpen(false);
        loadDiscounts();
      } else {
        toast.error((res as any).message || "Thao tác thất bại");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu mã khuyến mãi");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setFormData(prev => {
      const exists = prev.applicableCourses.includes(courseId);
      if (exists) {
        return { ...prev, applicableCourses: prev.applicableCourses.filter(id => id !== courseId) };
      } else {
        return { ...prev, applicableCourses: [...prev.applicableCourses, courseId] };
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Thống kê tỷ lệ sử dụng mã ưu đãi (Pie Chart & Top Codes) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart Card */}
        <div className="lg:col-span-1 rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              <span>Tỷ lệ dùng mã khuyến mãi</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">Trên tổng số đơn thanh toán thành công</p>
          </div>

          <div className="h-56 w-full my-4 relative flex items-center justify-center">
            {!stats ? (
              <div className="text-xs text-white/40">Đang tải biểu đồ...</div>
            ) : stats.totalCompleted === 0 ? (
              <div className="text-xs text-white/40">Chưa có giao dịch thành công</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats.pieData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val || 0} lượt`, name]}
                    contentStyle={{ backgroundColor: '#0a1a1c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {stats && stats.totalCompleted > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{stats.usageRate}%</span>
                <span className="text-[10px] uppercase text-white/50 font-bold">Tỷ lệ dùng</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-semibold border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-white/80">Có mã ({stats?.withDiscount || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-white/80">Không mã ({stats?.withoutDiscount || 0})</span>
            </div>
          </div>
        </div>

        {/* Top Codes Used Card */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-teal-400" />
              <span>Top mã ưu đãi được áp dụng nhiều nhất</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">Các chương trình khuyến mãi chuyển đổi tốt nhất</p>
          </div>

          <div className="my-4 space-y-3 flex-1 flex flex-col justify-center">
            {!stats || (stats.topCodes || []).length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs">Chưa ghi nhận mã ưu đãi nào được sử dụng trong các thanh toán thành công</div>
            ) : (
              (stats.topCodes || []).map((codeItem: any, idx: number) => {
                const percentage = stats.withDiscount > 0 ? Math.round((codeItem.count / stats.withDiscount) * 100) : 0;
                return (
                  <div key={codeItem.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-white/60">#{idx + 1}</span>
                        <span className="font-mono text-purple-300">{codeItem.name}</span>
                      </div>
                      <span className="text-white/70 font-semibold">{codeItem.count} lượt ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-right border-t border-white/10 pt-3 text-[11px] text-white/40">
            Tổng số thanh toán thành công toàn hệ thống: <strong className="text-white">{stats?.totalCompleted || 0} giao dịch</strong>
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="rounded-3xl bg-[#0f2326] p-6 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span>Danh sách Mã Khuyến Mãi</span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">Quản lý các chương trình giảm giá và ưu đãi học phí</p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã giảm giá..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition w-52"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none focus:border-purple-400 transition cursor-pointer"
          >
            <option value="" className="bg-[#0f2326]">Tất cả trạng thái</option>
            <option value="active" className="bg-[#0f2326]">Đang hoạt động</option>
            <option value="inactive" className="bg-[#0f2326]">Đã tạm dừng</option>
            <option value="expired" className="bg-[#0f2326]">Đã hết hạn</option>
          </select>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo mã mới</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-[#0f2326] border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-white/50">
                <th className="py-4 px-6">Mã ưu đãi</th>
                <th className="py-4 px-6">Mô tả</th>
                <th className="py-4 px-6 text-right">Mức giảm</th>
                <th className="py-4 px-6 text-center">Đã dùng / Giới hạn</th>
                <th className="py-4 px-6">Hạn sử dụng</th>
                <th className="py-4 px-6">Phạm vi áp dụng</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/50 text-sm">Đang tải danh sách mã khuyến mãi...</td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/50 text-sm">Chưa có mã khuyến mãi nào được tạo</td>
                </tr>
              ) : (
                discounts.map((item) => {
                  const isExpired = new Date(item.validTo) < new Date();
                  const isLimitReached = item.maxUsageTotal !== -1 && item.usageCount >= item.maxUsageTotal;
                  const active = item.isActive && !isExpired && !isLimitReached;

                  return (
                    <tr key={item._id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 font-mono font-bold text-sm text-purple-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{item.code}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs text-white font-medium max-w-[200px] line-clamp-2">{item.description || 'Không có mô tả'}</p>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-xs text-yellow-400">
                        {item.discountType === 'percentage' ? (
                          <span>-{item.discountValue}%</span>
                        ) : (
                          <span>-{formatVND(item.discountValue)}</span>
                        )}
                        {item.discountType === 'percentage' && item.maxDiscountAmount && (
                          <p className="text-[10px] text-white/50 font-normal">Tối đa {formatCompactVND(item.maxDiscountAmount)}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                          <Users className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-white">{item.usageCount}</span>
                          <span className="text-white/40">/</span>
                          <span className="text-white/70">{item.maxUsageTotal === -1 ? '∞' : item.maxUsageTotal}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{new Date(item.validTo).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {isExpired && <span className="text-[10px] text-red-400 font-medium">Đã hết hạn</span>}
                      </td>
                      <td className="py-4 px-6 text-xs text-white/70">
                        {(item.applicableCourses || []).length === 0 ? (
                          <span className="text-emerald-400 font-medium">Tất cả khóa học</span>
                        ) : (
                          <span title={(item.applicableCourses || []).map(c => c.title).join(', ')}>
                            {(item.applicableCourses || []).length} khóa học chọn lọc
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleStatus(item._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            }`}
                          title="Nhấn để bật/tắt"
                        >
                          {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{active ? 'Hoạt động' : isExpired ? 'Hết hạn' : 'Tạm dừng'}</span>
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEmailModal(item)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition cursor-pointer inline-flex items-center gap-1"
                          title="Gửi email tặng mã cho học viên"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                          title="Xóa mã"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Modal Tạo/Sửa mã khuyến mãi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#0f2326] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#142e32]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                <span>{editingDiscount ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Mã code ưu đãi *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: IELTS2026, SUMMER50..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold placeholder-white/30 focus:outline-none focus:border-purple-400 text-sm uppercase transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Kiểu giảm giá *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${formData.discountType === 'percentage'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                        }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Theo phần trăm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${formData.discountType === 'fixed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                        }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Số tiền cố định</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Mô tả chương trình</label>
                <input
                  type="text"
                  placeholder="VD: Ưu đãi chào hè giảm 20% cho học viên mới..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    {formData.discountType === 'percentage' ? 'Tỷ lệ giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={formData.discountType === 'percentage' ? 100 : 100000000}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-purple-400 transition"
                  />
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="Để trống nếu không giới hạn"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Tổng số lượt dùng</label>
                  <input
                    type="number"
                    placeholder="-1 = Không giới hạn"
                    value={formData.maxUsageTotal}
                    onChange={(e) => setFormData({ ...formData, maxUsageTotal: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">Nhập -1 nếu không giới hạn số lượng</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Giới hạn / 1 học viên</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxUsagePerStudent}
                    onChange={(e) => setFormData({ ...formData, maxUsagePerStudent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Hiệu lực từ ngày *</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Đến hết ngày *</label>
                  <input
                    type="date"
                    required
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">Khóa học áp dụng</label>
                <p className="text-[11px] text-white/50 mb-2.5">Không chọn khóa học nào đồng nghĩa với việc áp dụng cho <strong className="text-emerald-400">Tất cả khóa học</strong>.</p>
                <div className="max-h-40 overflow-y-auto p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  {courses.map(c => {
                    const isSelected = formData.applicableCourses.includes(c._id);
                    return (
                      <div
                        key={c._id}
                        onClick={() => toggleCourseSelection(c._id)}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${isSelected
                          ? 'bg-purple-500/20 border-purple-500/50 text-white font-semibold'
                          : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'
                          }`}
                      >
                        <span>{c.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-medium text-white cursor-pointer">
                  Kích hoạt mã khuyến mãi ngay sau khi lưu
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : editingDiscount ? 'Lưu thay đổi' : 'Tạo mã khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gửi Email Mã Khuyến Mãi */}
      {isEmailModalOpen && selectedDiscountForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f2326] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" />
                <span>Resend Email Marketing</span>
              </div>
              <h3 className="text-xl font-bold text-white">Gửi Mã Ưu Đãi Cho Học Viên</h3>
              <p className="text-xs text-white/60 mt-1">
                Mã: <strong className="text-yellow-400 font-mono text-sm">{selectedDiscountForEmail.code}</strong> ({selectedDiscountForEmail.discountType === 'percentage' ? `Giảm ${selectedDiscountForEmail.discountValue}%` : `Giảm ${formatVND(selectedDiscountForEmail.discountValue)}`})
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Search User Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Tìm kiếm học viên (theo email hoặc họ tên)</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nhập email hoặc tên học viên (Nhấn Enter để thêm nhanh)..."
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && emailSearchQuery.includes('@')) {
                        e.preventDefault();
                        const q = emailSearchQuery.trim();
                        if (!selectedUsers.some(u => u.email?.toLowerCase() === q.toLowerCase())) {
                          handleToggleUserSelection({ _id: q, name: q.split('@')[0], email: q });
                          setEmailSearchQuery('');
                        }
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  />
                  {searchingUsers && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/50 animate-pulse">Đang tìm...</div>
                  )}
                </div>
              </div>

              {/* Search Results or Add Direct Email */}
              {(emailSearchResults.length > 0 || emailSearchQuery.includes('@')) && (
                <div className="space-y-1 bg-black/30 border border-white/10 rounded-xl p-2 max-h-48 overflow-y-auto">
                  {emailSearchQuery.includes('@') && !selectedUsers.some(u => u.email?.toLowerCase() === emailSearchQuery.trim().toLowerCase()) && (
                    <div
                      onClick={() => {
                        const q = emailSearchQuery.trim();
                        handleToggleUserSelection({ _id: q, name: q.split('@')[0], email: q });
                        setEmailSearchQuery('');
                      }}
                      className="p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 border border-emerald-500/30 mb-1.5 shadow-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span className="truncate">Thêm & gửi tới email: <strong className="underline">{emailSearchQuery.trim()}</strong></span>
                      </div>
                      <span className="text-[10px] uppercase bg-emerald-500/40 px-2 py-0.5 rounded shrink-0 ml-2">Chọn ngay</span>
                    </div>
                  )}
                  {emailSearchResults.length > 0 && <div className="text-[10px] text-white/40 font-semibold px-2 py-1">Kết quả trong hệ thống ({emailSearchResults.length})</div>}
                  {emailSearchResults.map(user => {
                    const isSelected = selectedUsers.some(u => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => handleToggleUserSelection(user)}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-blue-500/20 text-white font-bold' : 'hover:bg-white/5 text-white/80'
                          }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold">{user.name || 'Học viên'}</div>
                          <div className="text-[11px] text-white/50">{user.email}</div>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/30'
                          }`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Users Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/80">Học viên nhận email ({selectedUsers.length})</label>
                  {selectedUsers.length > 0 && (
                    <button type="button" onClick={() => setSelectedUsers([])} className="text-[11px] text-red-400 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                {selectedUsers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-white/40">
                    Chưa chọn học viên nào. Hãy nhập từ khóa tìm kiếm bên trên.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
                    {selectedUsers.map(user => (
                      <div key={user._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-200 text-xs font-medium">
                        <span>{user.name} ({user.email})</span>
                        <button type="button" onClick={() => handleToggleUserSelection(user)} className="hover:text-white cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Lời nhắn kèm theo trong email</label>
                <textarea
                  rows={3}
                  value={customEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  placeholder="Gửi lời chào hoặc lý do tặng mã ưu đãi..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSendDiscountEmails}
                disabled={sendingEmail || selectedUsers.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                {sendingEmail ? (
                  <>
                    <span className="animate-spin">
                      <Hourglass />
                    </span>
                    <span>Đang gửi mail...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Gửi Email ({selectedUsers.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ isOpen: false, targetId: '', loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa mã khuyến mãi"
        message="Bạn có chắc chắn muốn xóa hoặc tạm dừng mã khuyến mãi này? Thao tác này sẽ làm mã ngừng hoạt động đối với học viên."
        isDestructive={true}
        isLoading={confirmDeleteModal.loading}
        confirmText="Xóa mã"
        cancelText="Hủy bỏ"
      />
    </div>
  );
}
