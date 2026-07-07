"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Target,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  ArrowRight,
  Bot,
  Compass,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
  HeartHandshake
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden flex flex-col justify-between">
      <Navigation />

      {/* Spacer below fixed Navigation */}
      <div className="h-16 lg:h-20 bg-slate-950" />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a2e2d] text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Glow & Blob Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1c7c78]/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-sm font-medium text-amber-300 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <span>Về chúng tôi — IELTS & SAT LingoBee</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
                Tái định nghĩa luyện thi <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  IELTS & SAT
                </span>{" "}
                cùng <span className="text-[#28b3ac]">Trí tuệ Nhân tạo</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Sự kết hợp hoàn hảo giữa đội ngũ chuyên gia giảng dạy sở hữu IELTS 8.0 - 8.5+ giàu kinh nghiệm và công nghệ AI đột phá, mang lại lộ trình học cá nhân hóa tối ưu và cam kết đầu ra vững chắc.
              </p>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/placement-test"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1c7c78] to-[#155e5b] text-white font-bold text-base shadow-lg shadow-[#1c7c78]/30 hover:shadow-[#1c7c78]/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Kiểm tra năng lực miễn phí</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/courses"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 border border-white/15 text-white font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  Khám phá khóa học
                </Link>
              </div>

              {/* Floating Highlights */}
              <div className="pt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c7c78]/20 flex items-center justify-center text-[#28b3ac] shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Speaking</div>
                    <div className="text-[11px] text-slate-400">Chấm từng âm tiết</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">IELTS 8.5+</div>
                    <div className="text-[11px] text-slate-400">Đội ngũ giảng viên</div>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cam kết 95%</div>
                    <div className="text-[11px] text-slate-400">Đạt band đầu ra</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE VALUES / WHY LINGOBEE */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c7c78]">Giá trị cốt lõi</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              Tại sao học viên lựa chọn <span className="text-[#1c7c78]">LingoBee</span>?
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Chúng tôi xây dựng hệ sinh thái học tập toàn diện, nơi công nghệ AI hiện đại song hành cùng tâm huyết của người thầy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#1c7c78]/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c7c78]/10 to-[#1c7c78]/20 flex items-center justify-center text-[#1c7c78] mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AI Trợ lực 24/7</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Chấm điểm phát âm Pronunciation chính xác từng âm tiết qua Azure Speech SDK, nhận diện từ vựng qua ảnh (YOLOv10 AI) và trợ giảng ảo Bee Thân Thiện luôn sẵn sàng giải đáp.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#1c7c78]">
                <span>Chấm điểm tức thì</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Lộ trình Cá nhân hóa</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Hệ thống kiểm tra năng lực đầu vào chuyên sâu, tự động xây dựng lộ trình học tập từ Pre-A1 đến C2 tập trung xoáy sâu vào khắc phục đúng điểm yếu của học viên.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-600">
                <span>Đúng trọng tâm</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1.5 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Giảng viên Tinh hoa</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  100% đội ngũ giáo viên sở hữu chứng chỉ IELTS 8.0 - 8.5+ cùng chứng chỉ sư phạm quốc tế, tận tâm theo sát từng bài làm và nhận xét chi tiết cho học viên.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                <span>Đồng hành sát sao</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Học tập Thực chiến</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Phương pháp học tương tác cao trực tiếp trên video bài giảng, ngân hàng bài tập tự luận và trắc nghiệm phong phú giúp ghi nhớ lâu và phản xạ nhạy bén.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                <span>Phản xạ tức thì</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. MILESTONES & NUMBERS THAT SPEAK */}
        <section className="py-20 bg-gradient-to-br from-[#0f3d3b] via-[#155e5b] to-[#1c7c78] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="space-y-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-4xl sm:text-5xl font-black text-amber-300">5,000+</div>
                <div className="text-sm sm:text-base font-bold text-white">Học viên thành công</div>
                <p className="text-xs text-slate-200">Chinh phục band điểm IELTS & SAT mong ước</p>
              </div>

              <div className="space-y-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-4xl sm:text-5xl font-black text-amber-300">8.5+</div>
                <div className="text-sm sm:text-base font-bold text-white">Điểm IELTS trung bình</div>
                <p className="text-xs text-slate-200">Của đội ngũ giảng viên và chuyên gia</p>
              </div>

              <div className="space-y-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-4xl sm:text-5xl font-black text-amber-300">95%</div>
                <div className="text-sm sm:text-base font-bold text-white">Đạt band cam kết</div>
                <p className="text-xs text-slate-200">Tỷ lệ học viên đạt hoặc vượt mục tiêu đầu ra</p>
              </div>

              <div className="space-y-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-4xl sm:text-5xl font-black text-amber-300">24/7</div>
                <div className="text-sm sm:text-base font-bold text-white">Hỗ trợ bởi AI</div>
                <p className="text-xs text-slate-200">Chấm điểm & giải đáp thắc mắc không ngừng nghỉ</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPARISON TABLE: LINGOBEE VS TRADITIONAL */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c7c78]">Sự khác biệt vượt trội</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              So sánh LingoBee và Phương pháp truyền thống
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Khám phá lý do vì sao hàng ngàn học viên lựa chọn LingoBee làm người bạn đồng hành tin cậy trên chặng đường chinh phục tri thức.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left: Traditional (5 cols) */}
              <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-50/70">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    <XCircle className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-700">Học lớp truyền thống</h4>
                    <p className="text-xs text-slate-500">Mô hình cũ, thụ động</p>
                  </div>
                </div>

                <ul className="space-y-5 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Chờ chấm bài lâu:</strong> Mất từ 3-5 ngày để giáo viên chấm xong bài nói/viết, dễ quên mất mạch tư duy ban đầu.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Ít cơ hội luyện phản xạ nói:</strong> Lớp đông học viên, mỗi bạn chỉ được nói 2-3 phút mỗi buổi học.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Lộ trình cào bằng:</strong> Tất cả học viên phải học cùng một giáo trình dù điểm yếu từng người khác nhau.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Khó theo dõi tiến độ:</strong> Ghi chép thủ công, không có biểu đồ thống kê để giáo viên kịp thời cảnh báo khi tụt hậu.</span>
                  </li>
                </ul>
              </div>

              {/* Right: LingoBee (7 cols) */}
              <div className="lg:col-span-7 p-8 sm:p-10 bg-gradient-to-br from-white via-white to-teal-50/30 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1c7c78]/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1c7c78] flex items-center justify-center text-white font-bold shadow-md shadow-[#1c7c78]/30">
                    <CheckCircle2 className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1c7c78]">Học tại IELTS LingoBee</h4>
                    <p className="text-xs text-slate-500">Mô hình AI kết hợp Chuyên gia tối ưu</p>
                  </div>
                </div>

                <ul className="space-y-5 text-sm text-slate-800 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1c7c78] shrink-0 mt-0.5" />
                    <span><strong>AI chấm điểm tức thì sau 5 giây:</strong> Phân tích chi tiết từng âm tiết (Pronunciation, Fluency, Accuracy) ngay sau khi nộp bài ghi âm.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1c7c78] shrink-0 mt-0.5" />
                    <span><strong>Luyện nói 1-1 không giới hạn:</strong> Thực hành phản xạ Speaking liên tục với hệ thống AI và phòng luyện tập chuyên sâu.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1c7c78] shrink-0 mt-0.5" />
                    <span><strong>Lộ trình thiết kế riêng biệt:</strong> Tự động điều chỉnh bài tập dựa trên điểm yếu của học viên qua kết quả Placement Test.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1c7c78] shrink-0 mt-0.5" />
                    <span><strong>Thống kê minh bạch & Giáo viên bám sát:</strong> Biểu đồ phân tích tiến độ thời gian thực giúp giáo viên chủ động hỗ trợ ngay khi học viên có dấu hiệu chững lại.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MEET OUR EXPERTS / FOUNDER VISION */}
        <section className="py-20 bg-slate-100/70 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c7c78]">Tâm huyết người truyền lửa</h2>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                Đội ngũ Chuyên gia & Giảng viên
              </h3>
              <p className="text-slate-600 text-sm sm:text-base">
                Sự kết hợp giữa trí tuệ sư phạm và tinh hoa công nghệ để mang đến trải nghiệm học tập tuyệt vời nhất.
              </p>
            </div>

            {/* Founder Quote Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#1c7c78]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#1c7c78]/20 border border-[#1c7c78]/40 flex items-center justify-center text-[#28b3ac] mx-auto">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <blockquote className="text-lg sm:text-2xl font-serif italic text-slate-200 leading-relaxed">
                  &ldquo;Chúng tôi tin rằng công nghệ không bao giờ thay thế được người thầy, nhưng người thầy biết sử dụng công nghệ sẽ thấu hiểu, đồng hành và giúp học viên bứt phá tốt gấp nhiều lần.&rdquo;
                </blockquote>
                <div>
                  <div className="font-bold text-white text-base">Ban Giảng huấn & Phát triển Công nghệ LingoBee</div>
                  <div className="text-xs text-[#28b3ac] font-medium mt-0.5">IELTS LingoBee EdTech Center</div>
                </div>
              </div>
            </div>

            {/* Expert Cards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md text-center space-y-4 hover:shadow-xl transition-all group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1c7c78] to-[#125353] mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#1c7c78]/20 group-hover:scale-105 transition-transform">
                  MS. L
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Cô Lan Phương</h4>
                  <p className="text-xs font-semibold text-[#1c7c78]">Chủ nhiệm Bộ môn IELTS Speaking</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                  IELTS 8.5 Overall (9.0 Speaking)
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hơn 7 năm kinh nghiệm giảng dạy, chuyên gia huấn luyện phát âm và ngữ điệu chuẩn bản xứ cho học viên Việt Nam.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md text-center space-y-4 hover:shadow-xl transition-all group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  MR. M
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Thầy Minh Tuấn</h4>
                  <p className="text-xs font-semibold text-[#1c7c78]">Chuyên gia SAT & IELTS Writing</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                  SAT 1560 / IELTS 8.5 Overall
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cựu học giả học bổng toàn phần, kiến tạo phương pháp tư duy logic và xây dựng dàn bài Writing khoa học, mạch lạc.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md text-center space-y-4 hover:shadow-xl transition-all group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  MS. H
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Cô Hoàng Hà</h4>
                  <p className="text-xs font-semibold text-[#1c7c78]">Chuyên gia IELTS Listening & Reading</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                  IELTS 8.5 Overall (9.0 L&R)
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tác giả của các bộ phương pháp giải đề tốc độ cao, giúp học viên rèn luyện kỹ năng nghe bắt từ khóa cực kỳ sắc bén.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CALL TO ACTION BANNER */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#1c7c78] via-[#155e5b] to-[#0d3b3b] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 uppercase tracking-widest">
              <span>Bắt đầu hành trình mới</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
              Sẵn sàng bứt phá điểm số IELTS & SAT của bạn ngay hôm nay?
            </h2>

            <p className="text-slate-200 text-base max-w-2xl mx-auto font-normal">
              Tham gia bài kiểm tra năng lực đầu vào miễn phí chỉ với 15 phút để nhận ngay lộ trình học tập cá nhân hóa được phân tích chi tiết bởi AI và chuyên gia LingoBee.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/placement-test"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Làm bài kiểm tra ngay</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Xem tất cả khóa học
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
