import React from 'react';
import { ArrowRight, Play, Star, BookOpen, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const CourseHeroSection = () => {
  return (
    <section className="relative w-full bg-transparent overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8 animate-fade-rise">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
                Khóa học <span className="text-[#ffb800]">IELTS</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                Các khóa học IELTS tại trung tâm luôn cam kết đảm bảo đầu ra cho học viên với phương pháp học tập tối ưu và nền tảng công nghệ độc quyền do chúng tôi phát triển.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#ef4444] text-white font-semibold hover:bg-[#FF0000] transition-all shadow-lg shadow-[#1f6f5e]/30 group"
              >
                Liên hệ tư vấn ngay
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Xem khoá học
              </button>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[#e55039] font-bold text-2xl mb-1">
                    <TrendingUp className="w-6 h-6" />
                    2.5 band
                  </div>
                  <p className="text-sm text-gray-400">Số điểm trung bình được cải thiện</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[#e55039] font-bold text-2xl mb-1">
                    <Users className="w-6 h-6" />
                    3000+
                  </div>
                  <p className="text-sm text-gray-400">Bạn học đạt 7.0 điểm IELTS trở lên</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[#e55039] font-bold text-2xl mb-1">
                    <Star className="w-6 h-6" />
                    200+
                  </div>
                  <p className="text-sm text-gray-400">Bạn học đạt 8.0 điểm IELTS trở lên</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images/Mockups */}
          <div className="relative h-[600px] w-full flex justify-center items-center lg:justify-end animate-fade-in-delay">
            {/* Background blobs/decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#1f6f5e]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Main Phone/Card Mockup (Đã đảm bảo có z-10) */}
            <div className="relative z-10 w-[300px] h-[550px] bg-black rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-black">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black">
                {/* Simulated Image Content */}
                <div className="w-full h-full relative">
                  <video
                    src="/CoursesPage/advertiseVideo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Play Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>

                  {/* Content on Video */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider mb-2 inline-block">Review</span>
                    <p className="text-white text-sm leading-relaxed font-medium">
                      "IELTS học tưởng không dễ, nhưng mà lại dễ không tưởng nhờ phương pháp học đột phá."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Floating Badges - Đã thêm z-20 và tách lớp animation     */}
            {/* ========================================================= */}

            {/* Ceras Bee */}
            <div className="absolute top-12 right-[80%] z-20 animate-float">
              <div className="flex items-center gap-2 transform -rotate-12">
                <Image src="/CoursesPage/Ceras_bee.gif" alt="Ceras Bee" width={120} height={120} unoptimized className="object-contain transform -scale-x-100" />
                <div className="bg-red-600 text-white px-4 py-2 rounded-2xl rounded-br-sm shadow-xl font-bold text-xl">
                  IELTS
                </div>
              </div>
            </div>

            {/* Điểm & Review */}
            <div className="absolute top-24 -right-4 z-20 animate-float-delayed">
              <div className="bg-[#1f6f5e] text-white p-3 rounded-xl shadow-xl flex items-center gap-2 transform rotate-6 hover:scale-105 transition-transform cursor-pointer">
                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                <div className="text-xs font-bold leading-tight">
                  <div>Điểm &</div>
                  <div>Review</div>
                </div>
              </div>
            </div>

            {/* Phương pháp */}
            <div className="absolute top-48 -right-8 z-20 animate-float">
              <div className="bg-[#e55039] text-white p-3 rounded-xl shadow-xl flex items-center gap-2 transform -rotate-3 hover:scale-105 transition-transform cursor-pointer">
                <CheckCircle className="w-5 h-5" />
                <div className="text-xs font-bold leading-tight">
                  <div>Phương pháp</div>
                  <div>Độc quyền</div>
                </div>
              </div>
            </div>

            {/* Sách học */}
            <div className="absolute bottom-32 -right-4 z-20 animate-float-delayed">
              <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-xl flex items-center gap-2 transform rotate-3 hover:scale-105 transition-transform cursor-pointer">
                <BookOpen className="w-5 h-5" />
                <div className="text-xs font-bold leading-tight">
                  <div>Sách học</div>
                  <div>Chuyên sâu</div>
                </div>
              </div>
            </div>

            {/* Decorative scribbles */}
            <svg className="absolute -bottom-8 right-[70%] w-20 h-20 text-[#f5cd79] opacity-70 transform rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,50 Q20,20 40,50 T70,50 T90,30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M15,60 Q25,30 45,60 T75,60 T95,40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <svg className="absolute top-10 right-[90%] w-12 h-12 text-[#f5cd79] opacity-70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20,20 L40,40 M40,20 L20,40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M60,60 L80,80 M80,60 L60,80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>

          </div>
        </div>
      </div>
    </section>
  );
};