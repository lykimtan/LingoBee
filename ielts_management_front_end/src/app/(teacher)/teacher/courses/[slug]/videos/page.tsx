"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api";
import ConfirmModal from "@/components/teacher/ConfirmModal";
import dynamic from "next/dynamic";
import {videoService} from "@/services/videoService";
const VideoPlayerModal = dynamic(() => import("@/components/teacher/VideoPlayerModal"), {
  ssr: false,
});
import { ArrowLeft } from "lucide-react";
import TeacherVideoUploadForm from "@/components/teacher/courses/TeacherVideoUploadForm";
import TeacherVideoList from "@/components/teacher/courses/TeacherVideoList";
import { CourseVideo} from "@/types"

type CourseSummary = {
  _id: string;
  title: string;
  slug: string;
};

export default function TeacherCourseVideosPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<CourseVideo | null>(null);
  const [videoToEdit, setVideoToEdit] = useState<CourseVideo | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadCourse = async () => {
      setIsLoading(true);
      setError(null);

      const courseResponse = await apiClient.get<CourseSummary>(
        `/api/courses/my/${slug}`
      );
      if (courseResponse.status === "error" || !courseResponse.data) {
        setError(courseResponse.message || "Không thể tải thông tin khóa học.");
        setIsLoading(false);
        return;
      }

      setCourse(courseResponse.data);
      setIsLoading(false);
    };

    void loadCourse();
  }, [slug]);

   useEffect(() => {
      const loadVideos = async () => {
      if (!course?._id) return;
    
      // UI không cần biết endpoint là gì, chỉ cần gọi hàm
      const response = await videoService.getVideosByCourse(course._id);
    
      if (response.status === "success" && response.data) {
        setVideos(response.data);
    } else {
        setError(response.message || "Không thể tải danh sách video.");
      }
  };

  void loadVideos();
}, [course?._id]);

  const confirmDelete = async () => {
    if (!course?._id || !videoToDelete) return;

    setIsDeleting(true);
    const response = await videoService.deleteVideo(videoToDelete);
    setIsDeleting(false);

    if (response.status === "success") {
      setVideos((prev) => prev.filter((video) => video._id !== videoToDelete));
      setVideoToDelete(null);
      return;
    }

    setError(response.message || "Không thể xóa video.");
    setVideoToDelete(null);
  };

  const handleUploadSuccess = (newVideo: CourseVideo) => {
    setVideos((prev) => [...prev, newVideo].sort((a, b) => a.order - b.order));
  };

  const handleUpdateSuccess = (updatedVideo: CourseVideo) => {
    setVideos((prev) =>
      prev.map((video) => (video._id === updatedVideo._id ? updatedVideo : video))
    );
    setVideoToEdit(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/teacher/courses/${slug || ""}`}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết khóa học
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Đăng tải video
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Khu vực quản lý video cho khóa học {course?.title || slug}.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm font-medium text-gray-500 shadow-sm">
          Đang tải dữ liệu...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-sm font-medium text-red-500 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && course && (
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <TeacherVideoUploadForm 
            courseId={course._id} 
            onUploadSuccess={handleUploadSuccess}
            initialVideo={videoToEdit}
            onUpdateSuccess={handleUpdateSuccess}
            onCancelEdit={() => setVideoToEdit(null)}
          />
          <TeacherVideoList 
            videos={videos} 
            onPlay={setVideoToPlay} 
            onDeleteRequest={setVideoToDelete}
            onEdit={setVideoToEdit}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={!!videoToDelete}
        onClose={() => !isDeleting && setVideoToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa video"
        message="Bạn có chắc chắn muốn xóa video này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isDestructive={true}
        isLoading={isDeleting}
      />

      <VideoPlayerModal
        isOpen={!!videoToPlay}
        onClose={() => setVideoToPlay(null)}
        videoUrl={videoToPlay?.videoUrl || ""}
        title={videoToPlay?.title || ""}
      />
    </div>
  );
}
