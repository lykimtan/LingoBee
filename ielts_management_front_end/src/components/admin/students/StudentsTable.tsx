"use client";

import React, { useEffect, useState } from 'react';
import { Eye, Lock, Unlock, GraduationCap, ShieldCheck, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { StudentDetailDrawer } from './StudentDetailDrawer';
import ConfirmModal from "@/components/ConfirmModal";
import { VerifyAdminPasswordModal } from "@/components/admin/VerifyAdminPasswordModal";

interface StudentsTableProps {
  filters?: {
    search: string;
    status: string;
    courseId: string;
  };
}

export function StudentsTable({ filters }: StudentsTableProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<{ id: string; name: string; type: 'teacher' | 'admin' } | null>(null);
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

  const handleToggleLock = (id: string, currentStatus: string, studentName: string = "") => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setConfirmModal({
      isOpen: false,
      title: nextStatus === 'blocked' ? "Vô hiệu hóa tài khoản" : "Kích hoạt lại tài khoản",
      message: nextStatus === 'blocked'
        ? "Bạn có chắc chắn muốn KHÓA vô hiệu hóa tài khoản học viên này? Học viên sẽ lập tức bị đăng xuất và không thể truy cập hệ thống."
        : "Bạn muốn MỞ KHÓA kích hoạt lại quyền truy cập cho học viên này?",
      isDestructive: nextStatus === 'blocked',
      targetId: id,
      targetStatus: nextStatus,
    });
    setLockTargetName(studentName);
    setLockVerifyOpen(true);
  };

  const handleUpgradeToTeacher = (id: string, name: string) => {
    setUpgradeTarget({ id, name, type: 'teacher' });
  };

  const handleUpgradeToAdmin = (id: string, name: string) => {
    setUpgradeTarget({ id, name, type: 'admin' });
  };

  const executeModalAction = async () => {
    setUpdatingLock(true);
    try {
      if (confirmModal.targetStatus === 'teacher') {
        await userService.upgradeToTeacher(confirmModal.targetId);
        setStudents(prev => prev.filter(s => s.id !== confirmModal.targetId));
      } else if (confirmModal.targetStatus === 'admin') {
        await userService.upgradeToAdmin(confirmModal.targetId);
        setStudents(prev => prev.filter(s => s.id !== confirmModal.targetId));
      } else if (confirmModal.targetStatus === 'blocked') {
        await userService.blockUser(confirmModal.targetId);
        setStudents(prev => prev.map(s => s.id === confirmModal.targetId ? { ...s, status: confirmModal.targetStatus } : s));
      } else {
        await userService.unblockUser(confirmModal.targetId);
        setStudents(prev => prev.map(s => s.id === confirmModal.targetId ? { ...s, status: confirmModal.targetStatus } : s));
      }
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setUpdatingLock(false);
    }
  };

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [filters?.search, filters?.status, filters?.courseId]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await userService.getAdminStudents({
          page,
          limit: 10,
          search: filters?.search || undefined,
          status: filters?.status !== "all" ? filters?.status : undefined,
          courseId: filters?.courseId !== "all" ? filters?.courseId : undefined,
        });
        console.log(response)

        const list = response.data;
        if (Array.isArray(list)) {
          setStudents(list);
        } else {
          setStudents([]);
        }

        const paginationData = (response as any).pagination;
        if (paginationData) {
          setPagination(paginationData);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce tìm kiếm 300ms
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, filters?.search, filters?.status, filters?.courseId]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider bg-white/5">
              <th className="px-6 py-4">Học viên</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Khóa học đã mua</th>
              <th className="px-6 py-4 text-center">Điểm thi đầu vào</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#14b8a6]" />
                    <span>Đang tải danh sách học viên...</span>
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/50">
                  Không tìm thấy học viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1a2f32] border border-white/10 flex items-center justify-center text-sm font-medium text-white overflow-hidden shrink-0">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.initials || "SV"
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white mb-0.5">{student.name}</div>
                        <div className="text-xs text-white/50">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
                        Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/90 max-w-[200px] leading-snug mb-1">
                      {student.courses || "Chưa có"}
                    </div>
                    <div className="text-xs text-white/40">
                      {student.courseSubtext || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-semibold text-[#14b8a6]">
                      {student.score !== undefined ? student.score : "Chưa làm bài test"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedStudentId(student.id)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Xem chi tiết hồ sơ 360°"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpgradeToTeacher(student.id, student.name || student.email)}
                        className="p-2 text-white/60 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Thăng cấp thành Giảng viên (Teacher)"
                      >
                        <GraduationCap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpgradeToAdmin(student.id, student.name || student.email)}
                        className="p-2 text-white/60 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Thăng cấp thành Quản trị viên (Admin)"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleLock(student.id, student.status, student.name || student.email)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${student.status === 'active' ? 'text-white/60 hover:text-red-400 hover:bg-red-500/10' : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'}`}
                        title={student.status === 'active' ? "Khóa vô hiệu hóa tài khoản" : "Mở khóa kích hoạt lại"}
                      >
                        {student.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-white/60">
        <div>
          Hiển thị {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} trong tổng số {pagination.total} học viên
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Render các trang gần trang hiện tại */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
            .map((p, index, array) => (
              <React.Fragment key={p}>
                {index > 0 && array[index - 1] !== p - 1 && (
                  <span className="px-2 text-white/40"><MoreHorizontal className="w-4 h-4 inline" /></span>
                )}
                <button
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${page === p
                    ? "bg-teal-500 text-black font-bold"
                    : "text-white/60 hover:bg-white/10"
                    }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}

          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages || loading}
            className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer trượt chi tiết học viên 360° */}
      <StudentDetailDrawer
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onStatusChange={(id, newStatus) => {
          setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        }}
      />

      {/* Modal xác nhận Khóa / Mở khóa tài khoản */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeModalAction}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        isLoading={updatingLock}
        confirmText={confirmModal.targetStatus === 'teacher' ? "Nâng cấp Giảng viên" : confirmModal.targetStatus === 'admin' ? "Nâng cấp Admin" : confirmModal.targetStatus === 'blocked' ? "Khóa tài khoản" : "Mở khóa"}
      />

      {/* Modal yêu cầu Admin nhập mật khẩu trước thao tác cấp quyền */}
      <VerifyAdminPasswordModal
        isOpen={Boolean(upgradeTarget)}
        onClose={() => setUpgradeTarget(null)}
        actionDescription={
          upgradeTarget?.type === 'admin'
            ? `cấp quyền Quản trị viên (Admin) cho "${upgradeTarget.name}"`
            : `cấp quyền Giảng viên cho "${upgradeTarget?.name}"`
        }
        onSuccess={() => {
          if (upgradeTarget) {
            const isAdmin = upgradeTarget.type === 'admin';
            setConfirmModal({
              isOpen: true,
              title: isAdmin ? "Cấp quyền Quản trị viên" : "Cấp quyền Giảng viên",
              message: isAdmin
                ? `Bạn có chắc chắn muốn thăng cấp học viên "${upgradeTarget.name}" thành Quản trị viên (Admin)? Người dùng này sẽ có toàn quyền quản trị hệ thống.`
                : `Bạn có chắc chắn muốn thăng cấp học viên "${upgradeTarget.name}" thành Giảng viên chính thức (Teacher)? Hệ thống sẽ gửi email chúc mừng đến tài khoản này.`,
              isDestructive: false,
              targetId: upgradeTarget.id,
              targetStatus: upgradeTarget.type,
            });
            setUpgradeTarget(null);
          }
        }}
      />

      {/* Modal yêu cầu Admin nhập mật khẩu trước khi khóa tài khoản */}
      <VerifyAdminPasswordModal
        isOpen={lockVerifyOpen}
        onClose={() => setLockVerifyOpen(false)}
        actionDescription={
          confirmModal.targetStatus === 'blocked'
            ? `vô hiệu hóa tài khoản học viên "${lockTargetName}"`
            : `kích hoạt lại tài khoản học viên "${lockTargetName}"`
        }
        onSuccess={() => {
          setLockVerifyOpen(false);
          setConfirmModal(prev => ({ ...prev, isOpen: true }));
        }}
      />
    </div>
  );
}
