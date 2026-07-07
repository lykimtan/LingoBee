"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  GraduationCap,
  TrendingUp,
  Award,
  Loader2,
  Compass,
  Zap
} from "lucide-react";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import { useAuthContext } from "@/context/AuthContext";

export interface SkillProfileViewProps {
  skill: "listening" | "reading" | "speaking" | "writing";
}

const SKILL_CONFIG = {
  listening: {
    title: "Listening — Kỹ năng Nghe hiểu",
    subtitle: "Luyện tập phản xạ nghe bắt từ khóa, thấu hiểu giọng bản xứ và tối ưu điểm số IELTS Listening.",
    icon: Headphones,
    badgeColor: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
    gradient: "from-teal-600 via-[#1c7c78] to-cyan-800",
    accentColor: "text-teal-400",
    buttonColor: "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20",
    lightBg: "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md",
    keyword: "Listening",
  },
  reading: {
    title: "Reading — Kỹ năng Đọc hiểu",
    subtitle: "Rèn luyện kỹ năng Skimming, Scanning và phân tích xử lý gọn gàng các dạng bài đọc hiểu học thuật khó.",
    icon: BookOpen,
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    gradient: "from-amber-600 via-orange-600 to-amber-800",
    accentColor: "text-amber-400",
    buttonColor: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20",
    lightBg: "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md",
    keyword: "Reading",
  },
  speaking: {
    title: "Speaking — Kỹ năng Nói & Phát âm",
    subtitle: "Thực hành phản xạ nói 1-1 cùng AI, chuẩn hóa ngữ điệu Pronunciation và tự tin mở rộng ý tưởng lưu loát.",
    icon: Mic,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    gradient: "from-emerald-600 via-teal-600 to-emerald-800",
    accentColor: "text-emerald-400",
    buttonColor: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20",
    lightBg: "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md",
    keyword: "Speaking",
  },
  writing: {
    title: "Writing — Kỹ năng Viết luận",
    subtitle: "Nâng cấp tư duy lập luận logic, từ vựng học thuật cao cấp và cấu trúc bài viết mạch lạc chuẩn band cao.",
    icon: PenTool,
    badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    gradient: "from-indigo-600 via-purple-600 to-indigo-900",
    accentColor: "text-indigo-400",
    buttonColor: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20",
    lightBg: "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md",
    keyword: "Writing",
  },
};

const isStrictSkillMatch = (text: string, skillType: string) => {
  if (skillType === "listening") return text.includes("listening") || text.includes("nghe") || text.includes("hear") || text.includes("audio");
  if (skillType === "reading") return text.includes("reading") || text.includes("đọc") || text.includes("comprehension") || text.includes("skimming");
  if (skillType === "speaking") return text.includes("speaking") || text.includes("nói") || text.includes("pronunciation") || text.includes("giao tiếp") || text.includes("phát âm");
  if (skillType === "writing") return text.includes("writing") || text.includes("viết") || text.includes("essay") || text.includes("grammar") || text.includes("ngữ pháp");
  return false;
};

const matchesSkillKeyword = (text: string, skillType: string) => {
  if (isStrictSkillMatch(text, skillType)) return true;
  // Also include general IELTS/SAT/comprehensive courses that cover all skills
  return (
    text.includes("ielts") ||
    text.includes("sat") ||
    text.includes("overall") ||
    text.includes("4 kỹ năng") ||
    text.includes("comprehensive") ||
    text.includes("toàn diện") ||
    text.includes("mastery") ||
    text.includes("general") ||
    text.includes("foundation") ||
    !text.trim()
  );
};

