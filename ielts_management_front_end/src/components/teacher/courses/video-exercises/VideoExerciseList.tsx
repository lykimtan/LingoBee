import type { ExerciseRecord } from "@/services/exerciseService";
import {
  FileText,
  ListChecks,
  Type,
  PenTool,
  Mic,
  Headphones,
  CheckCircle2,
  Info,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  FolderOpen
} from "lucide-react";

interface VideoExerciseListProps {
  exercises: ExerciseRecord[];
  isLoading: boolean;
  error?: string | null;
  onEdit?: (exercise: ExerciseRecord) => void;
  onDelete?: (exercise: ExerciseRecord) => void;
}

export default function VideoExerciseList({
  exercises,
  isLoading,
  error,
  onEdit,
  onDelete,
}: VideoExerciseListProps) {
  
  // Hàm render tag đáp án
  const renderAnswers = (answers: string[]) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {answers.map((answer, index) => (
        <span
          key={`${answer}-${index}`}
          className="inline-flex items-center gap-1 rounded-md bg-[#1f6f5e]/10 px-2.5 py-1 text-xs font-semibold text-[#1f6f5e] border border-[#1f6f5e]/20"
        >
          <CheckCircle2 className="h-3 w-3" />
          {answer}
        </span>
      ))}
    </div>
  );

  // Helper function để lấy icon và label theo dạng câu hỏi
  const getQuestionMeta = (type: string, skill?: string) => {
    if (skill === "listening") return { icon: Headphones, label: "Listening", color: "text-purple-600 bg-purple-50 border-purple-100" };
    switch (type) {
      case "multipleChoice": return { icon: ListChecks, label: "Trắc nghiệm", color: "text-blue-600 bg-blue-50 border-blue-100" };
      case "fillBlank": return { icon: Type, label: "Điền từ", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      case "essay": return { icon: PenTool, label: "Tự luận", color: "text-amber-600 bg-amber-50 border-amber-100" };
      case "speaking": return { icon: Mic, label: "Speaking", color: "text-rose-600 bg-rose-50 border-rose-100" };
      default: return { icon: FileText, label: "Câu hỏi", color: "text-gray-600 bg-gray-50 border-gray-100" };
    }
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Bài tập đính kèm</h3>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Học viên cần hoàn thành {exercises.length} bài tập sau khi xem video
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1f6f5e]"></div>
            <p className="mt-4 text-sm font-medium text-gray-500">Đang tải dữ liệu bài tập...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12">
            <div className="rounded-full bg-white p-3 shadow-sm mb-3">
              <FolderOpen className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Video này chưa có bài tập nào.</p>
          </div>
        )}

        {/* Exercises List */}
        {!isLoading && !error && exercises.length > 0 && (
          <div className="grid gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise._id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Exercise Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-bold text-gray-900">
                      {exercise.title}
                    </h4>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {exercise.description || "Bài tập rèn luyện kỹ năng tổng hợp"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                      <FileText className="h-3.5 w-3.5 text-gray-400" />
                      {(exercise.questions || []).length} câu hỏi
                    </span>
                    
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(exercise)}
                        className="inline-flex items-center justify-center rounded-full bg-white border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                        title="Chỉnh sửa bài tập"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(exercise)}
                        className="inline-flex items-center justify-center rounded-full bg-white border border-red-100 p-2 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <div className="p-5">
                  {(exercise.questions || []).length === 0 ? (
                    <p className="text-center text-sm italic text-gray-400">Chưa có câu hỏi nào được thêm vào.</p>
                  ) : (
                    <div className="space-y-4">
                      {(exercise.questions || []).map((question, index) => {
                        const meta = getQuestionMeta(question.questionType, question.skill);
                        const Icon = meta.icon;

                        return (
                          <div
                            key={`${exercise._id}-q-${index}`}
                            className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-900/5"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${meta.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                                {meta.label}
                              </div>
                              <span className="text-xs font-bold text-gray-400">
                                Câu {index + 1}
                              </span>
                            </div>

                            {/* Prompt/Text */}
                            <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {question.questionText}
                            </p>

                            {/* Options for Multiple Choice */}
                            {question.questionType === "multipleChoice" && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {(question.options || []).map((option: { id: string; text: string }) => {
                                  const isCorrect = option.id === question.correctOptionId;
                                  return (
                                    <div
                                      key={option.id}
                                      className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                                        isCorrect
                                          ? "border-green-200 bg-green-50 text-green-800 font-semibold"
                                          : "border-gray-100 bg-gray-50 text-gray-600"
                                      }`}
                                    >
                                      <span>{option.text}</span>
                                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Fill Blank Answers */}
                            {question.questionType === "fillBlank" && renderAnswers(question.correctAnswers || [])}

                            {/* Essay Limits */}
                            {question.questionType === "essay" && (
                              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                                <FileText className="h-4 w-4 text-gray-400" />
                                Tối thiểu: {question.minWords || 0} từ
                              </div>
                            )}

                            {/* Speaking Limits & Audio */}
                            {question.questionType === "speaking" && (
                              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                {question.audioPromptUrl && (
                                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <Headphones className="h-4 w-4 text-gray-400" />
                                    <span className="truncate max-w-[200px]">{question.audioPromptUrl}</span>
                                  </div>
                                )}
                                {question.timeLimitSeconds && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    Giới hạn: {question.timeLimitSeconds}s
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Listening specific UI */}
                            {question.skill === "listening" && (
                              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 space-y-2">
                                <div className="flex items-center gap-2 font-medium">
                                  <Headphones className="h-4 w-4" />
                                  <span className="truncate">Audio: {question.audioUrl || "--"}</span>
                                </div>
                                {question.transcript && (
                                  <div className="mt-2 border-t border-gray-200 pt-2 text-gray-500 italic">
                                    <span className="font-semibold text-gray-700 not-italic">Transcript:</span> {question.transcript}
                                  </div>
                                )}
                                <div className="mt-2">
                                  <span className="font-semibold text-gray-700">Đáp án chấp nhận:</span>
                                  {renderAnswers(question.correctAnswers || [])}
                                </div>
                                <div className="mt-1 text-gray-500">
                                  Khớp chính xác (hoa/thường): <span className="font-semibold">{question.isExactMatch ? "Có" : "Không"}</span>
                                </div>
                              </div>
                            )}

                            {/* Explanation Box */}
                            {question.explanation && (
                              <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-sm text-blue-800">
                                <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                <div>
                                  <span className="font-bold text-blue-900 block mb-0.5">Giải thích / Hướng dẫn</span>
                                  <p className="leading-relaxed">{question.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}