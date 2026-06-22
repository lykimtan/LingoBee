import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Layers, Image as ImageIcon } from "lucide-react";

export default function VocabularyToolsHub() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-blue-900/20 to-indigo-900/20 z-0 pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />

        {/* Spacer to push content down below fixed navigation */}
        <div className="h-16 lg:h-24" />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">

          <div className="text-center mb-16 max-w-3xl">
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 font-display">
              Vocabulary <span className="text-blue-400">Power Tools</span>
            </h1>
            <p className="text-lg text-gray-300">
              Bộ công cụ ghi nhớ từ vựng IELTS đỉnh cao. Học nhanh, nhớ lâu và phát âm chuẩn xác với công nghệ trí tuệ nhân tạo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

            {/* Tool 1: Flashcard */}
            <Link href="/vocabulary-tools/flashcards" className="group block">
              <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:bg-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-colors"></div>

                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Layers className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Smart Flashcards</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Ôn tập từ vựng bằng thẻ 3D kết hợp thuật toán lặp lại ngắt quãng (Spaced Repetition). Giúp bạn đưa từ vựng vào trí nhớ dài hạn.
                </p>

                <div className="inline-flex items-center text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Bắt đầu học
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Tool 2: Visual Vocab */}
            <Link href="/vocabulary-tools/visual-vocab" className="block h-full group">
              <div className="h-full bg-black/20 backdrop-blur-sm border border-white/5 group-hover:border-purple-500/30 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-7 h-7 text-purple-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Visual Vocabulary</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Học từ vựng trực quan. Sử dụng trí tuệ nhân tạo (YOLOv10) để phân tích hình ảnh và tự động bóc tách từ vựng tiếng Anh.
                </p>

                <div className="inline-flex items-center text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Trải nghiệm ngay
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
