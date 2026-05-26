import React, { useEffect, useState } from 'react';
import { exerciseService, ExerciseRecord } from '@/services/exerciseService';
import { CourseVideo } from '@/types';
import { ClipboardList, CheckCircle2, Circle, MessageSquare, Mic, HelpCircle } from 'lucide-react';
import { createSafeHtml } from '@/utils/utils';

interface CoursePreviewExercisesProps {
  activeVideo: CourseVideo | null;
}

export default function CoursePreviewExercises({ activeVideo }: CoursePreviewExercisesProps) {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeVideo?._id) {
      fetchExercises(activeVideo._id);
    } else {
      setExercises([]);
    }
  }, [activeVideo]);

  const fetchExercises = async (videoId: string) => {
    try {
      setIsLoading(true);
      const res = await exerciseService.getVideoExercises(videoId);
      if (res.success || res.status === 'success') {
        setExercises(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeVideo) return null;

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm text-center">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No Exercises</h3>
        <p className="text-gray-300 text-sm mt-1">There are no exercises attached to this lesson.</p>
      </div>
    );
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multipleChoice': return <CheckCircle2 className="w-4 h-4" />;
      case 'fillBlank': return <HelpCircle className="w-4 h-4" />;
      case 'essay': return <MessageSquare className="w-4 h-4" />;
      case 'speaking': return <Mic className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-gray-300" />
        Lesson Exercises
      </h3>

      <div className="space-y-6">
        {exercises.map((exercise, index) => (
          <div key={exercise._id} className="bg-white/5 rounded-lg border border-white/10 p-5">
            {/* Hiển thị tiêu đề bài tập (nếu có format) */}
            <div className="flex gap-2 text-md font-semibold text-white mb-2">
              <span>{index + 1}.</span>
              <div dangerouslySetInnerHTML={createSafeHtml(exercise.title)} />
            </div>

            {/* Hiển thị mô tả bài tập */}
            {exercise.description && (
              <div
                className="text-sm text-gray-300 mb-4 prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={createSafeHtml(exercise.description)}
              />
            )}

            <div className="space-y-4">
              {exercise.questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white/5 rounded-md p-4 border border-white/10">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-gray-400">
                      {getQuestionIcon(q.questionType)}
                    </div>
                    <div className="flex-1">
                      {/* Hiển thị nội dung câu hỏi */}
                      <div className="flex gap-2 text-sm font-medium text-white mb-2">
                        <span className="whitespace-nowrap">Q{qIndex + 1}:</span>
                        <div
                          className="prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={createSafeHtml(q.questionText)}
                        />
                      </div>

                      {/* Multiple Choice Options */}
                      {q.questionType === 'multipleChoice' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {q.options.map(opt => (
                            <div
                              key={opt.id}
                              className={`p-2 text-xs rounded border flex gap-1 ${q.correctOptionId === opt.id
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-white/5 border-white/10 text-gray-300'
                                }`}
                            >
                              <div dangerouslySetInnerHTML={createSafeHtml(opt.text)} />
                              {q.correctOptionId === opt.id && <span className="shrink-0"> (Correct)</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fill in Blank / Exact Match Answers */}
                      {q.questionType === 'fillBlank' && q.correctAnswers && (
                        <div className="mt-2 text-xs">
                          <span className="text-gray-400">Accepted answers: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {q.correctAnswers.map((ans, i) => (
                              <span key={i} className="px-2 py-1 bg-white/10 rounded text-gray-200">
                                {ans}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Essay Info */}
                      {q.questionType === 'essay' && (
                        <div className="mt-2 text-xs text-gray-400">
                          Minimum words required: <span className="text-white">{q.minWords || 'Not specified'}</span>
                        </div>
                      )}

                      {/* Speaking Info */}
                      {q.questionType === 'speaking' && (
                        <div className="mt-2 text-xs text-gray-400">
                          Time limit: <span className="text-white">{q.timeLimitSeconds ? `${q.timeLimitSeconds} seconds` : 'Not specified'}</span>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                          <span className="font-semibold block mb-1">Explanation:</span>
                          <div
                            className="prose prose-sm prose-invert max-w-none text-blue-200"
                            dangerouslySetInnerHTML={createSafeHtml(q.explanation)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}