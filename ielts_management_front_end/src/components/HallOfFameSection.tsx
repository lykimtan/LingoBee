"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, CheckCircle2 } from "lucide-react";

interface HallOfFameStudent {
  id: string;
  name: string;
  school: string;
  score: string;
  exam: string;
  category: string;
  teacher?: string;
  image: string;
}

const defaultStudents: HallOfFameStudent[] = [
  {
    id: "bao-vy",
    name: "Nguyễn Bảo Vy",
    school: "THPT Chuyên Trần Đại Nghĩa",
    score: "8.5",
    exam: "IELTS",
    category: "IELTS 8.5+",
    teacher: "GV Hoàng Anh Vũ",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuLzJJQUI3OTVReWlFS1NLemo0MFpQ",
  },
  {
    id: "huy-duc",
    name: "Hồ Huy Đức",
    school: "RMIT University Vietnam",
    score: "8.5",
    exam: "IELTS",
    category: "IELTS 8.5+",
    teacher: "GV Hoàng Anh Vũ",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL3pQTGdzVFRuVGtpSTJpVGJyU244",
  },
  {
    id: "tu-quynh",
    name: "Lâm Tử Quỳnh",
    school: "THPT Chuyên Lê Hồng Phong",
    score: "8.5",
    exam: "IELTS",
    category: "IELTS 8.5+",
    teacher: "GV Ngọc Thu",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2Ntb3dldjJ6NTF3OHEwODE0YW5iYXRlZTg=",
  },
  {
    id: "binh-an",
    name: "Trần Bình An",
    school: "Trường Phổ Thông Năng Khiếu",
    score: "8.0",
    exam: "IELTS",
    category: "IELTS 8.0",
    teacher: "GV Quang Minh",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2Ntb2JicGRocnR5MHcwNjFhczg2eTlnMnI=",
  },
  {
    id: "hoa-dien",
    name: "Nguyễn Hoa Điền",
    school: "TH, THCS & THPT Quốc Tế Á Châu",
    score: "8.0",
    exam: "IELTS",
    category: "IELTS 8.0",
    teacher: "GV Ngọc Thu",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2NtbXlia2ZzZjVzd2MwNzE4YjVhY2ZxMXk=",
  },
  {
    id: "linh-dan",
    name: "Phạm Linh Đan",
    school: "THPT Nguyễn Thượng Hiền",
    score: "8.0",
    exam: "IELTS",
    category: "IELTS 8.0",
    teacher: "GV Hoàng Anh Vũ",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2NtbWE0NmFjNGNrMjEwNzE4NWlpbTdhaTg=",
  },
  {
    id: "ngoc-anh",
    name: "Lê Ngọc Anh",
    school: "Đại học Ngoại Thương TP.HCM",
    score: "8.5",
    exam: "IELTS",
    category: "IELTS 8.5+",
    teacher: "GV Quang Minh",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2NtbDdzem1seXFmcjMwN3k5dXA1dmIyMDU=",
  },
  {
    id: "le-minh",
    name: "Bùi Lê Minh",
    school: "THPT Chuyên Lê Hồng Phong",
    score: "9.0",
    exam: "IELTS",
    category: "IELTS 8.5+",
    teacher: "GV Hoàng Anh Vũ",
    image: "https://img.dolenglish.vn/rs:auto:::0/w:700/q:90/format:webp/aHR0cHM6Ly9hc3NldC5kb2xlbmdsaXNoLnZuL2NtbDdwMmV4dW9ydTEwN3k5OTF4N25xM3E=",
  },
];

const filterCategories = [
  "Tất cả chương trình",
  "IELTS 8.5+",
  "IELTS 8.0",
];

export const HallOfFameSection = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả chương trình");

  const filteredStudents =
    activeCategory === "Tất cả chương trình"
      ? defaultStudents
      : defaultStudents.filter((s) => s.category === activeCategory);

  return (
    <section className="relative w-full bg-[#efece6] py-20 lg:py-28 overflow-hidden border-t border-slate-300/40">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#1c7c78]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c7c78]/10 text-[#1c7c78] text-xs font-bold tracking-widest uppercase">
              <Award className="w-4 h-4" />
              <span>Thành tích tự hào</span>
            </div>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl text-slate-900 font-normal tracking-tight"
            // style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Bảng vàng xuất sắc của <span className="text-amber-400 font-semibold">học viên LingoBee</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 ">
              Vinh danh những gương mặt học viên xuất sắc đã chinh phục thành công các mốc điểm 8.0 - 8.5+ IELTS và SAT 1500+ nhờ phương pháp đào tạo chuyên sâu.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${isActive
                    ? "bg-[#1c7c78] text-white shadow-md shadow-[#1c7c78]/25 scale-105"
                    : "bg-white/80 text-slate-700 hover:bg-white hover:text-[#1c7c78] border border-slate-200/80"
                    }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="group bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Card Top: Image Container */}
              <div>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <Image
                    src={student.image}
                    alt={student.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle dark overlay at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute top-0 right-4 z-10 bg-gradient-to-b from-[#ff304f] to-[#e31837] text-white pt-2.5 pb-3 px-3.5 rounded-b-2xl shadow-lg flex flex-col items-center border-b-2 border-[#0d3b3b] group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">
                      {student.score}
                    </span>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5 opacity-90">
                      {student.exam}
                    </span>
                  </div>

                  {/* Teacher Credit Badge at image bottom */}
                  {student.teacher && (
                    <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium">

                      <span>{student.teacher}</span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="px-1.5 space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1c7c78] transition-colors line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 line-clamp-1">
                    {student.school}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between px-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1c7c78]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chứng chỉ chính thức</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Hall of Fame</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call To Action / Stats banner */}
        <div className="mt-14 bg-gradient-to-r from-[#1c7c78] to-[#156161] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bạn sẵn sàng ghi tên vào Bảng vàng tiếp theo?
            </h3>
            <p className="text-slate-200 text-sm sm:text-base max-w-xl">
              Kiểm tra trình độ đầu vào miễn phí ngay hôm nay và xây dựng lộ trình cam kết chuẩn band 7.0 - 8.5+ cá nhân hóa.
            </p>
          </div>
          <a
            href="/placement-test"
            className="px-8 py-4 rounded-2xl bg-white text-[#1c7c78] font-bold text-sm sm:text-base shadow-lg hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 whitespace-nowrap flex-shrink-0 scale-100 hover:scale-105"
          >
            Kiểm tra trình độ ngay &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};
