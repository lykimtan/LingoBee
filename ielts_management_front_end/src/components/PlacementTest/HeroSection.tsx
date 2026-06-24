import React from 'react';
import { Zap, Clock, BarChart2, TrendingUp, CheckCircle2, Star } from 'lucide-react';

interface HeroSectionProps {
    onStart: () => void;
    isLoading?: boolean;
}

export default function HeroSection({ onStart, isLoading }: HeroSectionProps) {
    return (
        <section className="w-full flex justify-center font-sans pt-24 pb-20  relative overflow-hidden pt-28">
            <div className="absolute top-0 left-0 w-full h-full  opacity-30 pointer-events-none"></div>

            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 z-10">

                {/* Left Column: Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#FDE68A] text-[#92400E] font-semibold px-4 py-1.5 rounded-full text-sm w-max mb-6">
                        <Zap className="w-4 h-4 fill-current" />
                        Miễn phí 100%
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                        Bài Test Trình Độ <br /> IELTS
                    </h1>

                    <p className="text-gray-600 text-white mb-10 max-w-lg">
                        Hoàn toàn miễn phí, không cần đăng ký hay phát sinh chi phí. Nhận ngay kết quả sau khi hoàn thành.
                    </p>

                    {/* Features List */}
                    <div className="space-y-4 mb-10">

                        {/* Feature 1 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FAFC]">
                            <div className="w-12 h-12 rounded-xl bg-[#059669] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1E293B] text-lg">Kiểm tra nhanh chóng</h3>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    Xác định trình độ IELTS hiện tại của bạn chỉ trong <strong className="text-[#0D2B5A] font-bold">12 phút</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FAFC]">
                            <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                <BarChart2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1E293B] text-lg">Độ chính xác cao</h3>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    Ước lượng band điểm sát thực tế, dựa trên thang điểm <strong className="text-[#0D2B5A] font-bold">IELTS & CEFR</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FAFC]">
                            <div className="w-12 h-12 rounded-xl bg-[#F59E0B] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1E293B] text-lg">Cá nhân hóa</h3>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    Lộ trình học riêng biệt giúp bạn tiết kiệm thời gian và nâng band nhanh nhất.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* CTA Button */}
                    <div>
                        <button
                            onClick={onStart}
                            disabled={isLoading}
                            className="bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold text-lg py-4 px-10 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Đang chuẩn bị đề..." : "Bắt đầu bài test"}
                        </button>
                    </div>
                </div>

                {/* Right Column: Image Area */}
                <div className="w-full lg:w-1/2 relative flex items-center justify-center py-10">

                    {/* Background blob behind image */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#EEF2FF] rounded-full blur-3xl opacity-80 -z-10"></div>

                    {/* Main Image Container */}
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <img
                            src="/placementTest.webp"
                            alt="IELTS Test Illustration"
                            className="w-full max-w-lg h-auto object-cover rounded-2xl"
                        />
                        {/* Floating Badge 2: Bottom Right */}
                        <div className="absolute -right-4 bottom-8 bg-white/90 backdrop-blur-md rounded-2xl py-3 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2.5 border border-white border-opacity-50 animate-fade-rise-delay">
                            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                            <span className="font-bold text-[#1E293B] text-sm">100+ Lộ trình học</span>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}