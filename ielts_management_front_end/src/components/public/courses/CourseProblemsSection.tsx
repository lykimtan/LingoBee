import React from 'react';
import { X } from 'lucide-react';

export const CourseProblemsSection = () => {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white">
            Vấn đề học viên IELTS thường gặp phải
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-6 flex flex-col items-center lg:items-end">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e55039] flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Không biết bắt đầu từ đâu</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Kiến thức IELTS rộng lớn, tài liệu lại quá nhiều, cần 1 lộ trình hiệu quả.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e55039] flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Phương pháp học chưa hiệu quả</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Học tích luỹ kiểu cũ thì quá tốn sức mà không hiệu quả; học mẹo học tủ thì gặp đề lạ, khó là "tạch band".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Illustration */}
          <div className="relative flex justify-center py-8 lg:py-0 order-first lg:order-none">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#e55039]/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="group relative w-72 h-72 lg:w-80 lg:h-80 bg-white/10 border border-white/20 rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden">

              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-[url('/CoursesPage/sadgirl.webp')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6">
                <span className="text-white/60 text-sm font-medium italic">Hình ảnh học viên bế tắc (Placeholder)</span>
              </div>


              <div className="absolute top-4 right-4 text-3xl animate-[bounce_3s_infinite] delay-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100">😭</div>
              <div className="absolute top-12 left-4 text-3xl animate-[bounce_4s_infinite] delay-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">😵‍💫</div>
              <div className="absolute bottom-16 left-6 text-3xl animate-[bounce_3.5s_infinite] delay-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">😫</div>
              <div className="absolute bottom-10 right-6 text-3xl animate-[bounce_2.5s_infinite] opacity-0 transition-opacity duration-300 group-hover:opacity-100">😡</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col items-center lg:items-start">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e55039] flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Kẹt band, mất động lực</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Làm đề liên tục nhưng không tăng band, không tự tin đi thi, chán nản, muốn bỏ cuộc.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm transform hover:-translate-y-1 transition-transform shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e55039] flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Không ai theo sát, dễ bỏ cuộc</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Tự học không ai nhắc nhở, không ai chỉnh lỗi, không biết học đúng hay sai.
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
