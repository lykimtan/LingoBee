"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const teachers = [
  {
    id: "vu-hoang-anh",
    name: "Hoang Anh Vu",
    title: "Thac si Kinh te doi ngoai - DH Ngoai Thuong",
    band: "8.5",
    bio: "Chuyen gia IELTS Academic, dan dat hon 1,200 hoc vien dat band 7.0+.",
    highlights: [
      "Lecture model hien dai, tap trung ung dung",
      "Giao trinh IELTS/SAT rieng cho hoc vien Viet",
      "Cam ket dau ra ro rang theo lo trinh",
      "Bao tro cuoc thi noi bo hang thang",
    ],
    image: "/homepage/teacher_ngtaif.png",
  },
  {
    id: "thu-nguyen",
    name: "Ngoc Thu",
    title: "Certified CELTA | 10 nam kinh nghiem",
    band: "8.0",
    bio: "Chuyen IELTS Writing & Speaking, dinh hinh phong cach tu tin, tu duy logic.",
    highlights: [
      "Phong cach feedback 1-1 chi tiet",
      "Chuyen mon hoa IELTS Writing Task 2",
      "Huan luyen speaking theo chu de thuc te",
      "Theo sat tien do qua ban do nang luc",
    ],
    image: "/homepage/teacher_dinhnam.png",
  },
  {
    id: "minh-tran",
    name: "Quang Minh",
    title: "IELTS Trainer | 2 lan dat 8.5 overall",
    band: "8.5",
    bio: "Chuyen gia IELTS Listening & Reading, mo phong de thi sat thuc te.",
    highlights: [
      "He thong de thi rieng cap nhat hang thang",
      "Chien luoc toc do + do chinh xac",
      "Lop hoc nho, theo sat tung hoc vien",
      "Huong dan tu hoc hieu qua tai nha",
    ],
    image: "/homepage/teacher_huyForum.png",
  },
];

export const TeacherShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentTeacher = teachers[activeIndex];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % teachers.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % teachers.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  return (
    <section className="relative isolate w-full bg-[#efece6] text-slate-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src="/homepage/teachershowcase.webm"
            type="video/webm"
          />
        </video>
        <div className="absolute inset-0 bg-[#efece6]/70" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(23,88,88,0.08),_transparent_60%)]" />
      <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#1c7c78]/15 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#ef4444]/10 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-[#1c7c78] font-semibold">
                Đội ngũ chuyên môn
              </p>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl leading-tight font-normal"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Đội ngũ giáo viên chất như nước cất
                <span className="block text-[#1c7c78]">Tận tâm và nhiệt huyết</span>
              </h2>
              <p className="text-base text-slate-600 max-w-xl">
                Mỗi giáo viên đều là chuyên gia trong lĩnh vực của mình, mang đến lộ trình học cá nhân hóa, cách giải thích rõ ràng, dễ hiểu và cam kết chất lượng đầu ra.
              </p>
            </div>

            <div className="rounded-3xl bg-white/80 border border-white/60 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] p-8">
              <div key={currentTeacher.id} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#1c7c78] text-white px-4 py-1 text-xs tracking-[0.2em] uppercase">
                    IELTS {currentTeacher.band}
                  </span>
                  <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Expert
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-slate-900">
                    {currentTeacher.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">{currentTeacher.title}</p>
                </div>
                <p className="text-base text-slate-600">{currentTeacher.bio}</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {currentTeacher.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#ef4444]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-[#ef4444] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ef4444]/30 hover:scale-[1.02] transition-transform">
                Đăng ký tư vấn
              </button>
              <button className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-[#1c7c78] hover:text-[#1c7c78] transition-colors">
                Xem hồ sơ giảng viên
              </button>
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="relative w-full max-w-[420px] aspect-square">
              <div className="absolute inset-0">
                <Image
                  src="/homepage/sliderBackground.png"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 80vw, 420px"
                  className="object-contain scale-170"
                  priority
                />
              </div>
              <div className="absolute -right-6 top-6 h-24 w-24 rounded-2xl bg-[#1c7c78]/70 blur-sm" />
              <div className="absolute -left-6 bottom-12 h-20 w-20 rounded-2xl bg-[#ef4444]/70 blur-sm" />

              <div className="absolute -inset-24 translate-x-2 -translate-y-18 rounded-full overflow-hidden">
                <Image
                  key={currentTeacher.id}
                  src={currentTeacher.image}
                  alt={currentTeacher.name}
                  fill
                  className="object-cover object-top animate-slide-in-left"
                  sizes="(max-width: 1024px) 70vw, 420px"
                  priority
                />
              </div>

              <div className="absolute -bottom-10 -left-1/6 -translate-x-1/2 h-24 w-24">
                <Image
                  src="/homepage/StarIelts.png"
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-xl font-semibold leading-none">{currentTeacher.band}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em]">IELTS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 -translate-x-20 h-12 w-12 rounded-full bg-white/90 text-slate-700 shadow-lg hover:scale-105 transition-transform"
                aria-label="Previous teacher"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 translate-x-30 h-12 w-12 rounded-full bg-white/90 text-slate-700 shadow-lg hover:scale-105 transition-transform"
                aria-label="Next teacher"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="mt-10 flex items-center gap-3">
              {teachers.map((teacher, index) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to ${teacher.name}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${index === activeIndex
                    ? "bg-[#1c7c78] scale-110"
                    : "bg-slate-300 hover:bg-[#1c7c78]/60"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
