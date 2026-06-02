'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let errorMessage = 'Đã có lỗi xảy ra trong quá trình thanh toán.';
  if (reason === 'invalid_signature') {
    errorMessage = 'Phát hiện rủi ro bảo mật: Chữ ký số không hợp lệ. Vui lòng thử lại sau.';
  } else if (reason === 'payment_error') {
    errorMessage = 'Giao dịch đã bị hủy hoặc thanh toán không thành công.';
  } else if (reason === 'system_error') {
    errorMessage = 'Lỗi hệ thống trong quá trình xử lý giao dịch.';
  }

  return (
    <div className="max-w-md w-full bg-[#121212] border border-red-500/10 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
      {/* Lớp mờ nền tạo hiệu ứng */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Thanh toán thất bại!</h2>
        <p className="text-red-400 mb-8 text-sm leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Thử thanh toán lại
          </button>
          
          <Link 
            href="/courses" 
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Xem các khóa học khác
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-white">Đang tải dữ liệu...</div>}>
        <PaymentFailedContent />
      </Suspense>
    </div>
  );
}
