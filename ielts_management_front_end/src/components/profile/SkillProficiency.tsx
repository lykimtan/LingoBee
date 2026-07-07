/**
 * Enrolled Courses & Progress Component (replaces former SkillProficiency)
 * Displays the courses that the student has enrolled in along with their learning progress
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  Award
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuthContext } from "@/context/AuthContext";

export interface EnrolledCourseItem {
  _id?: string;
  courseId: {
    _id?: string;
    title?: string;
    slug?: string;
    level?: string;
    category?: string;
    publicInfo?: {
      thumbnail?: string;
    };
  } | string;
  progress?: number;
  status?: string;
  enrollmentDate?: string;
}

export const SkillProficiency = () => {
  const { user, isLoading: authLoading } = useAuthContext();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEnrolledCourses = async () => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await userService.getUserProfile();
        const profile = res.data?.student || res.data;
        const courses = profile?.enrolledCourses || [];
        if (isMounted) {
          setEnrolledCourses(courses);
        }
      } catch (err) {
        console.error("Error fetching enrolled courses for profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading) {
      fetchEnrolledCourses();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm flex flex-col h-full justify-between shadow-xl text-white">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Khóa học & Tiến độ</h3>
              <p className="text-xs text-white/60">Lộ trình học tập bạn đang tham gia</p>
            </div>
          </div>

          <Link
            href="/courses"
            className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
          >
            <span>Khám phá thêm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Area */}
        {loading || authLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <p className="text-xs text-white/60 font-medium">Đang tải dữ liệu khóa học...</p>
          </div>
        ) : enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            {enrolledCourses.map((enroll, idx) => {
              const course = enroll.courseId;
              if (!course || typeof course !== "object") return null;

              const title = course.title || "Khóa học IELTS LingoBee";
              const slug = course.slug || course._id;
              const thumbnail = course.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp";
              const level = course.level || "IELTS";
              const category = course.category || "General";
              const progress = enroll.progress || 0;
              const status = enroll.status === "completed" || progress >= 100 ? "completed" : "active";

              return (
                <Link
                  href={`/courses/${slug}`}
                  key={enroll._id || idx}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 hover:bg-white/15 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/20">
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-amber-300">
                      {level}
                    </div>
                  </div>

                  {/* Info & Progress */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 truncate">
                        {category}
                      </span>
                      <span className="text-[11px] font-bold text-white/70 shrink-0">
                        {status === "completed" ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 inline" /> Hoàn thành
                          </span>
                        ) : (
                          <span>{progress}%</span>
                        )}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                      {title}
                    </h4>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 80
                            ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                            : "bg-gradient-to-r from-teal-400 to-cyan-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl p-8 text-center space-y-4 bg-white/5 border border-white/10 my-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-300 shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Bạn chưa đăng ký khóa học nào</h4>
              <p className="text-xs text-white/60 max-w-xs mx-auto">
                Hãy bắt đầu hành trình nâng cao điểm số IELTS & SAT ngay với các lộ trình từ chuyên gia LingoBee!
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all"
            >
              <span>Xem danh sách khóa học</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer / Summary */}
      {enrolledCourses && enrolledCourses.length > 0 && (
        <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Đang học: <strong className="text-white">{enrolledCourses.filter(c => (c.progress || 0) < 100 && c.status !== 'completed').length}</strong> khóa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Hoàn thành: <strong className="text-white">{enrolledCourses.filter(c => (c.progress || 0) >= 100 || c.status === 'completed').length}</strong> khóa</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const EnrolledCoursesProgress = SkillProficiency;
