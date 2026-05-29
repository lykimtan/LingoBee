import React from 'react';
import { Check } from 'lucide-react';

export const CourseSolutionsSection = () => {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white">
            Giải pháp của chúng tôi
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-6 flex flex-col items-center lg:items-end">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1f6f5e] flex items-center justify-center mt-1">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Lộ trình cá nhân hoá, tinh gọn</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Học trọng tâm, không dàn trải, phát huy điểm mạnh khắc phục điểm yếu để tối đa điểm số.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1f6f5e] flex items-center justify-center mt-1">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Phương pháp Linearthinking độc quyền</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Học thông minh, bản chất, giải quyết hiệu quả mọi vấn đề thuộc mọi level của người học ở cả 4 kĩ năng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Illustration */}
          <div className="relative flex justify-center py-8 lg:py-0 order-first lg:order-none">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#1f6f5e]/30 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="group relative w-72 h-72 lg:w-80 lg:h-80 bg-white/10 border border-[#1f6f5e]/30 rounded-[40px] shadow-[0_0_40px_rgba(31,111,94,0.3)] flex items-center justify-center overflow-hidden">

              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-[url('/CoursesPage/happygirl.webp')] bg-cover bg-center opacity-70 mix-blend-overlay"></div>

              <div className="absolute top-4 right-4 text-3xl animate-[bounce_3s_infinite] delay-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100">🤩</div>
              <div className="absolute top-12 left-4 text-3xl animate-[bounce_4s_infinite] delay-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">🥰</div>
              <div className="absolute bottom-16 left-6 text-3xl animate-[bounce_3.5s_infinite] delay-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">😇</div>
              <div className="absolute bottom-10 right-6 text-3xl animate-[bounce_2.5s_infinite] opacity-0 transition-opacity duration-300 group-hover:opacity-100">🏆</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col items-center lg:items-start">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1f6f5e] flex items-center justify-center mt-1">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Tăng 1-1.5 band điểm IELTS sau 9 tuần</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Cam kết đảm bảo đầu ra sau 9 tuần, đã học là đạt band.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1f6f5e] flex items-center justify-center mt-1">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Đội ngũ giáo viên và công nghệ hỗ trợ</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Đội ngũ giáo viên 8.0, 9.0 IELTS siêu tận tâm và nền tảng siêu công nghệ đồng hành 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
