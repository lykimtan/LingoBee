"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/utils/api";
import { CourseVideo } from "@/types";
import VideoExerciseHeader from "@/components/teacher/courses/video-exercises/VideoExerciseHeader";
import VideoExercisePlayer from "@/components/teacher/courses/video-exercises/VideoExercisePlayer";
import VideoExerciseList from "@/components/teacher/courses/video-exercises/VideoExerciseList";
import VideoExerciseForm from "@/components/teacher/courses/video-exercises/VideoExerciseForm";
import { exerciseService, type ExerciseRecord } from "@/services/exerciseService";

type CourseSummary = {
  _id: string;
  title: string;
  slug: string;
};

export default function TeacherVideoExercisesPage() {
  const params = useParams<{ slug?: string | string[]; videoId?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const videoId = Array.isArray(params?.videoId) ? params.videoId[0] : params?.videoId;
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [video, setVideo] = useState<CourseVideo | null>(null);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setVideo(null);
      setExercises([]);
      setSelectedExercise(null);

      if (!slug || !videoId) {
        setError("Thieu thong tin video hoac khoa hoc.");
        setIsLoading(false);
        return;
      }

      const courseResponse = await apiClient.get<CourseSummary>(
        `/api/courses/my/${slug}`
      );

      if (!isActive) return;

      if (courseResponse.status === "error" || !courseResponse.data) {
        setError(courseResponse.message || "Khong the tai thong tin khoa hoc.");
        setIsLoading(false);
        return;
      }

      setCourse(courseResponse.data);

      const videoResponse = await apiClient.get<CourseVideo[]>(
        `/api/videos/course/${courseResponse.data._id}`
      );

      if (!isActive) return;

      if (videoResponse.status === "error" || !videoResponse.data) {
        setError(videoResponse.message || "Khong the tai danh sach video.");
        setIsLoading(false);
        return;
      }

      const matchedVideo = videoResponse.data.find((item) => item._id === videoId);

      if (!matchedVideo) {
        setError("Khong tim thay video duoc chon.");
        setIsLoading(false);
        return;
      }

      setVideo(matchedVideo);

      const exerciseResponse = await exerciseService.getVideoExercises(videoId);
      if (!isActive) return;

      if (exerciseResponse.status === "error") {
        setError(exerciseResponse.message || "Khong the tai bai tap.");
        setIsLoading(false);
        return;
      }

      const nextExercises = exerciseResponse.data || [];
      setExercises(nextExercises);
      setSelectedExercise(nextExercises[0] || null);
      setIsLoading(false);
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [slug, videoId]);

  const handleExerciseSaved = (nextExercise: ExerciseRecord) => {
    setExercises((prev) => {
      const index = prev.findIndex((item) => item._id === nextExercise._id);
      if (index === -1) return [nextExercise, ...prev];
      return prev.map((item) => (item._id === nextExercise._id ? nextExercise : item));
    });
    setSelectedExercise(nextExercise);
  };

  const handleCreateNewExercise = () => {
    setSelectedExercise(null);
  };

  const handleEditExercise = (exercise: ExerciseRecord) => {
    setSelectedExercise(exercise);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      <VideoExerciseHeader
        slug={slug || ""}
        courseTitle={course?.title}
        videoTitle={video?.title}
      />
      <VideoExercisePlayer video={video} isLoading={isLoading} error={error} />
      <VideoExerciseList
        exercises={exercises}
        isLoading={isLoading}
        error={error}
        onEdit={handleEditExercise}
      />
      <div ref={formRef}>
        <VideoExerciseForm
          videoTitle={video?.title}
          courseId={course?._id}
          videoId={video?._id}
          isDisabled={isLoading || !!error}
          onSaved={handleExerciseSaved}
          initialExercise={selectedExercise}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateNewExercise}
          className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          Tạo bộ bài tập mới
        </button>
      </div>
    </div>
  );
}
