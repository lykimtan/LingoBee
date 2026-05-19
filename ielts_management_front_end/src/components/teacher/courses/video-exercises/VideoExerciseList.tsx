"use client";

import type { ExerciseRecord } from "@/services/exerciseService";

interface VideoExerciseListProps {
  exercises: ExerciseRecord[];
  isLoading: boolean;
  error?: string | null;
  onEdit?: (exercise: ExerciseRecord) => void;
}

export default function VideoExerciseList({
  exercises,
  isLoading,
  error,
  onEdit,
}: VideoExerciseListProps) {
  const renderAnswers = (answers: string[]) => (
    <div className="flex flex-wrap gap-2">
      {answers.map((answer, index) => (
        <span
          key={`${answer}-${index}`}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
        >
          {answer}
        </span>
      ))}
    </div>
  );

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bai tap da tao</h3>
          <p className="text-sm font-medium text-gray-500">
            {exercises.length} bai tap
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-500">
            Dang tai bai tap...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm font-medium text-red-500">
            {error}
          </div>
        )}

        {!isLoading && !error && exercises.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-500">
            Video nay chua co bai tap nao.
          </div>
        )}

        {!isLoading && !error && exercises.length > 0 && (
          <div className="grid gap-3">
            {exercises.map((exercise) => (
              <div
                key={exercise._id}
                className="rounded-2xl border border-gray-100 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-gray-900">
                      {exercise.title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {exercise.description || "Bai tap ren luyen ky nang"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {(exercise.questions || []).length} cau hoi
                    </span>
                    <span>
                      {exercise.createdAt
                        ? new Date(exercise.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </span>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(exercise)}
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300"
                      >
                        Chinh sua
                      </button>
                    )}
                  </div>
                </div>

                {(exercise.questions || []).length > 0 && (
                  <div className="mt-4 space-y-3">
                    {(exercise.questions || []).map((question, index) => (
                      <div
                        key={`${exercise._id}-q-${index}`}
                        className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {question.questionType}
                          </div>
                          <div className="text-xs font-semibold text-gray-400">
                            Cau {index + 1}
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {question.questionText}
                        </p>

                        {question.questionType === "multipleChoice" && (
                          <div className="mt-2 space-y-1 text-sm text-gray-700">
                            {(question.options || []).map((option: { id: string; text: string }) => (
                              <div
                                key={option.id}
                                className={`rounded-lg px-3 py-2 ${
                                  option.id === question.correctOptionId
                                    ? "bg-green-50 text-green-700"
                                    : "bg-white"
                                }`}
                              >
                                {option.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.questionType === "fillBlank" &&
                          renderAnswers(question.correctAnswers || [])}

                        {question.questionType === "essay" && (
                          <div className="mt-2 text-xs font-medium text-gray-500">
                            So tu toi thieu: {question.minWords || 0}
                          </div>
                        )}

                        {question.questionType === "speaking" && (
                          <div className="mt-2 text-xs font-medium text-gray-500">
                            Audio prompt: {question.audioPromptUrl || "--"}
                            {question.timeLimitSeconds
                              ? ` · Gioi han ${question.timeLimitSeconds}s`
                              : ""}
                          </div>
                        )}

                        {question.skill === "listening" && (
                          <div className="mt-2 space-y-2 text-xs font-medium text-gray-500">
                            <div>Audio URL: {question.audioUrl || "--"}</div>
                            {question.transcript && (
                              <div>Transcript: {question.transcript}</div>
                            )}
                            {renderAnswers(question.correctAnswers || [])}
                            <div>
                              Exact match: {question.isExactMatch ? "Yes" : "No"}
                            </div>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
