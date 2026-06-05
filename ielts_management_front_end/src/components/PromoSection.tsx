"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";

export const PromoSection = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading || user) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#0c0c0d] py-24 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#f4e900]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-[#1c7c78]/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#f4e900]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Ưu đãi đặc biệt
          </span>
        </div>

        <h2 
          className="mb-6 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Bắt đầu hành trình chinh phục IELTS <br className="hidden md:block" />
          <span className="text-[#f4e900]">với ưu đãi 10%</span>
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60">
          Đăng ký tài khoản ngay hôm nay để nhận mã giảm giá 10% áp dụng cho tất cả các khóa học dành cho học viên mới. Đừng bỏ lỡ cơ hội nâng cao kỹ năng cùng các chuyên gia!
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#f4e900] px-8 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              Tạo tài khoản ngay
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
};
