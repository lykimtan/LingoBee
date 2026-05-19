"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/utils/api";
import { CourseVideo } from "@/types";
import VideoExerciseHeader from "@/components/teacher/courses/video-exercises/VideoExerciseHeader";
import VideoExercisePlayer from "@/components/teacher/courses/video-exercises/VideoExercisePlayer";
import VideoExerciseList from "@/components/teacher/courses/video-exercises/VideoExerciseList";
import VideoExerciseForm from "@/components/teacher/courses/video-exercises/VideoExerciseForm";
import SelectModal, { type SelectOption } from "@/components/teacher/SelectModal";
import ConfirmModal from "@/components/teacher/ConfirmModal";
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
  const [questionMode, setQuestionMode] = useState<"autoGraded" | "essayBased" | null>(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseRecord | null>(null);
  const [isDeletingExercise, setIsDeletingExercise] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const resolveQuestionMode = (exercise: ExerciseRecord | null) => {
    if (!exercise || !exercise.questions?.length) return null;
    const hasEssayType = exercise.questions.some((question) =>
      question.questionType === "essay" || question.questionType === "speaking"
    );
    return hasEssayType ? "essayBased" : "autoGraded";
  };

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
      setSelectedExercise(null);
      setQuestionMode(null);
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
    setSelectedExercise(null);
    setQuestionMode(null);
  };

  const handleCancelForm = () => {
    setSelectedExercise(null);
    setQuestionMode(null);
  };

  const handleCreateNewExercise = () => {
    setIsSelectModalOpen(true);
  };

  const handleEditExercise = (exercise: ExerciseRecord) => {
    setSelectedExercise(exercise);
    setQuestionMode(resolveQuestionMode(exercise));
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleRequestDeleteExercise = (exercise: ExerciseRecord) => {
    setExerciseToDelete(exercise);
  };

  const handleConfirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    setIsDeletingExercise(true);
    try {
      const response = await exerciseService.deleteExercise(exerciseToDelete._id);
      if (response.status === "error") {
        throw new Error(response.message || "Khong the xoa bai tap.");
      }

      setExercises((prev) => prev.filter((item) => item._id !== exerciseToDelete._id));
      if (selectedExercise?._id === exerciseToDelete._id) {
        setSelectedExercise(null);
        setQuestionMode(null);
      }
      setExerciseToDelete(null);
      toast.success("Xoa bai tap thanh cong!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Xoa bai tap that bai.";
      toast.error(message);
    } finally {
      setIsDeletingExercise(false);
    }
  };

  const questionModeOptions: SelectOption[] = [
    {
      value: "autoGraded",
      label: "Chấm tự động",
      description: "Fill blank, multiple choice and listening",
    },
    {
      value: "essayBased",
      label: "Tự luận",
      description: "Essay va speaking",
    },
  ];

  const handleConfirmQuestionMode = (value: string | number) => {
    setQuestionMode(value === "essayBased" ? "essayBased" : "autoGraded");
    setSelectedExercise(null);
    setIsSelectModalOpen(false);
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
        onDelete={handleRequestDeleteExercise}
      />
      {(selectedExercise || questionMode) && (
        <div ref={formRef}>
          <VideoExerciseForm
            videoTitle={video?.title}
            courseId={course?._id}
            videoId={video?._id}
            isDisabled={isLoading || !!error}
            onSaved={handleExerciseSaved}
            onCancel={handleCancelForm}
            initialExercise={selectedExercise}
            questionMode={questionMode}
          />
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateNewExercise}
          className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          Tạo bộ bài tập mới
        </button>
      </div>
      <SelectModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onConfirm={handleConfirmQuestionMode}
        options={questionModeOptions}
        initialValue={questionMode || undefined}
        title="Chọn loại bài tập"
        message="Bạn muốn tạo bài tập chấm tự động hay tự luận?"
        confirmText="Tiếp tục"
        cancelText="Hủy"
      />
      <ConfirmModal
        isOpen={Boolean(exerciseToDelete)}
        onClose={() => {
          if (!isDeletingExercise) {
            setExerciseToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteExercise}
        title="Xóa bộ bài tập này?"
        message="Toàn bộ các câu hỏi trong bài tập này sẽ bị xóa. Bạn có muốn tiếp tục không?"
        confirmText="Xóa"
        cancelText="Hủy"
        isDestructive
        isLoading={isDeletingExercise}
      />
    </div>
  );
}
