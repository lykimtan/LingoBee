"use client";

import React, { useEffect, useState } from 'react';
import { X, User, BookOpen, Award, ShieldCheck, ShieldAlert, Calendar, Mail, Loader2, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import { userService } from '@/services/userService';
import ConfirmModal from "@/components/ConfirmModal";
import { VerifyAdminPasswordModal } from "@/components/admin/VerifyAdminPasswordModal";
import { toast } from 'react-toastify';

interface StudentDetailDrawerProps {
  studentId: string | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function StudentDetailDrawer({ studentId, onClose, onStatusChange }: StudentDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'placement'>('profile');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<'status' | 'upgrade' | 'upgrade_admin' | 'verify_email'>('status');

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    userService.getAdminStudentDetail(studentId).then(res => {
      const payload = (res as any).data || res;
      setData(payload);
    }).catch(err => {
      console.error("Lỗi lấy chi tiết học viên:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [studentId]);

  if (!studentId) return null;

  const user = data?.user || {};
  const profile = data?.studentProfile || {};
  const courses = profile?.enrolledCourses || [];
  const tests = data?.placementTests || [];
  const latestTest = tests[0] || null;

  const executeModalAction = async () => {
    if (!user._id) return;
    setUpdatingStatus(true);
    try {
      if (modalActionType === 'upgrade') {
        await userService.upgradeToTeacher(user._id);
        toast.success("Nâng cấp Giảng viên thành công!");
        onClose();
        if (onStatusChange) onStatusChange(user._id, 'teacher');
      } else if (modalActionType === 'upgrade_admin') {
        await userService.upgradeToAdmin(user._id);
        toast.success("Nâng cấp Quản trị viên (Admin) thành công!");
        onClose();
        if (onStatusChange) onStatusChange(user._id, 'admin');
      } else if (modalActionType === 'verify_email') {
        await userService.adminVerifyUserEmail(user._id);
        toast.success("Xác thực email thủ công cho học viên thành công!");
        setData((prev: any) => ({
          ...prev,
          user: { ...prev.user, isEmailVerified: true }
        }));
      } else {
        const nextStatus = user.status === 'active' ? 'blocked' : 'active';
        if (nextStatus === 'blocked') {
          await userService.blockUser(user._id);
        } else {
          await userService.unblockUser(user._id);
        }
        setData((prev: any) => ({
          ...prev,
          user: { ...prev.user, status: nextStatus }
        }));
        toast.success(nextStatus === 'blocked' ? "Đã vô hiệu hóa tài khoản học viên!" : "Đã mở khóa tài khoản học viên!");
        if (onStatusChange) onStatusChange(user._id, nextStatus);
      }
      setConfirmModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#0f2326] border-l border-white/10 text-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header Drawer */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#142e32]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1a2f32] border-2 border-teal-500/30 flex items-center justify-center text-xl font-bold text-teal-400 overflow-hidden shrink-0 shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name.substring(0, 2).toUpperCase() : 'SV'
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {loading ? 'Đang tải...' : user.name || 'Học viên'}
              </h2>
              <p className="text-sm text-white/60">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#1a2f32]/40 px-6 gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'profile' ? 'border-teal-400 text-teal-400 font-bold' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            <User className="w-4 h-4" />
            Tổng quan hồ sơ
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'courses' ? 'border-teal-400 text-teal-400 font-bold' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            Khóa học ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('placement')}
            className={`py-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'placement' ? 'border-teal-400 text-teal-400 font-bold' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            <Award className="w-4 h-4" />
            Placement Test ({tests.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/50 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
              <span>Đang trích xuất hồ sơ học tập 360°...</span>
            </div>
          ) : activeTab === 'profile' ? (
            /* Tab 1: Profile */
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-teal-400 mb-2">Trạng thái tài khoản</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.status === 'active' ? (
                      <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-semibold">Tài khoản Đang hoạt động</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="font-semibold">Tài khoản Đã bị khóa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setModalActionType('upgrade'); setVerifyModalOpen(true); }}
                      disabled={updatingStatus || user.role === 'teacher'}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border-teal-500/30 flex items-center gap-1.5 disabled:opacity-40"
                      title="Nâng cấp thành Giảng viên"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.role === 'teacher' ? 'Đã là GV' : 'Lên GV'}</span>
                    </button>
                    <button
                      onClick={() => { setModalActionType('upgrade_admin'); setVerifyModalOpen(true); }}
                      disabled={updatingStatus || user.role === 'admin'}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1.5 disabled:opacity-40"
                      title="Nâng cấp thành Quản trị viên"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{user.role === 'admin' ? 'Đã là Admin' : 'Lên Admin'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setModalActionType('status');
                        setVerifyModalOpen(true);
                      }}
                      disabled={updatingStatus}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer ${user.status === 'active' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30'}`}
                    >
                      {updatingStatus ? 'Đang xử lý...' : user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-teal-400">Thông tin định danh</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-white/40 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Ngày đăng ký
                    </span>
                    <p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> Xác thực Email
                    </span>
                    <div className="flex items-center gap-2.5">
                      <p className={`font-medium ${user.isEmailVerified ? 'text-green-400' : 'text-amber-400'}`}>
                        {user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </p>
                      {!user.isEmailVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalActionType('verify_email');
                            setVerifyModalOpen(true);
                          }}
                          disabled={updatingStatus}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                          title="Xác thực email thủ công"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xác thực ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-white/40 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Mục tiêu IELTS mong muốn
                    </span>
                    <p className="font-medium text-teal-300">{profile?.targetScore ? `Band ${profile.targetScore}` : 'Chưa thiết lập'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'courses' ? (
            /* Tab 2: Courses */
            <div className="space-y-4 animate-fade-in">
              {courses.length === 0 ? (
                <div className="text-center py-16 text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Học viên chưa đăng ký khóa học nào.</p>
                </div>
              ) : (
                courses.map((item: any, idx: number) => {
                  const courseObj = item.courseId || {};
                  const progress = Math.round(Number(item.progress ?? item.progressPercentage ?? 0));
                  const isDone = item.status === 'completed' || progress >= 100;
                  const isDropped = item.status === 'dropped';
                  const enrollDate = item.enrollmentDate || item.enrolledAt;
                  const enrollDateStr = enrollDate ? new Date(enrollDate).toLocaleDateString('vi-VN') : 'Gần đây';

                  return (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-teal-500/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase">
                            {courseObj.category || 'IELTS'}
                          </span>
                          <h4 className="text-lg font-bold text-white mt-1.5">{courseObj.title || (typeof item === 'string' ? item : 'Khóa học')}</h4>
                        </div>
                        <span className="text-sm font-semibold text-teal-400">{progress}%</span>
                      </div>

                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-400' : isDropped ? 'bg-red-400' : 'bg-gradient-to-r from-teal-500 to-emerald-400'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                        <span>Đã ghi danh: {enrollDateStr}</span>
                        {isDone ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                          </span>
                        ) : isDropped ? (
                          <span className="text-red-400 flex items-center gap-1 font-semibold">
                            Đã dừng học
                          </span>
                        ) : (
                          <span className="text-blue-400 flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5" /> Đang học
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Tab 3: Placement Test */
            <div className="space-y-6 animate-fade-in">
              {tests.length === 0 ? (
                <div className="text-center py-16 text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Học viên chưa làm bài Placement Test đầu vào.</p>
                </div>
              ) : (
                <>
                  {latestTest && (
                    <div className="bg-gradient-to-br from-teal-900/40 via-[#1a2f32] to-[#0f2326] border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-400 text-black uppercase tracking-wider">
                          Kết quả mới nhất
                        </span>
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(latestTest.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-end gap-3 mb-6 relative z-10">
                        <h3 className="text-5xl font-black text-white tracking-tight">{latestTest.totalScore}</h3>
                        <span className="text-teal-400 text-lg font-bold pb-1">/ 10 Điểm</span>
                      </div>
                    </div>
                  )}

                  {tests.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Lịch sử các lần thi trước</h4>
                      {tests.slice(1).map((t: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">Lần thi #{tests.length - 1 - i}</span>
                            <p className="text-xs text-white/50 mt-0.5">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <span className="text-lg font-bold text-teal-400">{t.totalScore} Điểm</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Drawer */}
        <div className="p-4 border-t border-white/10 bg-[#142e32]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>

      {/* Modal xác nhận thao tác Khóa / Mở khóa / Thăng cấp / Xác thực trong Drawer */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeModalAction}
        title={modalActionType === 'upgrade' ? "Cấp quyền Giảng viên" : modalActionType === 'upgrade_admin' ? "Cấp quyền Quản trị viên" : modalActionType === 'verify_email' ? "Xác thực Email Học viên" : user.status === 'active' ? "Vô hiệu hóa tài khoản" : "Kích hoạt lại tài khoản"}
        message={modalActionType === 'upgrade'
          ? `Bạn có chắc chắn muốn nâng cấp học viên "${user.name || user.email}" thành Giảng viên chính thức?`
          : modalActionType === 'upgrade_admin'
            ? `Bạn có chắc chắn muốn thăng cấp học viên "${user.name || user.email}" thành Quản trị viên (Admin) với toàn quyền quản lý hệ thống?`
            : modalActionType === 'verify_email'
              ? `Bạn muốn xác thực thủ công địa chỉ email cho học viên "${user.name || user.email}"? Tài khoản sẽ được chuyển sang trạng thái Đã xác thực.`
              : user.status === 'active'
                ? "Bạn có chắc chắn muốn vô hiệu hóa tài khoản học viên này? Học viên sẽ bị đăng xuất và không thể truy cập hệ thống."
                : "Bạn muốn mở khóa kích hoạt lại quyền truy cập cho học viên này?"}
        isDestructive={modalActionType === 'status' && user.status === 'active'}
        isLoading={updatingStatus}
        confirmText={modalActionType === 'upgrade' ? "Thăng cấp Giảng viên" : modalActionType === 'upgrade_admin' ? "Thăng cấp Admin" : modalActionType === 'verify_email' ? "Xác thực ngay" : user.status === 'active' ? "Khóa tài khoản" : "Mở khóa"}
      />

      {/* Modal xác nhận mật khẩu Admin trước thao tác quan trọng */}
      <VerifyAdminPasswordModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        actionDescription={
          modalActionType === 'upgrade'
            ? `thăng cấp học viên "${user.name || user.email}" thành Giảng viên`
            : modalActionType === 'upgrade_admin'
              ? `thăng cấp học viên "${user.name || user.email}" thành Quản trị viên`
              : modalActionType === 'verify_email'
                ? `xác thực thủ công email cho học viên "${user.name || user.email}"`
                : user.status === 'active'
                  ? `vô hiệu hóa tài khoản học viên "${user.name || user.email}"`
                  : `kích hoạt lại tài khoản học viên "${user.name || user.email}"`
        }
        onSuccess={() => {
          setVerifyModalOpen(false);
          setConfirmModalOpen(true);
        }}
      />
    </div>
  );
}
