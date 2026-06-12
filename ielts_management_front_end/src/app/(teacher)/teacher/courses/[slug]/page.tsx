"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { courseService } from "@/services/courseService";
import { toast } from "react-toastify";
import { uploadService } from "@/services/uploadService";
import { userService, UserListItem } from "@/services/userService";
import { invitationService } from "@/services/invatationService";
import TeacherCourseDiscussions from "@/components/teacher/courses/TeacherCourseDiscussions";
import {
  ArrowLeft,
  BookOpen,
  BarChart2,
  User,
  UserPlus,
  Folder,
  CloudUpload,
  Edit2,
  Users,
  Video,
  FileText,
  CheckSquare,
  Star,
  Clock,
  Image as ImageIcon,
  ClipboardList,
  Book,
  ChevronRight,
  MessageSquare,
  Mail,
  PlaySquare,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import TeacherCourseInstructorCard from "@/components/teacher/courses/TeacherCourseInstructorCard";
import RichTextEditor from "@/components/teacher/RichTextEditor";
import { TeacherFeedbackWidget } from "@/components/teacher/courses/TeacherFeedbackWidget";
import { CourseGradingTab } from "@/components/teacher/courses/CourseGradingTab";
import CourseDetailSidebar from "@/components/teacher/courses/CourseDetailSidebar";
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import vi_VN from '@uppy/locales/lib/vi_VN';
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

type CoursePriceTier = {
  name: string;
  price: number;
  description?: string;
  features?: string[];
};

type CoursePublicInfo = {
  thumbnail?: string | null;
  shortDescription?: string;
  targetLevel?: string;
  courseOverview?: string;
};

type CourseUser = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  name?: string;
  avatar?: string;
};

type CourseDetail = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  courseDetail?: string | null;
  learningOutcomes?: string[];
  category?: string;
  level?: string;
  status?: string;
  teacher?: CourseUser | null;
  teachingAssistants?: CourseUser[];
  totalVideos?: number;
  totalExercises?: number;
  totalMockTests?: number;
  totalStudents?: number;
  averageRating?: number;
  totalReviews?: number;
  durationInHours?: number;
  estimatedWeeks?: number;
  promoVideoUrl?: string | null;
  isPublished?: boolean;
  courseStartDate?: string | null;
  courseEndDate?: string | null;
  publicInfo?: CoursePublicInfo;
  priceTiers?: CoursePriceTier[];
  createdAt?: string;
  updatedAt?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

