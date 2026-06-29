"use client";

import React, { useEffect, useState } from 'react';
import { Eye, Lock, Unlock, UserMinus, ShieldCheck, ChevronLeft, ChevronRight, Loader2, Mail, BookOpen } from 'lucide-react';
import { userService } from '@/services/userService';
import { TeacherDetailDrawer } from './TeacherDetailDrawer';
import ConfirmModal from "@/components/ConfirmModal";
import { VerifyAdminPasswordModal } from "@/components/admin/VerifyAdminPasswordModal";

interface TeachersTableProps {
  filters?: {
    search: string;
    status: string;
    courseId?: string;
  };
}

export function TeachersTable({ filters }: TeachersTableProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<{ id: string; name: string } | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [downgradeConfirmOpen, setDowngradeConfirmOpen] = useState(false);
  const [upgradeAdminTarget, setUpgradeAdminTarget] = useState<{ id: string; name: string } | null>(null);
  const [upgradeAdminVerifyOpen, setUpgradeAdminVerifyOpen] = useState(false);
  const [upgradeAdminConfirmOpen, setUpgradeAdminConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    targetId: string;
    targetStatus: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    targetId: '',
    targetStatus: '',
  });
  const [updatingLock, setUpdatingLock] = useState(false);
  const [lockVerifyOpen, setLockVerifyOpen] = useState(false);
  const [lockTargetName, setLockTargetName] = useState("");

  const handleToggleLock = (id: string, currentStatus: string, teacherName: string = "") => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setConfirmModal({
      isOpen: false,
      title: nextStatus === 'blocked' ? "Vô hiệu hóa tài khoản" : "Kích hoạt lại tài khoản",
      message: nextStatus === 'blocked'
        ? "Bạn có chắc chắn muốn KHÓA tài khoản giảng viên này? Họ sẽ lập tức bị đăng xuất và không thể truy cập cổng Giảng viên."
        : "Kích hoạt lại quyền truy cập giảng dạy cho tài khoản này?",
      isDestructive: nextStatus === 'blocked',
      targetId: id,
      targetStatus: nextStatus,
    });
    setLockTargetName(teacherName);
    setLockVerifyOpen(true);
  };

  const handleConfirmToggleLock = async () => {
    if (!confirmModal.targetId) return;
    setUpdatingLock(true);
    try {
      if (confirmModal.targetStatus === 'blocked') {
        await userService.blockUser(confirmModal.targetId);
      } else {
        await userService.unblockUser(confirmModal.targetId);
      }
      setTeachers(prev => prev.map(t => 
        t.id === confirmModal.targetId ? { ...t, status: confirmModal.targetStatus } : t
      ));
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.message || "Cập nhật trạng thái thất bại!");
    } finally {
      setUpdatingLock(false);
    }
  };

  const handleDowngradeToStudent = (id: string, name: string) => {
    setDowngradeTarget({ id, name });
    setVerifyModalOpen(true);
  };

  const handleConfirmDowngrade = async () => {
    if (!downgradeTarget) return;
    setUpdatingLock(true);
    try {
      await userService.downgradeToStudent(downgradeTarget.id);
      alert(`Đã hạ quyền Giảng viên "${downgradeTarget.name}" về lại Học viên thành công!`);
      fetchTeachers(page);
      setDowngradeConfirmOpen(false);
    } catch (err: any) {
      alert(err.message || "Hạ quyền thất bại!");
    } finally {
      setUpdatingLock(false);
    }
  };

  const handleUpgradeToAdmin = (id: string, name: string) => {
    setUpgradeAdminTarget({ id, name });
    setUpgradeAdminVerifyOpen(true);
  };

  const handleConfirmUpgradeAdmin = async () => {
    if (!upgradeAdminTarget) return;
    setUpdatingLock(true);
    try {
      await userService.upgradeToAdmin(upgradeAdminTarget.id);
      alert(`Đã nâng cấp Giảng viên "${upgradeAdminTarget.name}" lên Quản trị viên (Admin) thành công!`);
      fetchTeachers(page);
      setUpgradeAdminConfirmOpen(false);
    } catch (err: any) {
      alert(err.message || "Nâng cấp quyền thất bại!");
    } finally {
      setUpdatingLock(false);
    }
  };

  const fetchTeachers = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await userService.getAdminTeachers({
        page: currentPage,
        limit: 10,
        search: filters?.search || undefined,
        status: filters?.status !== "all" ? filters?.status : undefined,
        courseId: filters?.courseId !== "all" ? filters?.courseId : undefined,
      });

      if (response.data) {
        setTeachers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giảng viên:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTeachers(1);
  }, [filters?.search, filters?.status, filters?.courseId]);

  useEffect(() => {
    fetchTeachers(page);
  }, [page]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/40">
              <th className="py-4 px-6">Giảng viên</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6">Khóa học phụ trách</th>
              <th className="py-4 px-6">Ngày tham gia</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-white/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-white/50">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-400" />
                  <span>Đang tải danh sách giảng viên...</span>
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-white/50">
                  Không tìm thấy giảng viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr 
                  key={teacher.id} 
                  className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  onClick={() => setSelectedTeacherId(teacher.id)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500/20 to-teal-500/20 border border-yellow-400/30 flex items-center justify-center font-bold text-yellow-400 flex-shrink-0 overflow-hidden shadow-inner">
                        {teacher.avatar ? (
                          <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          teacher.initials || 'GV'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                          {teacher.name || 'Chưa đặt tên'}
                        </div>
                        <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 text-yellow-400/70 flex-shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      teacher.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        teacher.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {teacher.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold text-xs">
                        {teacher.courseCount || 0} khóa
                      </span>
                      <span className="text-white/60 text-xs truncate max-w-[200px]">
                        {teacher.courses}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap text-xs text-white/50">
                    {teacher.joinedAt}
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        className="p-2 bg-white/5 hover:bg-yellow-400 hover:text-black text-white/70 rounded-xl transition-all shadow-sm"
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleLock(teacher.id, teacher.status, teacher.name)}
                        className={`p-2 rounded-xl transition-all shadow-sm ${
                          teacher.status === 'active'
                            ? 'bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400'
                            : 'bg-red-500/20 hover:bg-green-500/20 text-red-400 hover:text-green-400'
                        }`}
                        title={teacher.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {teacher.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleUpgradeToAdmin(teacher.id, teacher.name || teacher.email)}
                        className="p-2 bg-white/5 hover:bg-purple-500 hover:text-white text-white/70 rounded-xl transition-all shadow-sm group"
                        title="Thăng cấp lên Quản trị viên (Admin)"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:text-white" />
                      </button>

                      <button
                        onClick={() => handleDowngradeToStudent(teacher.id, teacher.name || teacher.email)}
                        className="p-2 bg-white/5 hover:bg-orange-500 hover:text-white text-white/70 rounded-xl transition-all shadow-sm group"
                        title="Hạ quyền xuống Học viên"
                      >
                        <UserMinus className="w-4 h-4 text-orange-400 group-hover:text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/60">
          <div>
            Hiển thị <span className="text-white font-medium">{(page - 1) * pagination.limit + 1}</span> - <span className="text-white font-medium">{Math.min(page * pagination.limit, pagination.total)}</span> trong tổng số <span className="text-white font-medium">{pagination.total}</span> giảng viên
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-white">Trang {page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <TeacherDetailDrawer
        teacherId={selectedTeacherId}
        onClose={() => setSelectedTeacherId(null)}
        onRefresh={() => fetchTeachers(page)}
      />

      {/* Verify Password for Downgrade */}
      <VerifyAdminPasswordModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        actionDescription={`xác thực thao tác Hạ quyền Giảng viên "${downgradeTarget?.name}" xuống Học viên`}
        onSuccess={() => setDowngradeConfirmOpen(true)}
      />

      {/* Verify Password for Lock */}
      <VerifyAdminPasswordModal
        isOpen={lockVerifyOpen}
        onClose={() => setLockVerifyOpen(false)}
        actionDescription={
          confirmModal.targetStatus === 'blocked'
            ? `vô hiệu hóa tài khoản Giảng viên "${lockTargetName}"`
            : `kích hoạt lại tài khoản Giảng viên "${lockTargetName}"`
        }
        onSuccess={() => {
          setLockVerifyOpen(false);
          setConfirmModal(prev => ({ ...prev, isOpen: true }));
        }}
      />

      {/* Confirm Modal for Lock */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => !updatingLock && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmToggleLock}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.isDestructive ? "Khóa ngay" : "Mở khóa"}
        isDestructive={confirmModal.isDestructive}
      />

      {/* Confirm Modal for Downgrade */}
      <ConfirmModal
        isOpen={downgradeConfirmOpen}
        onClose={() => !updatingLock && setDowngradeConfirmOpen(false)}
        onConfirm={handleConfirmDowngrade}
        title="Xác nhận hạ quyền Giảng viên"
        message={`Bạn có chắc chắn muốn hạ quyền Giảng viên "${downgradeTarget?.name}" về lại Học viên không?`}
        confirmText="Hạ quyền xuống Học viên"
        isDestructive={true}
      />

      {/* Verify Password for Upgrade Admin */}
      <VerifyAdminPasswordModal
        isOpen={upgradeAdminVerifyOpen}
        onClose={() => setUpgradeAdminVerifyOpen(false)}
        actionDescription={`xác thực thao tác thăng cấp Giảng viên "${upgradeAdminTarget?.name}" lên Quản trị viên (Admin)`}
        onSuccess={() => {
          setUpgradeAdminVerifyOpen(false);
          setUpgradeAdminConfirmOpen(true);
        }}
      />

      {/* Confirm Modal for Upgrade Admin */}
      <ConfirmModal
        isOpen={upgradeAdminConfirmOpen}
        onClose={() => !updatingLock && setUpgradeAdminConfirmOpen(false)}
        onConfirm={handleConfirmUpgradeAdmin}
        title="Xác nhận thăng cấp Quản trị viên"
        message={`Bạn có chắc chắn muốn thăng cấp Giảng viên "${upgradeAdminTarget?.name}" thành Quản trị viên (Admin) với toàn quyền quản lý hệ thống không?`}
        confirmText="Thăng cấp lên Admin"
        isDestructive={false}
      />
    </div>
  );
}
