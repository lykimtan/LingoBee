"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CourseVideo } from "@/types";
import TeacherVideoList from "@/components/teacher/courses/TeacherVideoList";
import ExerciseListGroup from "@/components/teacher/courses/exercises/ExerciseListGroup";
import ConfirmModal from "@/components/teacher/ConfirmModal";
import { videoService } from "@/services/videoService";
import { CourseSummary } from "@/types";
import { courseService } from "@/services/courseService";

const VideoPlayerModal = dynamic(() => import("@/components/teacher/VideoPlayerModal"), {
  ssr: false,
});



export default function TeacherCourseExercisesPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<CourseVideo | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setCourse(null);
      setVideos([]);

      if (!slug) {
        setError("Khong tim thay khoa hoc.");
        setIsLoading(false);
        return;
      }

      const courseResponse = await courseService.getMyCourseBySlug<CourseSummary>(slug);

      if (!isActive) return;

      if (courseResponse.status === "error" || !courseResponse.data) {
        setError(courseResponse.message || "Khong the tai thong tin khoa hoc.");
        setIsLoading(false);
        return;
      }

      setCourse(courseResponse.data);

      const videosResponse = await videoService.getVideosByCourse(courseResponse.data._id);
      if (!isActive) return;

      if (videosResponse.status === "success" && videosResponse.data) {
        setVideos(videosResponse.data);
      } else {
        setError(videosResponse.message || "Khong the tai danh sach video.");
      }

      setIsLoading(false);
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [slug]);

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

    setError(response.message || "Khong the xoa video.");
    setVideoToDelete(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-12">
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
            Quản lý bài tập
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Danh sách bài tập cho khóa học {course?.title || slug}.
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
        <div className="flex flex-col gap-8 lg:flex-row">
          <TeacherVideoList
            videos={videos}
            onPlay={setVideoToPlay}
            onDeleteRequest={setVideoToDelete}
          />
          <div className="flex-1">
            <ExerciseListGroup videos={videos} slug={course.slug} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!videoToDelete}
        onClose={() => !isDeleting && setVideoToDelete(null)}
        onConfirm={confirmDelete}
        title="Xoa video"
        message="Ban co chac chan muon xoa video nay khong? Hanh dong nay khong the hoan tac."
        confirmText="Xoa"
        cancelText="Huy"
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
