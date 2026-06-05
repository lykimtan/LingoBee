'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquareText, Loader2, PlayCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { userService } from '@/services/userService';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EnrollButtonProps {
  courseId: string;
  price: number;
  slug: string;
}

export function EnrollButton({ courseId, price, slug }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkEnrollment = async () => {
      if (!user) {
        if (isMounted) {
          setIsEnrolled(false);
          setCheckingEnrollment(false);
        }
        return;
      }
      
      try {
        if (user.role === 'student') {
          const res = await userService.getUserProfile();
          if (res.data?.student?.enrolledCourses) {
            const enrolled = res.data.student.enrolledCourses.some(
              (c: any) => c.courseId === courseId || c.courseId?._id === courseId
            );
            if (isMounted) setIsEnrolled(enrolled);
          }
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
      } finally {
        if (isMounted) setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
    return () => { isMounted = false; };
  }, [user, courseId]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError('');
    setIsApplying(true);
    try {
      const res = await paymentService.verifyDiscount(courseId, discountCode);
      if (res.success && res.data) {
        setAppliedDiscount(res.data);
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        setDiscountError(res.message || 'Mã giảm giá không hợp lệ');
        setAppliedDiscount(null);
      }
    } catch (error: any) {
      setDiscountError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedDiscount(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác trên!');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      const res = await paymentService.createPaymentUrl(
        courseId, 
        appliedDiscount ? discountCode : undefined
      );
      
      if (res.success && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán.');
      }
    } catch (error: any) {
      console.error('Lỗi khi ghi danh:', error);
      toast.error(error.response?.data?.message || 'Bạn cần đăng nhập bằng tài khoản học viên để mua khóa học.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingEnrollment) {
    return (
      <button disabled className="w-full bg-[#1c7c78]/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mb-6">
        <Loader2 className="w-5 h-5 animate-spin" />
        Đang kiểm tra thông tin...
      </button>
    );
  }

  if (isEnrolled) {
    // Navigate to a generic learning route for now. We can fetch the specific videoId later if needed.
    const learningUrl = `/course/${slug}/learn/getting-started`;
    
    return (
      <Link
        href={learningUrl}
        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/40 flex items-center justify-center gap-2 mb-6"
      >
        <PlayCircle className="w-5 h-5" />
        Vào học tiếp
      </Link>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      
      {!showDiscountInput && !appliedDiscount && (
        <button 
          onClick={() => setShowDiscountInput(true)}
          className="text-sm text-gray-300 hover:text-white underline mb-4 transition-colors"
        >
          Bạn có mã giảm giá?
        </button>
      )}

      {showDiscountInput && !appliedDiscount && (
        <div className="w-full mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã giảm giá..."
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#1c7c78]"
              disabled={isApplying}
            />
            <button
              onClick={handleApplyDiscount}
              disabled={isApplying || !discountCode.trim()}
              className="bg-[#1c7c78] hover:bg-[#15615e] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
            >
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
            </button>
          </div>
          {discountError && <p className="text-red-400 text-xs mt-1 text-left">{discountError}</p>}
        </div>
      )}

      {appliedDiscount && (
        <div className="w-full bg-[#1c7c78]/20 border border-[#1c7c78]/30 rounded-lg p-3 mb-4 animate-in fade-in scale-in-95 duration-300">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Giảm giá ({discountCode}):</span>
            <span className="text-emerald-400 font-bold">- {appliedDiscount.discountAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg mt-1 border-t border-white/10 pt-1">
            <span className="text-white">Thành tiền:</span>
            <span className="text-[#1c7c78]">{appliedDiscount.finalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <button 
            onClick={() => {
              setAppliedDiscount(null);
              setDiscountCode('');
              setShowDiscountInput(false);
            }}
            className="text-xs text-red-400 hover:text-red-300 underline mt-2"
          >
            Hủy áp dụng
          </button>
        </div>
      )}

      <button
        onClick={handleEnroll}
        disabled={isLoading}
        className="w-full bg-[#1c7c78] hover:bg-[#15615e] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#1c7c78]/30 hover:shadow-xl hover:shadow-[#1c7c78]/40 flex items-center justify-center gap-2 mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MessageSquareText className="w-5 h-5" />
        )}
        {isLoading ? 'Đang chuyển hướng...' : 'Ghi danh ngay'}
      </button>
    </div>
  );
}
