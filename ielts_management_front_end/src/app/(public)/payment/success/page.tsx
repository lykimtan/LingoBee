import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Lớp mờ nền tạo hiệu ứng */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#1c7c78]/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Cảm ơn bạn đã tin tưởng LingoBee. Khóa học đã được thêm vào tài khoản của bạn. 
            Bạn đã sẵn sàng bắt đầu hành trình chinh phục IELTS chưa?
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Link 
              href="/dashboard/courses" 
              className="w-full bg-[#1c7c78] hover:bg-[#15615e] text-white font-medium py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Vào học ngay
            </Link>
            
            <Link 
              href="/" 
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              Về trang chủ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
