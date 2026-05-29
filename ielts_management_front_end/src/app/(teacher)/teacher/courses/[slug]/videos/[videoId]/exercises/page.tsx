"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { CourseVideo } from "@/types";
import VideoExerciseHeader from "@/components/teacher/courses/video-exercises/VideoExerciseHeader";
import VideoExercisePlayer from "@/components/teacher/courses/video-exercises/VideoExercisePlayer";
import VideoExerciseList from "@/components/teacher/courses/video-exercises/VideoExerciseList";
import VideoExerciseForm from "@/components/teacher/courses/video-exercises/VideoExerciseForm";
import SelectModal, { type SelectOption } from "@/components/teacher/SelectModal";
import ConfirmModal from "@/components/teacher/ConfirmModal";
import { exerciseService, type ExerciseRecord } from "@/services/exerciseService";
import { CourseSummary } from "@/types";
import { courseService } from "@/services/courseService";
import { videoService } from "@/services/videoService";
import { TeacherVideoFeedbackTab } from "@/components/teacher/courses/TeacherVideoFeedbackTab";
import TeacherMaterialUploader from "@/components/teacher/courses/TeacherMaterialUploader";
import PdfImageViewer from "@/components/public/PdfImageViewer";
import { FileText, Trash2 } from "lucide-react";


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
  const [isDeleteMaterialModalOpen, setIsDeleteMaterialModalOpen] = useState(false);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "feedback" | "material">("content");
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
        setError("Thiếu thông tin video hoặc khóa học.");
        setIsLoading(false);
        return;
      }

      const courseResponse = await courseService.getMyCourseBySlug<CourseSummary>(slug);

      if (!isActive) return;

      if (courseResponse.status === "error" || !courseResponse.data) {
        setError(courseResponse.message || "Không thể tải thông tin khóa học");
        setIsLoading(false);
        return;
      }

      setCourse(courseResponse.data);

      const videoResponse = await videoService.getVideosByCourse(
        courseResponse.data._id
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

  const handleUploadMaterialSuccess = async (materialUrl: string, materialName: string) => {
    if (!video) return;
    try {
      const response = await videoService.updateVideo(video._id, {
        materialUrl,
        materialName,
      });

      if (response.status === "error" || !response.data) {
        throw new Error(response.message || "Không thể cập nhật tài liệu cho video.");
      }

      setVideo(response.data);
      toast.success("Tải lên tài liệu thành công!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu tài liệu");
    }
  };

  const handleDeleteMaterial = async () => {
    setIsDeleteMaterialModalOpen(true);
  }

  const confirmDeleteMaterial = async () => {
    if (!video) return;
    setIsDeletingMaterial(true);
    try {
      const response = await videoService.updateVideo(video._id, {
        materialUrl: "",
        materialName: "",
      });
      if (response.status === "error" || !response.data) {
        throw new Error(response.message || "Không thể xóa tài liệu");
      };

      setVideo(response.data);
      toast.success("Đã xóa tài liệu thành công!");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa tài liệu");
    } finally {
      setIsDeletingMaterial(false);
      setIsDeleteMaterialModalOpen(false);
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

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 px-2">
        <button
          onClick={() => setActiveTab("content")}
          className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "content" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
        >
          Nội dung
          {activeTab === "content" && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("material")}
          className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "material" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
        >
          Tài liệu đính kèm
          {activeTab === "material" && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "feedback" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
        >
          Feedback
          {activeTab === "feedback" && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black rounded-t-full" />
          )}
        </button>

      </div>

      {/* Tab Panels */}
      {activeTab === "content" && (
        <div className="flex flex-col gap-8">
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCreateNewExercise}
              className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              Tạo bộ bài tập mới
            </button>
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="flex flex-col gap-8">
          <TeacherVideoFeedbackTab videoId={videoId as string} />
        </div>
      )}

      {activeTab === "material" && (
        <div className="flex flex-col gap-8">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Tài liệu đính kèm</h3>
            {video?.materialUrl ? (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-green-800 mb-0.5">Tài liệu đang hiển thị:</p>
                      <span className="truncate text-sm font-bold text-green-700 block text-left">
                        {video.materialName || "Tài liệu không tên"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteMaterial}
                    className="shrink-0 rounded-xl bg-white p-2 text-red-500 shadow-sm border border-red-100 hover:bg-red-50 hover:text-red-600 transition-colors group"
                    title="Xóa tài liệu"
                  >
                    <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-inner bg-gray-50 p-2 sm:p-4">
                  <PdfImageViewer pdfUrl={video.materialUrl} />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-4">
                  Chưa có tài liệu đính kèm cho bài học này. Kéo thả file PDF vào đây để tải lên:
                </p>
                <TeacherMaterialUploader
                  onUploadSuccess={handleUploadMaterialSuccess}
                  maxFileSizeMB={20}
                />
              </div>
            )}
          </div>
        </div>
      )}
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
      <ConfirmModal
        isOpen={isDeleteMaterialModalOpen}
        onClose={() => {
          // Nếu không đang loading xóa thì mới cho phép đóng
          if (!isDeletingMaterial) setIsDeleteMaterialModalOpen(false);
        }}
        onConfirm={confirmDeleteMaterial}
        title="Xóa tài liệu đính kèm?"
        message="Tài liệu này sẽ bị xóa vĩnh viễn khỏi bài học. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa tài liệu"
        cancelText="Hủy"
        isDestructive={true}
        isLoading={isDeletingMaterial}
      />

    </div>
  );
}
