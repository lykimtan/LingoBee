import { School, GraduationCap } from "lucide-react";

export function CreateCourseHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#112a2f] via-[#0f2326] to-[#142428] p-8 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.8)]">
      <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#ffb800]">
        <School className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60">
          <GraduationCap className="h-4 w-4 text-[#ffb800]" />
          Course shell workspace
        </div>
        <h1 className="text-3xl font-semibold text-white md:text-4xl" >
          Tạo khóa học mới
        </h1>
        <p className="max-w-2xl text-sm text-white/70 md:text-base">
          Nhập các thông tin cốt lõi, mời giáo viên đứng lớp và mở workflow nội dung.
        </p>
      </div>
    </section>
  );
}
