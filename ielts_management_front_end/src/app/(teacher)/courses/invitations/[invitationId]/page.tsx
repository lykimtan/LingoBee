"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { courseService, CourseInvitation } from '@/services/courseService';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Mail, BookOpen, GraduationCap, User, Tag } from 'lucide-react';

export default function CourseInvitationPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.invitationId;
  const router = useRouter();

  const [invitation, setInvitation] = useState<CourseInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitation();
  }, [invitationId]);

  const fetchInvitation = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getMyCourseInvitations();
      if (response.success || response.status === 'success') {
        const data = response.data || [];
        const found = data.find(inv => inv._id === invitationId);
        
        if (found) {
          setInvitation(found);
        } else {
          setError("Không tìm thấy lời mời. Lời mời này có thể không tồn tại hoặc bạn không có quyền truy cập.");
        }
      } else {
        setError(response.message || "Lỗi khi tải dữ liệu lời mời.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu lời mời.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;
    setIsProcessing(true);
    try {
      const response = await courseService.acceptCourseInvitation(invitation._id);
      if (response.success || response.status === 'success') {
        toast.success("Đã chấp nhận lời mời tham gia khóa học!");
        setInvitation(prev => prev ? { ...prev, status: 'accepted' } : null);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi chấp nhận lời mời.");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi chấp nhận lời mời.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!invitation) return;
    setIsProcessing(true);
    try {
      const response = await courseService.rejectCourseInvitation(invitation._id);
      if (response.success || response.status === 'success') {
        toast.success("Đã từ chối lời mời.");
        setInvitation(prev => prev ? { ...prev, status: 'rejected' } : null);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi từ chối lời mời.");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi từ chối lời mời.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Đã chấp nhận</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Đã từ chối</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5"><Mail className="w-4 h-4" /> Đang chờ phản hồi</span>;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <button 
        onClick={() => router.push('/teacher/courses')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group font-medium"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại Quản lý Khóa học</span>
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-8 md:p-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        <div className="relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Đang tải thông tin lời mời...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : invitation ? (
            <div className="space-y-8 animate-fade-in-up">
              
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Mail className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Lời mời tham gia giảng dạy
                </h1>
                <p className="text-gray-500 max-w-md mx-auto text-lg">
                  Bạn đã nhận được lời mời làm <strong className="text-gray-800">{invitation.role === 'assistant' ? 'trợ giảng' : 'giảng viên chính'}</strong> cho khóa học dưới đây.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      {invitation.course.title}
                    </h2>
                  </div>
                  {getStatusBadge(invitation.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 flex flex-col gap-1 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Tag className="w-4 h-4" /> Danh mục
                    </div>
                    <div className="font-bold text-gray-800 capitalize">{invitation.course.category}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex flex-col gap-1 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <GraduationCap className="w-4 h-4" /> Cấp độ
                    </div>
                    <div className="font-bold text-gray-800 capitalize">{invitation.course.level}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                      {invitation.invitedBy?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-1 font-medium">
                        <User className="w-4 h-4" /> Người mời
                      </div>
                      <div className="font-bold text-gray-900 text-lg">
                        {invitation.invitedBy?.name || 'Giáo viên/Quản trị viên'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invitation.invitedBy?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {invitation.message && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-4">
                    <p className="text-gray-700 italic">"{invitation.message}"</p>
                  </div>
                )}
              </div>

              {invitation.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    Từ chối
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Chấp nhận lời mời
                  </button>
                </div>
              )}

              {invitation.status !== 'pending' && (
                <div className="pt-4">
                  <button
                    onClick={() => router.push('/teacher/courses')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    Đến trang quản lý Khóa học
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
