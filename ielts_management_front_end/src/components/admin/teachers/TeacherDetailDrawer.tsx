"use client";

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { X, User, BookOpen, ShieldCheck, ShieldAlert, Calendar, Mail, Loader2, CheckCircle2, Clock, UserMinus, Users, Award, Globe, Star } from 'lucide-react';
import { userService } from '@/services/userService';
import ConfirmModal from "@/components/ConfirmModal";
import { VerifyAdminPasswordModal } from "@/components/admin/VerifyAdminPasswordModal";
import { toast } from 'react-toastify';

interface TeacherDetailDrawerProps {
  teacherId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function TeacherDetailDrawer({ teacherId, onClose, onRefresh }: TeacherDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'assisting'>('profile');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<'status' | 'downgrade' | 'upgrade_admin'>('status');

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    userService.getAdminTeacherDetail(teacherId).then(res => {
      const payload = (res as any).data || res;
      console.log(payload);
      setData(payload);
    }).catch(err => {
      console.error("Lỗi lấy chi tiết giảng viên:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [teacherId]);

  if (!teacherId) return null;

  const user = data?.user || {};
  const courses = data?.assignedCourses || [];
  const assistingCourses = data?.assistingCourses || [];
  const profile = data?.teacherProfile;

  const executeModalAction = async () => {
    if (!user._id) return;
    setUpdatingStatus(true);
    try {
      if (modalActionType === 'downgrade') {
        await userService.downgradeToStudent(user._id);
        toast.success(`Đã hạ quyền Giảng viên "${user.name}" về lại Học viên thành công!`);
        onRefresh?.();
        onClose();
      } else if (modalActionType === 'upgrade_admin') {
        await userService.upgradeToAdmin(user._id);
        toast.success(`Đã nâng cấp Giảng viên "${user.name}" lên Quản trị viên (Admin) thành công!`);
        onRefresh?.();
        onClose();
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
        toast.success(nextStatus === 'blocked' ? "Đã vô hiệu hóa tài khoản giảng viên!" : "Đã mở khóa tài khoản giảng viên!");
        onRefresh?.();
      }
    } catch (err: any) {
      toast.error(err.message || "Thao tác thất bại!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const nameParts = (user.name || 'GV').split(' ');
  let initials = 'GV';
  if (nameParts.length >= 2) {
    initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
  } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
    initials = nameParts[0].substring(0, 2);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f2326] border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-teal-500/20 border border-yellow-400/30 flex items-center justify-center font-bold text-xl text-yellow-400 shadow-inner overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initials.toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{user.name || 'Giảng viên'}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}>
                  {user.status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa'}
                </span>
              </div>
              <p className="text-white/60 text-sm flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-yellow-400" />
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-white/50 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Ngày tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={updatingStatus}
              onClick={() => {
                setModalActionType('status');
                setVerifyModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${user.status === 'active'
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                }`}
            >
              {user.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
            </button>

            <button
              disabled={updatingStatus || user.role === 'admin'}
              onClick={() => {
                setModalActionType('upgrade_admin');
                setVerifyModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.role === 'admin' ? 'Đã là Admin' : 'Lên Admin'}</span>
            </button>

            <button
              disabled={updatingStatus}
              onClick={() => {
                setModalActionType('downgrade');
                setVerifyModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Hạ quyền Học viên</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'profile' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/60 hover:text-white'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ Giảng viên</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'courses' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/60 hover:text-white'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khóa học phụ trách ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assisting')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'assisting' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/60 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Khóa học trợ giảng ({assistingCourses.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/50 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <p className="text-sm">Đang tải chi tiết hồ sơ giảng viên...</p>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Hồ Sơ Chuyên Môn Giảng Viên */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span>Hồ Sơ Chuyên Môn (Teacher Profile)</span>
                  </h4>
                  {profile?.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 flex items-center gap-1">
                      Hiển thị Trang chủ
                    </span>
                  )}
                </div>

                {profile ? (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-white/40 block text-xs">Chức danh / Tiêu đề</span>
                        <span className="text-white font-semibold mt-0.5 block">{profile.title || '---'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs">Điểm IELTS Overall Band</span>
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-bold text-xs border border-yellow-400/30">
                          Band {profile.band || '---'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/40 block text-xs">Kinh nghiệm giảng dạy</span>
                      <span className="text-white font-medium mt-0.5 block">{profile.experienceYears || 0} năm kinh nghiệm</span>
                    </div>

                    {profile.bio && (
                      <div>
                        <span className="text-white/40 block text-xs">Giới thiệu ngắn (Bio)</span>
                        <p className="text-white/80 bg-black/20 p-3 rounded-xl mt-1 text-xs leading-relaxed italic border border-white/5">
                          &ldquo;{profile.bio}&rdquo;
                        </p>
                      </div>
                    )}

                    {profile.teachingPhilosophy && (
                      <div>
                        <span className="text-white/40 block text-xs">Triết lý giảng dạy</span>
                        <p className="text-white/80 bg-black/20 p-3 rounded-xl mt-1 text-xs leading-relaxed border border-white/5">
                          {profile.teachingPhilosophy}
                        </p>
                      </div>
                    )}

                    {profile.highlights && profile.highlights.length > 0 && (
                      <div>
                        <span className="text-white/40 block text-xs mb-1.5">Điểm nổi bật giảng dạy</span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.highlights.map((h: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-1 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.certificates && profile.certificates.length > 0 && (
                      <div>
                        <span className="text-white/40 block text-xs mb-1.5">Bằng cấp & Chứng chỉ</span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.certificates.map((c: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 text-xs font-medium">
                              <Award className="w-3.5 h-3.5 text-blue-400" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(profile.socialLinks?.facebook || profile.socialLinks?.linkedin || profile.socialLinks?.youtube || profile.socialLinks?.website) && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-white/40 block text-xs mb-2">Liên kết mạng xã hội & Website</span>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {profile.socialLinks.facebook && (
                            <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" /> Facebook
                            </a>
                          )}
                          {profile.socialLinks.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" /> LinkedIn
                            </a>
                          )}
                          {profile.socialLinks.youtube && (
                            <a href={profile.socialLinks.youtube} target="_blank" rel="noreferrer" className="text-red-400 hover:underline flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" /> YouTube
                            </a>
                          )}
                          {profile.socialLinks.website && (
                            <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" /> Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-white/50 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs">Giảng viên chưa cập nhật Hồ sơ chuyên môn.</p>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Thông tin phân quyền</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/40 block text-xs">Vai trò hệ thống</span>
                    <span className="text-white font-medium capitalize mt-0.5 inline-block px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-xs">
                      Instructor (Giảng viên)
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs">Cấp quyền bởi</span>
                    <span className="text-white font-medium mt-0.5 block">Super Admin</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs">Trạng thái xác thực email</span>
                    <span className="text-green-400 font-medium flex items-center gap-1 mt-0.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs">Lần đăng nhập cuối</span>
                    <span className="text-white/80 font-medium flex items-center gap-1 mt-0.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-white/40" /> Gần đây
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'courses' ? (
            <div className="space-y-6">
              {courses.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-white/50">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Giảng viên này hiện chưa được phân công phụ trách khóa học nào.</p>
                </div>
              ) : (
                [
                  { key: 'draft', label: 'Bản nháp (Draft)', badge: 'text-gray-300 bg-gray-500/20 border-gray-500/30' },
                  { key: 'invited', label: 'Đã mời GV (Invited)', badge: 'text-blue-300 bg-blue-500/20 border-blue-500/30' },
                  { key: 'accepted', label: 'GV chấp nhận (Accepted)', badge: 'text-teal-300 bg-teal-500/20 border-teal-500/30' },
                  { key: 'review', label: 'Chờ duyệt (Review)', badge: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' },
                  { key: 'published', label: 'Đã xuất bản (Published)', badge: 'text-green-300 bg-green-500/20 border-green-500/30' },
                  { key: 'archived', label: 'Đã lưu trữ (Archived)', badge: 'text-purple-300 bg-purple-500/20 border-purple-500/30' },
                ].map(group => {
                  const items = courses.filter((c: any) => (c.status || 'draft') === group.key);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${group.badge}`}>
                          {group.label} • {items.length}
                        </span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>
                      <div className="space-y-2.5">
                        {items.map((course: any) => (
                          <div key={course._id} className="bg-white/5 border border-white/10 hover:border-yellow-400/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold flex-shrink-0">
                                {course.publicInfo?.thumbnail ? (
                                  <Image src={course.publicInfo.thumbnail} alt={course.title} width={44} height={44} className="rounded-xl object-cover w-full h-full" />
                                ) : (
                                  <BookOpen className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-white font-bold text-sm truncate">{course.title}</h5>
                                <p className="text-white/50 text-xs mt-0.5">Cấp độ: <span className="text-yellow-400 uppercase font-semibold">{course.level || 'N/A'}</span> • Kỹ năng: <span className="capitalize">{course.category || 'N/A'}</span></p>
                              </div>
                            </div>
                            <span className="text-xs text-white/40 whitespace-nowrap">
                              {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {assistingCourses.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-white/50">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Giảng viên này hiện không tham gia làm trợ giảng cho khóa học nào.</p>
                </div>
              ) : (
                [
                  { key: 'draft', label: 'Bản nháp (Draft)', badge: 'text-gray-300 bg-gray-500/20 border-gray-500/30' },
                  { key: 'invited', label: 'Đã mời GV (Invited)', badge: 'text-blue-300 bg-blue-500/20 border-blue-500/30' },
                  { key: 'accepted', label: 'GV chấp nhận (Accepted)', badge: 'text-teal-300 bg-teal-500/20 border-teal-500/30' },
                  { key: 'review', label: 'Chờ duyệt (Review)', badge: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' },
                  { key: 'published', label: 'Đã xuất bản (Published)', badge: 'text-green-300 bg-green-500/20 border-green-500/30' },
                  { key: 'archived', label: 'Đã lưu trữ (Archived)', badge: 'text-purple-300 bg-purple-500/20 border-purple-500/30' },
                ].map(group => {
                  const items = assistingCourses.filter((c: any) => (c.status || 'draft') === group.key);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${group.badge}`}>
                          {group.label} • {items.length}
                        </span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>
                      <div className="space-y-2.5">
                        {items.map((course: any) => (
                          <div key={course._id} className="bg-white/5 border border-white/10 hover:border-yellow-400/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
                                {course.publicInfo?.thumbnail ? (
                                  <Image src={course.publicInfo.thumbnail} alt={course.title} width={44} height={44} className="rounded-xl object-cover w-full h-full" />
                                ) : (
                                  <Users className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-white font-bold text-sm truncate">{course.title}</h5>
                                <p className="text-white/50 text-xs mt-0.5">Cấp độ: <span className="text-yellow-400 uppercase font-semibold">{course.level || 'N/A'}</span> • Kỹ năng: <span className="capitalize">{course.category || 'N/A'}</span></p>
                              </div>
                            </div>
                            <span className="text-xs text-white/40 whitespace-nowrap">
                              {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verify Admin Password Modal */}
      <VerifyAdminPasswordModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        actionDescription={
          modalActionType === 'downgrade'
            ? `xác thực thao tác Hạ quyền Giảng viên "${user.name}" xuống Học viên`
            : modalActionType === 'upgrade_admin'
              ? `xác thực thao tác Thăng cấp Giảng viên "${user.name}" lên Quản trị viên`
              : user.status === 'active'
                ? `vô hiệu hóa tài khoản Giảng viên "${user.name}"`
                : `kích hoạt lại tài khoản Giảng viên "${user.name}"`
        }
        onSuccess={() => setConfirmModalOpen(true)}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeModalAction}
        title={modalActionType === 'downgrade' ? "Xác nhận hạ quyền Giảng viên" : modalActionType === 'upgrade_admin' ? "Xác nhận thăng cấp Quản trị viên" : user.status === 'active' ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa"}
        message={
          modalActionType === 'downgrade'
            ? `Bạn có chắc chắn muốn hạ quyền Giảng viên của "${user.name}" về lại Học viên không? Toàn bộ khóa học họ đang phụ trách sẽ tạm thời không có người quản lý.`
            : modalActionType === 'upgrade_admin'
              ? `Bạn có chắc chắn muốn thăng cấp Giảng viên "${user.name}" thành Quản trị viên (Admin) với toàn quyền quản lý hệ thống không?`
              : user.status === 'active'
                ? `Giảng viên "${user.name}" sẽ bị đăng xuất ngay lập tức và không thể truy cập vào cổng Giảng viên.`
                : `Kích hoạt lại quyền giảng dạy cho "${user.name}".`
        }
        confirmText={modalActionType === 'downgrade' ? "Hạ quyền ngay" : modalActionType === 'upgrade_admin' ? "Thăng cấp lên Admin" : user.status === 'active' ? "Khóa ngay" : "Mở khóa"}
        isDestructive={modalActionType === 'downgrade' || user.status === 'active'}
      />
    </div>
  );
}
