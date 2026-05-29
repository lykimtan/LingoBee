"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CourseSideNav, CourseTab } from "./CourseSideNav";
import { motion, AnimatePresence } from "motion/react";
import { CreateCourseHeader } from "@/components/admin/courses/create/CreateCourseHeader";
import { CreateCourseShellForm } from "@/components/admin/courses/create/CreateCourseShellForm";
import { CourseShellSidebar } from "@/components/admin/courses/create/CourseShellSidebar";
import { AdminCourseItem } from "@/types";
import { courseService } from "@/services/courseService";
import Link from "next/link";



const formatDate = (value?: string) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

export function CoursesManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const activeTab = useMemo<CourseTab>(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "list" ||
      tabParam === "create" ||
      tabParam === "status" ||
      tabParam === "settings"
    ) {
      return tabParam;
    }
    return "list";
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "list") {
      return;
    }

    const loadCourses = async () => {
      setIsLoading(true);
      setError(null);
      const response = await courseService.getAllCourses();
      if (response.status === "success" && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách khóa học.");
      }
      setIsLoading(false);
    };

    void loadCourses();
  }, [activeTab]);

  const courseStats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((course) => course.status === "published").length;
    return { total, published };
  }, [courses]);

  const teachersList = useMemo(() => {
    const teachersMap = new Map();
    courses.forEach(c => {
      if (c.teacher) {
        const name = `${c.teacher.firstName || ""} ${c.teacher.lastName || ""}`.trim() || c.teacher.email || "Unknown";
        teachersMap.set(c.teacher._id, name);
      }
    });
    return Array.from(teachersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const teacherId = c.teacher?._id || "unassigned";
      const matchTeacher = filterTeacher === "all" || teacherId === filterTeacher;
      return matchStatus && matchTeacher;
    });
  }, [courses, filterStatus, filterTeacher]);

  return (
    <div className="flex flex-col gap-6 md:flex-row px-6">
      {/* Side Navigation */}
      <div className="shrink-0">
        <CourseSideNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            const nextUrl = tab === "list" ? pathname : `${pathname}?tab=${tab}`;
            router.replace(nextUrl);
          }}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[500px] flex-1 rounded-2xl bg-white/5 p-6 shadow-lg ring-1 ring-white/10 backdrop-blur-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === "list" && (
              <div className="flex h-full flex-col gap-6">
                <div className="flex flex-col gap-6 mb-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-white">Danh sách khóa học</p>
                      <p className="text-sm text-white/60">
                        Tổng {courseStats.total} khóa học • {courseStats.published} đã xuất bản
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={filterTeacher}
                        onChange={(e) => setFilterTeacher(e.target.value)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white shadow-sm focus:border-white/20 focus:outline-none custom-scrollbar"
                      >
                        <option value="all" className="bg-gray-800">Tất cả giáo viên</option>
                        {teachersList.map((t) => (
                          <option key={t.id} value={t.id} className="bg-gray-800">{t.name}</option>
                        ))}
                        <option value="unassigned" className="bg-gray-800">Chưa gán</option>
                      </select>
                    </div>
                  </div>

                  {/* Tabs for status */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                    {[
                      { value: "all", label: "Tất cả" },
                      { value: "published", label: "Đã xuất bản" },
                      { value: "review", label: "Đang kiểm duyệt" },
                      { value: "accepted", label: "Chưa nộp" },
                      { value: "invited", label: "Được mời" },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setFilterStatus(tab.value)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                          filterStatus === tab.value
                            ? "bg-white text-black"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                    Đang tải danh sách khóa học...
                  </div>
                )}

                {!isLoading && error && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {!isLoading && !error && filteredCourses.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                    Chưa có khóa học nào.
                  </div>
                )}

                {!isLoading && !error && filteredCourses.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map((course) => {
                      const teacherName = course.teacher
                        ? `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.trim() ||
                          course.teacher.email ||
                          "Chưa gán"
                        : "Chưa gán";
                      const thumbnail = course.publicInfo?.thumbnail || "";
                      const backgroundStyle = thumbnail
                        ? { backgroundImage: `url(${thumbnail})` }
                        : {
                            backgroundImage:
                              "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(31,111,94,0.35))",
                          };

                      return (
                        <Link
                          href={`/admin/courses/${course.slug}/preview`}
                          key={course._id}
                          className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white/90 shadow-sm"
                          style={backgroundStyle}
                        >
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={backgroundStyle} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
                          <div className="relative z-10 flex h-full flex-col justify-between p-5">
                            <div className="flex items-start justify-between gap-3">
                              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90">
                                {course.status || "unknown"}
                              </span>
                              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                                {course.level || "Chưa cập nhật"}
                              </span>
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                                {course.category || "Chưa phân loại"}
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-white">
                                {course.title}
                              </h3>
                              <p className="mt-2 text-xs text-white/70">Giáo viên: {teacherName}</p>
                              <p className="mt-1 text-xs text-white/70">
                                Học viên: {course.totalStudents ?? 0}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <p>Cập nhật: {formatDate(course.updatedAt || course.createdAt)}</p>
                              {course.slug && <p>Slug: {course.slug}</p>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "create" && (
              <div className="relative flex flex-col gap-8">
                <div className="pointer-events-none absolute -top-12 right-12 h-40 w-40 rounded-full bg-[#1f6f5e]/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 left-0 h-56 w-56 rounded-full bg-[#ffb800]/20 blur-[120px]" />

                <div className="relative flex flex-col gap-8">
                  <CreateCourseHeader />
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
                    <CreateCourseShellForm />
                    <CourseShellSidebar />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "status" && (
              <div className="flex h-full flex-col items-center justify-center text-white/50">
                <p className="text-xl">Quản lý trạng thái</p>
                <p className="text-sm">Component quản lý trạng thái khóa học sẽ nằm ở đây.</p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex h-full flex-col items-center justify-center text-white/50">
                <p className="text-xl">Cài đặt chung</p>
                <p className="text-sm">Component cài đặt khóa học sẽ nằm ở đây.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