export function SkillProfileView({ skill }: SkillProfileViewProps) {
  const config = SKILL_CONFIG[skill] || SKILL_CONFIG.listening;
  const Icon = config.icon;

  const { user, isLoading: authLoading } = useAuthContext();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user profile to get enrolled courses
        let allEnrolled: any[] = [];
        if (user) {
          const userRes = await userService.getUserProfile();
          const profile = userRes.data?.student || userRes.data;
          allEnrolled = profile?.enrolledCourses || [];
        }

        // 2. Fetch public courses for suggestions
        const publicRes = await courseService.getPublicCourses();
        const allPublic = (publicRes.data as any[]) || [];

        if (!isMounted) return;

        // Extract enrolled course IDs
        const enrolledIds = new Set(
          allEnrolled.map((item: any) => {
            const c = item.courseId;
            return String(c?._id || c?.id || c || "").trim();
          })
        );

        // Filter enrolled courses matching this skill
        const matchedEnrolled = allEnrolled.filter((item: any) => {
          const c = item.courseId;
          if (!c || typeof c !== "object") return false;
          const text = `${c.title || ""} ${c.category || ""} ${c.level || ""} ${c.description || ""}`.toLowerCase();
          return matchesSkillKeyword(text, skill);
        });

        // Filter suggested courses (public courses NOT yet enrolled)
        const notEnrolledPublic = allPublic.filter(
          (c) => !enrolledIds.has(String(c._id || "").trim())
        );

        // First try strictly matching skill keyword
        let matchedSuggested = notEnrolledPublic.filter((c) => {
          const text = `${c.title || ""} ${c.category || ""} ${c.level || ""} ${c.description || ""}`.toLowerCase();
          return isStrictSkillMatch(text, skill);
        });

        // If we don't have enough suggestions, append general IELTS/SAT courses
        if (matchedSuggested.length < 4) {
          const generalSuggested = notEnrolledPublic.filter((c) => {
            if (matchedSuggested.some((m) => m._id === c._id)) return false;
            const text = `${c.title || ""} ${c.category || ""} ${c.level || ""} ${c.description || ""}`.toLowerCase();
            return matchesSkillKeyword(text, skill);
          });
          matchedSuggested = [...matchedSuggested, ...generalSuggested];
        }

        setEnrolledCourses(matchedEnrolled);
        setSuggestedCourses(matchedSuggested);
      } catch (err) {
        console.error("Error fetching courses for skill profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [skill, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
        <p className="text-sm font-medium text-white/60">Đang tải tiến độ và danh sách khóa học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HEADER BANNER */}
      <div className={`relative rounded-3xl p-8 sm:p-12 text-white bg-gradient-to-br ${config.gradient} shadow-2xl border border-white/10 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/20 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/20">
              <Icon className="w-3.5 h-3.5" />
              <span>Kỹ năng Luyện thi IELTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{config.title}</h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">{config.subtitle}</p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold shadow-md">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium">Khóa học của bạn</div>
              <div className="text-2xl font-black text-white">{enrolledCourses.length} khóa</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: KHÓA HỌC ĐÃ ĐĂNG KÝ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${config.badgeColor}`}>
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Khóa học {config.keyword} của bạn</h2>
              <p className="text-xs sm:text-sm text-white/60">
                Tiếp tục hành trình học tập với các lộ trình bạn đang tham gia
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-white/80 bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md">
            {enrolledCourses.length} đang học
          </span>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enroll, idx) => {
              const course = enroll.courseId;
              if (!course || typeof course !== "object") return null;

              const title = course.title || "Khóa học IELTS";
              const slug = course.slug || course._id;
              const thumbnail = course.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp";
              const level = course.level || "IELTS";
              const category = course.category || "General";
              const progress = enroll.progress || 0;
              const status = enroll.status === "completed" || progress >= 100 ? "completed" : "active";

              return (
                <div
                  key={enroll._id || idx}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-white/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group text-white"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative w-full h-44 bg-white/5 overflow-hidden">
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-sm">
                      {level}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border">
                      {status === "completed" ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/20 border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã hoàn thành</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-amber-500/20 border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Đang học</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                        {category}
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-teal-300 transition-colors">
                        {title}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white/70">Tiến độ học tập</span>
                        <span className={progress >= 80 ? "text-emerald-400 font-bold" : "text-teal-400 font-bold"}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress >= 80
                            ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                            : "bg-gradient-to-r from-teal-400 to-cyan-400"
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/courses/${slug}`}
                      className={`w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${config.buttonColor}`}
                    >
                      <span>{progress > 0 ? "Tiếp tục học" : "Vào học ngay"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State Enrolled */
          <div className={`rounded-3xl p-10 text-center space-y-4 ${config.lightBg}`}>
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-sm flex items-center justify-center mx-auto text-white/80">
              <Icon className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">
                Bạn chưa đăng ký khóa học nào cho kỹ năng {config.keyword}
              </h3>
              <p className="text-xs sm:text-sm text-white/60">
                Hãy lựa chọn các lộ trình chất lượng cao được đề xuất ngay bên dưới để bắt đầu chinh phục mục tiêu IELTS của bạn!
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3. SECTION: GỢI Ý KHÓA HỌC TƯƠNG ĐƯƠNG */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Khóa học gợi ý cho kỹ năng {config.keyword}
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                Các lộ trình được chuyên gia LingoBee đề xuất riêng cho bạn
              </p>
            </div>
          </div>
          <Link
            href="/courses"
            className="text-sm font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Xem tất cả khóa học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {suggestedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedCourses.map((course) => {
              const title = course.title || "Khóa học IELTS";
              const slug = course.slug || course._id;
              const thumbnail = course.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp";
              const level = course.level || "IELTS";
              const category = course.category || "General";
              const teacherName = course.teacher?.name || course.teacher?.firstName || "Giảng viên LingoBee";
              const teacherAvatar = course.teacher?.avatar || "/CoursesPage/avatarTeacher.webp";

              return (
                <div
                  key={course._id}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-white/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group text-white"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative w-full h-44 bg-white/5 overflow-hidden">
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shadow-sm">
                      {level}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                      {category}
                    </div>
                  </div>

                  {/* Course Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-teal-300 transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-white/70 mt-2 line-clamp-2">
                        {course.description || "Khóa học chất lượng cao được thiết kế bài bản bởi đội ngũ chuyên gia IELTS LingoBee."}
                      </p>
                    </div>

                    {/* Teacher Footer & Action */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                          <Image
                            src={teacherAvatar}
                            alt={teacherName}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="text-xs font-semibold text-white/90 truncate">
                          {teacherName}
                        </div>
                      </div>

                      <Link
                        href={`/courses/${slug}`}
                        className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <span>Xem chi tiết khóa học</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State Suggested */
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 text-center border border-white/20 backdrop-blur-md shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Tuyệt vời! Bạn đã đăng ký hầu hết các lộ trình học hiện có
            </h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto">
              Hãy tiếp tục hoàn thành các khóa học trong danh sách của bạn để đạt kết quả xuất sắc nhất nhé.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
