"use client";

import { VideoHero } from "@/components/auth/VideoHero";
import { RegisterPanel } from "@/components/auth/RegisterPanel";

export default function RegisterPage() {
  return (
    <>
      {/* Left Side - Video Hero */}
      <div className="w-1/2 relative overflow-hidden hidden lg:block">
        <VideoHero />
      </div>

      {/* Right Side - Register Panel */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-6 sm:p-8 md:p-12">
        <RegisterPanel />
      </div>
    </>
  );
}