export default function TeacherCourseDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [courseDetailDraft, setCourseDetailDraft] = useState("");
  const [learningOutcomesDraft, setLearningOutcomesDraft] = useState<string[]>([]);
  const [isSavingOverview, setIsSavingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [isEditingPublicInfo, setIsEditingPublicInfo] = useState(false);
  const [thumbnailDraft, setThumbnailDraft] = useState("");
  const [shortDescriptionDraft, setShortDescriptionDraft] = useState("");
  const [targetLevelDraft, setTargetLevelDraft] = useState("");
  const [isSavingPublicInfo, setIsSavingPublicInfo] = useState(false);
  const [publicInfoError, setPublicInfoError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isRequestingPreview, setIsRequestingPreview] = useState(false);

  const [promoVideoUrlDraft, setPromoVideoUrlDraft] = useState("");
  const [uppyPromoVideo, setUppyPromoVideo] = useState<any>(null);
  const [isDeletingPromo, setIsDeletingPromo] = useState(false);

  const [isSearchAssistantOpen, setIsSearchAssistantOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await userService.searchTeachers(searchQuery);
      if (res.success && res.data) {
        setSearchResults(res.data.results);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteAssistant = async (teacherId: string) => {
    if (!course?._id) return;
    setIsInviting(teacherId);
    try {
      const res = await invitationService.inviteAssistant(course._id, { teacherId });
      if (res.success || res.status === "success") {
        toast.success("Đã gửi lời mời trợ giảng thành công!");
        fetchCourse();
        setSearchQuery("");
      } else {
        toast.error(res.message || "Không thể gửi lời mời.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsInviting(null);
    }
  };

  const handleRequestPreview = async () => {
    if (!course?._id) return;
    setIsRequestingPreview(true);
    const response = await courseService.requestCoursePreview(course._id);
    if (response.status === "success") {
      toast.success("Đã gửi lời mời preview cho Admin thành công!");
      setCourse({ ...course, status: 'review' });
    } else {
      toast.error(response.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    }
    setIsRequestingPreview(false);
  };

  const fetchCourse = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    const response = await courseService.getMyCourseBySlug<CourseDetail>(
      slug as string
    );
    if (response.status === "success" && response.data) {
      setCourse(response.data);
    } else {
      setError(response.message || "Không thể tải thông tin khóa học.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchCourse();
  }, [slug]);

  useEffect(() => {
    const u = new Uppy({
      id: 'uppyPromoVideo',
      locale: vi_VN,
      restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ['video/*'], maxFileSize: 500 * 1024 * 1024 },
      autoProceed: true,
    });
    u.addUploader(async (fileIDs) => {
      for (const fileID of fileIDs) {
        const file = u.getFile(fileID);
        try {
          const signatureResponse = await uploadService.requestSignature({ resourceType: "video", folder: "videos" });
          if (signatureResponse.status === "error" || !signatureResponse.data) throw new Error(signatureResponse.message || "Lỗi lấy chữ ký");
          const sigData = signatureResponse.data;
          const formData = new FormData();
          formData.append('file', file.data as Blob);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', String(sigData.timestamp));
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);
          if (sigData.uploadPreset) formData.append('upload_preset', sigData.uploadPreset);

          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`);
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const currentFile = u.getFile(fileID);
                u.setFileState(fileID, {
                  progress: {
                    ...currentFile.progress,
                    uploadStarted: currentFile.progress?.uploadStarted ?? Date.now(),
                    bytesUploaded: event.loaded,
                    bytesTotal: event.total,
                    percentage: Math.round((event.loaded / event.total) * 100)
                  } as any
                });
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                setPromoVideoUrlDraft(response.secure_url);
                resolve(response);
              } else reject(new Error(`Lỗi Cloudinary`));
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
          });
        } catch (err) {
          u.emit('upload-error', file, err instanceof Error ? err : new Error('Upload failed'));
          throw err;
        }
      }
    });
    setUppyPromoVideo(u);
    return () => u.destroy();
  }, []);

  useEffect(() => {
    setDescriptionDraft(course?.description || "");
    setCourseDetailDraft(course?.courseDetail || "");
    setLearningOutcomesDraft(course?.learningOutcomes || []);
  }, [course?.description, course?.courseDetail, course?.learningOutcomes]);

  useEffect(() => {
    setThumbnailDraft(course?.publicInfo?.thumbnail || "");
    setShortDescriptionDraft(course?.publicInfo?.shortDescription || "");
    setTargetLevelDraft(course?.publicInfo?.targetLevel || "");
    setPromoVideoUrlDraft(course?.promoVideoUrl || "");
  }, [course?.publicInfo, course?.promoVideoUrl]);

  const handleSaveOverview = async () => {
    if (!course?._id) return;
    const nextDescriptionText = stripHtml(descriptionDraft);
    if (!nextDescriptionText) {
      setOverviewError("Mô tả tổng quan không được để trống.");
      return;
    }
    if (nextDescriptionText.length < 20) {
      setOverviewError("Mô tả tổng quan phải có ít nhất 20 ký tự.");
      return;
    }

    setIsSavingOverview(true);
    setOverviewError(null);
    const response = await courseService.updateCourse<CourseDetail>(course._id, {
      description: descriptionDraft,
      courseDetail: courseDetailDraft.trim() ? courseDetailDraft.trim() : null,
      learningOutcomes: learningOutcomesDraft.filter(val => val.trim() !== ""),
    });

    if (response.status === "success" && response.data) {
      setCourse(response.data);
      setIsEditingOverview(false);
      toast.success("Cập nhật thông tin khóa học thành công!");
    } else {
      setOverviewError(response.message || "Không thể cập nhật mô tả.");
      toast.error(response.message || "Không thể cập nhật mô tả.");
    }
    setIsSavingOverview(false);
  };

  const handleSavePublicInfo = async () => {
    if (!course?._id) return;

    setIsSavingPublicInfo(true);
    setPublicInfoError(null);
    const response = await courseService.updateCourse<CourseDetail>(course._id, {
      publicInfo: {
        ...course.publicInfo,
        thumbnail: thumbnailDraft.trim() ? thumbnailDraft.trim() : null,
        shortDescription: shortDescriptionDraft.trim(),
        targetLevel: targetLevelDraft.trim(),
      },
      promoVideoUrl: promoVideoUrlDraft.trim() ? promoVideoUrlDraft.trim() : null,
    });

    if (response.status === "success" && response.data) {
      setCourse(response.data);
      setIsEditingPublicInfo(false);
      toast.success("Cập nhật thông tin công khai thành công!");
    } else {
      setPublicInfoError(response.message || "Không thể cập nhật thông tin công khai.");
      toast.error(response.message || "Không thể cập nhật thông tin công khai.");
    }
    setIsSavingPublicInfo(false);
  };

  const handleDeletePromoVideo = async () => {
    if (!promoVideoUrlDraft) return;
    setIsDeletingPromo(true);
    try {
      await uploadService.deleteUpload(promoVideoUrlDraft, 'video');
      setPromoVideoUrlDraft("");
      if (course?._id) {
        await courseService.updateCourse(course._id, { promoVideoUrl: null });
        setCourse((prev) => prev ? { ...prev, promoVideoUrl: null } : prev);
      }
      toast.success("Xóa video xem thử thành công");
    } catch (err) {
      toast.error("Không thể xóa video.");
    } finally {
      setIsDeletingPromo(false);
    }
  };

  const handleThumbnailUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    setPublicInfoError(null);

    try {
      const signatureResponse = await uploadService.requestSignature({
        resourceType: "image",
        folder: "thumbnails",
      });

      if (signatureResponse.status !== "success" || !signatureResponse.data) {
        throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload.");
      }

      const uploadResult = await uploadService.uploadToCloudinary(
        file,
        signatureResponse.data
      );
      setThumbnailDraft(uploadResult.secure_url || "");
    } catch (error) {
      setPublicInfoError(
        error instanceof Error ? error.message : "Upload thumbnail thất bại."
      );
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const teacherName = useMemo(() => {
    if (!course?.teacher) return "Chưa gán";
    const name = `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.trim();
    return name || course.teacher.email || "Chưa gán";
  }, [course?.teacher]);

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách khóa học
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              {course?.title || "Chi tiết khóa học"}
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Slug: {course?.slug || slug}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-700">
              {course?.status || "unknown"}
            </span>
            {course?.status !== 'published' && course?.status !== 'review' && (
              <button
                onClick={handleRequestPreview}
                disabled={isRequestingPreview}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isRequestingPreview ? "Đang gửi..." : "Gửi admin preview"}
              </button>
            )}
            {course?.status === 'review' && (
              <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold tracking-wide text-amber-700">
                Đang trong quá trình kiểm duyệt
              </span>
            )}
            <span className="rounded-full bg-gray-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-700">
              {course?.category || "Chưa phân loại"}
            </span>
            <span className="rounded-full bg-gray-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-700">
              {course?.level || "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm font-medium text-gray-500 shadow-sm">
          Đang tải thông tin khóa học...
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-sm font-medium text-red-500 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && course && (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* SIDEBAR NAVIGATION */}
          <CourseDetailSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* MAIN TAB CONTENT */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">

                {/* Column 1: Cột trái (Rộng hơn) */}
                <div className="flex flex-col gap-6">
                  {/* Thống kê khóa học */}
                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h2 className="text-xl font-bold text-gray-900">
                      Thống kê khóa học
                    </h2>
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Học viên
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.totalStudents ?? 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500">
                          <Video className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Video
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.totalVideos ?? 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Bài tập
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.totalExercises ?? 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500">
                          <CheckSquare className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Mock tests
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.totalMockTests ?? 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                          <Star className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Đánh giá
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.averageRating ?? 0} / 5
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-500">
                            Thời lượng
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.durationInHours ?? 0} giờ
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  {/* Tổng quan */}
                  <section className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <button
                      className="absolute right-6 top-6 text-gray-400 transition-colors hover:text-gray-900"
                      onClick={() => {
                        setOverviewError(null);
                        setIsEditingOverview((prev) => !prev);
                      }}
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Tổng quan</h2>

                    {isEditingOverview ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">
                            Mô tả tổng quan
                          </p>
                          <RichTextEditor
                            value={descriptionDraft}
                            onChange={setDescriptionDraft}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                            Mô tả chi tiết
                          </p>
                          <RichTextEditor
                            value={courseDetailDraft}
                            onChange={setCourseDetailDraft}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-4 mb-2">
                            Mục tiêu / Kết quả đạt được
                          </p>
                          {learningOutcomesDraft.map((outcome, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={outcome}
                                onChange={(e) => {
                                  const newDraft = [...learningOutcomesDraft];
                                  newDraft[idx] = e.target.value;
                                  setLearningOutcomesDraft(newDraft);
                                }}
                                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                                placeholder="VD: Cải thiện kỹ năng nghe..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDraft = learningOutcomesDraft.filter((_, i) => i !== idx);
                                  setLearningOutcomesDraft(newDraft);
                                }}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setLearningOutcomesDraft([...learningOutcomesDraft, ""])}
                            className="text-sm font-medium text-[#1c7c78] hover:underline"
                          >
                            + Thêm mục tiêu
                          </button>
                        </div>
                        {overviewError && (
                          <p className="text-sm font-semibold text-red-500">
                            {overviewError}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={handleSaveOverview}
                            disabled={isSavingOverview}
                            className="rounded-full bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {isSavingOverview ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            onClick={() => {
                              setDescriptionDraft(course.description || "");
                              setCourseDetailDraft(course.courseDetail || "");
                              setLearningOutcomesDraft(course.learningOutcomes || []);
                              setOverviewError(null);
                              setIsEditingOverview(false);
                            }}
                            className="rounded-full border border-gray-200 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {course.description ? (
                          <div
                            className="mt-4 text-sm font-medium leading-relaxed text-gray-600 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                          />
                        ) : (
                          <p className="mt-4 text-sm font-medium leading-relaxed text-gray-600">
                            Chưa có mô tả.
                          </p>
                        )}

                        <div className="my-6 h-px bg-gray-100" />

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                            MÔ TẢ CHI TIẾT
                          </p>
                          {course.courseDetail ? (
                            <div
                              className="mt-2 text-sm text-gray-500 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: course.courseDetail }}
                            />
                          ) : (
                            <p className="mt-2 text-sm font-medium italic text-gray-500">
                              Không có mô tả chi tiết
                            </p>
                          )}
                        </div>

                        <div className="my-6 h-px bg-gray-100" />

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                            KẾT QUẢ ĐẠT ĐƯỢC
                          </p>
                          {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                            <ul className="mt-2 list-disc pl-5 text-sm font-medium text-gray-600 space-y-1">
                              {course.learningOutcomes.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm font-medium italic text-gray-500">
                              Chưa có thông tin
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </section>



                  {/* Thông tin công khai */}
                  <section className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <button
                      className="absolute right-6 top-6 text-gray-400 transition-colors hover:text-gray-900"
                      onClick={() => {
                        setPublicInfoError(null);
                        setIsEditingPublicInfo((prev) => !prev);
                      }}
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      Thông tin công khai
                    </h2>

                    {isEditingPublicInfo ? (
                      <div className="mt-6 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Thumbnail</p>
                          <div className="mt-2 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400">
                                {thumbnailDraft ? (
                                  <Image
                                    src={thumbnailDraft}
                                    alt="Thumbnail preview"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6" />
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900">
                                  <CloudUpload className="h-4 w-4" />
                                  <span>
                                    {isUploadingThumbnail ? "Đang tải ảnh..." : "Tải ảnh lên"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                    disabled={isUploadingThumbnail}
                                    className="sr-only"
                                  />
                                </label>
                                {thumbnailDraft && (
                                  <button
                                    type="button"
                                    onClick={() => setThumbnailDraft("")}
                                    className="text-left text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
                                  >
                                    Xóa thumbnail
                                  </button>
                                )}
                              </div>
                            </div>
                            {thumbnailDraft && (
                              <p className="text-xs text-gray-500">
                                Ảnh đã được tải lên Cloudinary.
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Giới thiệu ngắn</p>
                          <RichTextEditor
                            value={shortDescriptionDraft}
                            onChange={setShortDescriptionDraft}
                            className="mt-2"
                            editorClassName="min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Trình độ mục tiêu</p>
                          <input
                            type="text"
                            value={targetLevelDraft}
                            onChange={(e) => setTargetLevelDraft(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none"
                            placeholder="Ví dụ: 6.5+, 7.0 IELTS"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 block">
                            Video xem thử (Promo Video)
                          </p>
                          {promoVideoUrlDraft ? (
                            <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <video src={promoVideoUrlDraft} controls className="w-full rounded-xl max-h-64 object-contain" />
                              <button
                                type="button"
                                onClick={handleDeletePromoVideo}
                                disabled={isDeletingPromo}
                                className="absolute top-6 right-6 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-red-500 shadow hover:bg-red-50 disabled:opacity-50"
                              >
                                {isDeletingPromo ? "Đang xóa..." : "Xóa Video"}
                              </button>
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
                              {uppyPromoVideo ? (
                                <Dashboard
                                  uppy={uppyPromoVideo}
                                  hideUploadButton={true}
                                  proudlyDisplayPoweredByUppy={false}
                                  height={250}
                                  width="100%"
                                  theme="light"
                                />
                              ) : (
                                <div className="h-[250px] flex items-center justify-center animate-pulse text-gray-400">Đang tải uploader...</div>
                              )}
                            </div>
                          )}
                        </div>
                        {publicInfoError && (
                          <p className="text-sm font-semibold text-red-500">
                            {publicInfoError}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            onClick={handleSavePublicInfo}
                            disabled={isSavingPublicInfo || isUploadingThumbnail}
                            className="rounded-full bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {isUploadingThumbnail
                              ? "Đang tải ảnh..."
                              : isSavingPublicInfo
                                ? "Đang lưu..."
                                : "Lưu"}
                          </button>
                          <button
                            onClick={() => {
                              setThumbnailDraft(course.publicInfo?.thumbnail || "");
                              setShortDescriptionDraft(course.publicInfo?.shortDescription || "");
                              setTargetLevelDraft(course.publicInfo?.targetLevel || "");
                              setPromoVideoUrlDraft(course.promoVideoUrl || "");
                              setPublicInfoError(null);
                              setIsEditingPublicInfo(false);
                            }}
                            className="rounded-full border border-gray-200 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200 text-gray-400">
                            {course.publicInfo?.thumbnail ? (
                              <Image
                                src={course.publicInfo.thumbnail}
                                alt="Thumbnail"
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              Thumbnail
                            </p>
                            <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
                              {course.publicInfo?.thumbnail
                                ? "Đã cập nhật"
                                : "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-sm font-bold text-gray-900">
                            Giới thiệu ngắn
                          </p>
                          {course.publicInfo?.shortDescription ? (
                            <div
                              className="mt-1 text-xs font-medium italic text-gray-500"
                              dangerouslySetInnerHTML={{
                                __html: course.publicInfo.shortDescription,
                              }}
                            />
                          ) : (
                            <p className="mt-1 text-xs font-medium italic text-gray-500">
                              Chưa cập nhật
                            </p>
                          )}
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-sm font-bold text-gray-900">
                            Trình độ mục tiêu
                          </p>
                          <p className="mt-1 text-xs font-medium italic text-gray-500">
                            {course.publicInfo?.targetLevel || "Chưa cập nhật"}
                          </p>
                        </div>
                        {course.promoVideoUrl && (
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm font-bold text-gray-900 mb-2">
                              Video xem thử (Promo Video)
                            </p>
                            <video src={course.promoVideoUrl} controls className="w-full max-h-64 object-contain rounded-xl" />
                          </div>
                        )}
                        {/* Widget Feedback từ Admin */}
                        <TeacherFeedbackWidget courseId={course._id} />
                      </div>

                    )}
                  </section>

                  {/* Gói học phí (If any) */}
                  {course.priceTiers && course.priceTiers.length > 0 && (
                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                      <h2 className="text-xl font-bold text-gray-900">Gói học phí</h2>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {course.priceTiers.map((tier, index) => (
                          <div
                            key={`${tier.name}-${index}`}
                            className="rounded-2xl border border-gray-200 bg-white p-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-gray-900">
                                {tier.name}
                              </p>
                              <p className="text-sm font-bold text-[#1f6f5e]">
                                {tier.price.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                            {tier.description && (
                              <p className="mt-2 text-xs text-gray-500">
                                {tier.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                    </section>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  {/* Giáo viên */}
                  <TeacherCourseInstructorCard teacher={course.teacher} teacherName={teacherName} />

                  {/* Trợ giảng */}
                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Trợ giảng</h2>
                      <button
                        onClick={() => setIsSearchAssistantOpen(!isSearchAssistantOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isSearchAssistantOpen
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        {isSearchAssistantOpen ? "Đóng tìm kiếm" : "Mời trợ giảng"}
                      </button>
                    </div>

                    {isSearchAssistantOpen && (
                      <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Nhập tên hoặc email giáo viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            autoFocus
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
                          )}
                        </div>

                        {searchQuery.length > 0 && searchQuery.length < 2 && (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.
                          </div>
                        )}

                        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Không tìm thấy giáo viên nào phù hợp.
                          </div>
                        )}

                        {searchResults.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {searchResults.map((teacher) => {
                              const existingAssistantIds = (course?.teachingAssistants || []).map((a) => a._id);
                              const isAlreadyAssistant = existingAssistantIds.includes(teacher._id);

                              return (
                                <div
                                  key={teacher._id}
                                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                                      <Image
                                        src={teacher.avatar || "/default_images/avatar.jpg"}
                                        alt={teacher.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="truncate">
                                      <p className="font-semibold text-gray-900 text-xs truncate">
                                        {teacher.name}
                                      </p>
                                      <p className="text-[10px] text-gray-500 truncate">{teacher.email}</p>
                                    </div>
                                  </div>

                                  {isAlreadyAssistant ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-medium shrink-0">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Đã mời
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleInviteAssistant(teacher._id)}
                                      disabled={isInviting === teacher._id}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    >
                                      {isInviting === teacher._id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <UserPlus className="w-3 h-3" />
                                      )}
                                      Mời
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {course.teachingAssistants && course.teachingAssistants.length > 0 ? (
                      <div className="space-y-4">
                        {course.teachingAssistants.map((assistant, idx) => (
                          <div key={assistant._id || idx} className="flex items-center gap-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
                              <Image
                                src={assistant.avatar || "/default_images/avatar.jpg"}
                                alt={assistant.name || "Trợ giảng"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {assistant.name}
                              </p>
                              <p className="text-xs text-gray-500">{assistant.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Khóa học này chưa có trợ giảng.</p>
                    )}
                  </section>

                  {/* Lịch trình */}
                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h2 className="text-xl font-bold text-gray-900">Lịch trình</h2>
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                          BẮT ĐẦU
                        </p>
                        <p className="mt-1 text-base font-bold text-gray-900">
                          {formatDate(course.courseStartDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                          KẾT THÚC
                        </p>
                        <p className="mt-1 text-base font-bold text-gray-900">
                          {formatDate(course.courseEndDate)}
                        </p>
                      </div>

                      <div className="my-5 h-px bg-gray-100" />

                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500">Cập nhật:</span>
                        <span className="font-bold text-gray-900">
                          {formatDate(course.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500">Tạo lúc:</span>
                        <span className="font-bold text-gray-900">
                          {formatDate(course.createdAt)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Quản lý nội dung */}
                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h2 className="text-xl font-bold text-gray-900">
                      Quản lý nội dung
                    </h2>
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href={`/teacher/courses/${slug}/videos`}
                        className="group flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <PlaySquare className="h-5 w-5 text-gray-700" />
                          <span className="text-sm font-bold text-gray-900">
                            Đăng tải video
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-700" />
                      </Link>
                      <Link
                        href={`/teacher/courses/${slug}/exercises`}
                        className="group flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-5 w-5 text-gray-700" />
                          <span className="text-sm font-bold text-gray-900">
                            Đăng tải bài tập/ tài liệu
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-700" />
                      </Link>
                    </div>
                  </section>
                </div>
              </div>
            )}
            {activeTab === 'content' && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
                <Book className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Quản lý nội dung</h2>
                <p className="text-sm text-gray-500 mt-2">Tính năng này đang được phát triển.</p>
              </div>
            )}
            {activeTab === 'discussions' && (
              <TeacherCourseDiscussions courseId={course._id} />
            )}
            {activeTab === 'grading' && (
              <CourseGradingTab courseId={course._id} />
            )}
            {activeTab === 'messaging' && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
                <Mail className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Tin nhắn</h2>
                <p className="text-sm text-gray-500 mt-2">Tính năng này đang được phát triển.</p>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
                <BarChart2 className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Phân tích & Thống kê</h2>
                <p className="text-sm text-gray-500 mt-2">Tính năng này đang được phát triển.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}