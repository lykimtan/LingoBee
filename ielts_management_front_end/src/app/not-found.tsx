// app/not-found.tsx
"use client";

import Link from 'next/link';
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";

export default function NotFound() {
  const { user } = useAuthContext();
  
  let homeUrl = "/";
  let homeText = "Trở về Trang chủ";
  
  if (user?.role === "admin") {
    homeUrl = "/admin";
    homeText = "Trở về Trang Admin";
  } else if (user?.role === "teacher") {
    homeUrl = "/teacher";
    homeText = "Trở về Trang Giảng viên";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 flex max-w-lg flex-col items-center rounded-3xl bg-white/70 p-12 text-center shadow-2xl backdrop-blur-xl border border-white/50">
        <h1 className="text-9xl font-black tracking-tighter text-slate-800 drop-shadow-sm">
          404
        </h1>
        <Image
          src={"/notFoundGif.gif"}
          alt="Not Found"
          width={200}
          height={200}
          unoptimized
          sizes="200px"
          className="object-contain rounded-md"
        />
        
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-700">
            Trang không được tìm thấy
          </h2>
          <p className="text-slate-500 font-medium">
            Có vẻ như bạn đã đi lạc. Tuyến đường này không tồn tại hoặc đã được dời đi nơi khác.
          </p>
        </div>

        <Link 
          href={homeUrl} 
          className="mt-8 rounded-full bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
        >
          {homeText}
        </Link>
      </div>
    </div>
  );
}