"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Send, UserPlus } from "lucide-react";
import clsx from "clsx";
import { courseService } from "@/services/courseService";
import { userService } from "@/services/userService";
import Image from "next/image";

const categories = [
  "speaking",
  "listening",
  "reading",
  "writing",
  "full-test",
  "grammar",
  "vocabulary",
];
const levels = [
  { value: "A1", label: "A1 ~ Ielts: 1 - 2.5" },
  { value: "A2", label: "A2 ~ Ielts: 2.5 - 3.5" },
  { value: "B1", label: "B1 ~ Ielts: 3.5 - 4.5" },
  { value: "B2", label: "B2 ~ Ielts: 4.5 - 5.5" },
  { value: "C1", label: "C1 ~ Ielts: 5.5 - 6.5" },
  { value: "C2", label: "C2 ~ Ielts: 6.5 - 7.5" },
];

type TeacherOption = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

export function CreateCourseShellForm() {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const [isTeacherMenuOpen, setIsTeacherMenuOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const teacherMenuRef = useRef<HTMLDivElement | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: categories[0],
    level: levels[2].value,
    teacherId: "",
    courseDetail: "",
    courseStartDate: "",
    courseEndDate: "",
    inviteMessage: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      setTeachersLoading(true);
      setTeachersError(null);
      const response = await userService.getTeachers();
      if (!isMounted) return;

      if (response.status === "success" && response.data?.users) {
        const options = response.data.users.map((teacher) => ({
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          avatar: teacher.avatar ?? null,
        }));
        setTeachers(options);
        setFormState((prev) => ({
          ...prev,
          teacherId: options[0]?.id ?? "",
        }));
      } else {
        setTeachersError(response.message || "Không thể tải danh sách giáo viên.");
      }
      setTeachersLoading(false);
    };

    void loadTeachers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isTeacherMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!teacherMenuRef.current) {
        return;
      }

      if (!teacherMenuRef.current.contains(event.target as Node)) {
        setIsTeacherMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTeacherMenuOpen]);

  const isValid = useMemo(() => {
    return (
      formState.title.trim().length >= 5 &&
      formState.description.trim().length >= 20 &&
      formState.category.length > 0 &&
      formState.level.length > 0 &&
      formState.teacherId.length > 0
    );
  }, [formState]);

  const missingFields = useMemo(() => {
    const missing: Record<string, string> = {};
    if (formState.title.trim().length < 5) {
      missing.title = "Vui lòng nhập tiêu đề (>= 5 ký tự).";
    }
    if (formState.description.trim().length < 20) {
      missing.description = "Vui lòng nhập mô tả (>= 20 ký tự).";
    }
    if (!formState.category) {
      missing.category = "Vui lòng chọn danh mục.";
    }
    if (!formState.level) {
      missing.level = "Vui lòng chọn trình độ.";
    }
    if (!formState.teacherId) {
      missing.teacherId = "Vui lòng chọn giáo viên.";
    }
    return missing;
  }, [formState]);

  const handleChange = (key: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const selectedTeacher = useMemo(() => {
    return teachers.find((teacher) => teacher.id === formState.teacherId) || null;
  }, [formState.teacherId, teachers]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    if (!isValid || isSubmitting) {
      setFieldErrors(missingFields);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      category: formState.category,
      level: formState.level,
      teacher: formState.teacherId,
      courseDetail: formState.courseDetail.trim() || undefined,
      courseStartDate: formState.courseStartDate || undefined,
      courseEndDate: formState.courseEndDate || undefined,
      inviteMessage: formState.inviteMessage.trim() || undefined,
    };

    const response = await courseService.createCourseShell(payload);
    if (response.status === "success") {
      setSuccessMessage("Đã tạo course shell và gửi lời mời giáo viên.");
      setHasSubmitted(false);
      setFormState((prev) => ({
        ...prev,
        title: "",
        description: "",
        courseDetail: "",
        courseStartDate: "",
        courseEndDate: "",
        inviteMessage: "",
      }));
    } else {
      if (response.errors?.length) {
        const nextErrors: Record<string, string> = {};
        response.errors.forEach((error) => {
          if (!error.field) {
            return;
          }
          const field =
            error.field === "teacher"
              ? "teacherId"
              : error.field === "courseStartDate" || error.field === "courseEndDate"
                ? error.field
                : error.field;
          if (!nextErrors[field]) {
            nextErrors[field] = error.message;
          }
        });
        setFieldErrors(nextErrors);
      }
      setSubmitError(response.message || "Tạo khóa học thất bại.");
    }
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#0f2326]/90 p-6 shadow-[0_20px_40px_-35px_rgba(0,0,0,0.8)] backdrop-blur"
    >
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Thông tin tổng quát của khóa học</h2>
            <p className="text-sm text-white/60">Đây là dữ liệu bắt buộc để tạo course shell.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Tiêu đề khóa học
            <input
              type="text"
              value={formState.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="IELTS Speaking Mastery"
              className={clsx(
                "rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                fieldErrors.title
                  ? "border-red-500/60 ring-red-500/30"
                  : "border-white/10 ring-[#1f6f5e]/40"
              )}
            />
            {hasSubmitted && (fieldErrors.title || missingFields.title) && (
              <span className="text-xs text-red-300">
                {fieldErrors.title || missingFields.title}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-white/70">
            Mô tả khóa học
            <textarea
              value={formState.description}
              onChange={(event) => handleChange("description", event.target.value)}
              placeholder="Giới thiệu tổng quan về mục tiêu khóa học, điểm nổi bật và kết quả học viên nhận được."
              rows={5}
              className={clsx(
                "rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                fieldErrors.description
                  ? "border-red-500/60 ring-red-500/30"
                  : "border-white/10 ring-[#1f6f5e]/40"
              )}
            />
            {hasSubmitted && (fieldErrors.description || missingFields.description) && (
              <span className="text-xs text-red-300">
                {fieldErrors.description || missingFields.description}
              </span>
            )}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Danh mục
              <div className="relative">
                <select
                  value={formState.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                  className={clsx(
                    "w-full appearance-none rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2 uppercase",
                    fieldErrors.category
                      ? "border-red-500/60 ring-red-500/30"
                      : "border-white/10 ring-[#1f6f5e]/40"
                  )}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              </div>
              {hasSubmitted && (fieldErrors.category || missingFields.category) && (
                <span className="text-xs text-red-300">
                  {fieldErrors.category || missingFields.category}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Trình độ
              <div className="relative">
                <select
                  value={formState.level}
                  onChange={(event) => handleChange("level", event.target.value)}
                  className={clsx(
                    "w-full appearance-none rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                    fieldErrors.level
                      ? "border-red-500/60 ring-red-500/30"
                      : "border-white/10 ring-[#1f6f5e]/40"
                  )}
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              </div>
              {hasSubmitted && (fieldErrors.level || missingFields.level) && (
                <span className="text-xs text-red-300">
                  {fieldErrors.level || missingFields.level}
                </span>
              )}
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Mời giáo viên</h2>
            <p className="text-sm text-white/60">Chọn giáo viên từ danh sách và gửi lời mời.</p>
          </div>
          <UserPlus className="h-5 w-5 text-[#ffb800]" />
        </div>

        {teachersError && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-200">
            {teachersError}
          </div>
        )}

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Giáo viên đứng lớp
            <div className="relative" ref={teacherMenuRef}>
              <button
                type="button"
                onClick={() => setIsTeacherMenuOpen((prev) => !prev)}
                disabled={teachersLoading || teachers.length === 0}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border bg-[#0b1d20] px-4 py-3 text-left text-white outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
                  fieldErrors.teacherId
                    ? "border-red-500/60 ring-red-500/30"
                    : "border-white/10 ring-[#1f6f5e]/40"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {selectedTeacher?.avatar ? (
                    <Image
                      src={selectedTeacher.avatar}
                      alt={selectedTeacher.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {teachersLoading
                        ? "Đang tải giáo viên..."
                        : selectedTeacher?.name || "Chọn giáo viên"}
                    </div>
                    <div className="truncate text-xs text-white/50">
                      {selectedTeacher?.email || ""}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-white/60" />
              </button>
              {hasSubmitted && (fieldErrors.teacherId || missingFields.teacherId) && (
                <span className="mt-2 block text-xs text-red-300">
                  {fieldErrors.teacherId || missingFields.teacherId}
                </span>
              )}

              {isTeacherMenuOpen && teachers.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-white/10 bg-[#0b1d20] p-2 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.8)]">
                  {teachers.map((teacher) => {
                    const isSelected = teacher.id === formState.teacherId;
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => {
                          handleChange("teacherId", teacher.id);
                          setIsTeacherMenuOpen(false);
                        }}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                          isSelected
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {teacher.avatar ? (
                          <Image
                            src={teacher.avatar}
                            alt={teacher.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                            N/A
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{teacher.name}</div>
                          <div className="truncate text-xs text-white/50">{teacher.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm text-white/70">
            Ghi chú lời mời (tùy chọn)
            <textarea
              value={formState.inviteMessage}
              onChange={(event) => handleChange("inviteMessage", event.target.value)}
              placeholder="Chia sẻ kỳ vọng hoặc thông tin thêm cho giáo viên."
              rows={3}
              className={clsx(
                "rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                fieldErrors.inviteMessage
                  ? "border-red-500/60 ring-red-500/30"
                  : "border-white/10 ring-[#1f6f5e]/40"
              )}
            />
            {hasSubmitted && fieldErrors.inviteMessage && (
              <span className="text-xs text-red-300">{fieldErrors.inviteMessage}</span>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Lịch trình & mở rộng</h2>
            <p className="text-sm text-white/60">Có thể cập nhật lại sau khi giáo viên chấp nhận.</p>
          </div>
          <Calendar className="h-5 w-5 text-[#ffb800]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Ngày bắt đầu
            <input
              type="date"
              value={formState.courseStartDate}
              onChange={(event) => handleChange("courseStartDate", event.target.value)}
              className={clsx(
                "rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                fieldErrors.courseStartDate
                  ? "border-red-500/60 ring-red-500/30"
                  : "border-white/10 ring-[#1f6f5e]/40"
              )}
            />
            {hasSubmitted && fieldErrors.courseStartDate && (
              <span className="text-xs text-red-300">{fieldErrors.courseStartDate}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-white/70">
            Ngày kết thúc
            <input
              type="date"
              value={formState.courseEndDate}
              onChange={(event) => handleChange("courseEndDate", event.target.value)}
              className={clsx(
                "rounded-2xl border bg-[#0b1d20] px-4 py-3 text-white outline-none transition focus:ring-2",
                fieldErrors.courseEndDate
                  ? "border-red-500/60 ring-red-500/30"
                  : "border-white/10 ring-[#1f6f5e]/40"
              )}
            />
            {hasSubmitted && fieldErrors.courseEndDate && (
              <span className="text-xs text-red-300">{fieldErrors.courseEndDate}</span>
            )}
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm text-white/70">
          Mô tả chi tiết (tùy chọn)
          <textarea
            value={formState.courseDetail}
            onChange={(event) => handleChange("courseDetail", event.target.value)}
            placeholder="Thông tin dài hơn để giáo viên bổ sung sau."
            rows={4}
            className="rounded-2xl border border-white/10 bg-[#0b1d20] px-4 py-3 text-white outline-none ring-[#1f6f5e]/40 transition focus:ring-2"
          />
        </label>
      </section>

      {submitError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-200">
          {submitError}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-white/60">
          Trạng thái khởi tạo: <span className="font-semibold text-[#ffb800]">invited</span>
        </div>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={clsx(
            "flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
            isValid && !isSubmitting
              ? "bg-[#1f6f5e] text-white shadow-lg shadow-[#1f6f5e]/40 hover:bg-[#2b806c]"
              : "cursor-not-allowed bg-white/10 text-white/40"
          )}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Đang tạo..." : "Tạo course shell"}
        </button>
      </div>
    </form>
  );
}
