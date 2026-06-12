"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  learningService,
  ExerciseStudentData,
  ExerciseAttemptAnswer,
  ExerciseQuestion
} from "@/services/learningService";
import { Loader2, Save, Send, ArrowLeft, ArrowRight, RotateCcw, FileText, Clock, Sparkles } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { WordCountIndicator } from '@/components/common/WordCountIndicator';
import SpeakingAIFeedback from './SpeakingAIFeedback';
import { toast } from "react-toastify";
import ResultModal from "./ResultModal";
import AudioRecorder from "./AudioRecorder";
import AITutorPanel from "./AITutorPanel";

interface ExerciseInterfaceProps {
  exerciseId: string;
}

export const ExerciseInterface = ({ exerciseId }: ExerciseInterfaceProps) => {
  const [data, setData] = useState<ExerciseStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<ExerciseAttemptAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);

  useEffect(() => {
    // Reset states when changing exercises
    setShowAITutor(false);
    setCurrentIndex(0);

    const fetchExercise = async () => {
      try {
        setLoading(true);
        const response = await learningService.getExerciseForStudent(exerciseId);
        if (response.success && response.data) {
          setData(response.data);

          if (response.data.attempt && response.data.attempt.answers.length > 0) {
            setAnswers(response.data.attempt.answers);
          } else {
            // Initialize empty answers for all questions
            const initialAnswers = response.data.exercise.questions.map(q => ({
              questionId: q._id,
              questionType: q.questionType,
              selectedOptionId: null,
              blankAnswers: q.questionType === 'fillBlank' ? [] : undefined,
              essayAnswer: q.questionType === 'essay' ? "" : undefined,
            }));
            setAnswers(initialAnswers);
          }
        } else {
          setError("Failed to load exercise");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const handleNext = () => {
    if (currentIndex < (data?.exercise.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAITutor(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAITutor(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any, field: keyof ExerciseAttemptAnswer) => {
    setAnswers(prev => prev.map(ans =>
      ans.questionId === questionId ? { ...ans, [field]: value } : ans
    ));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await learningService.saveExerciseProgress(exerciseId, answers);
      toast.success("Đã lưu nháp thành công!");
    } catch (err) {
      toast.error("Lỗi khi lưu nháp");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitModalOpen(false);

    try {
      setSaving(true);
      const response = await learningService.submitExerciseAttempt(exerciseId, answers);
      if (response.success && response.data) {
        setData(prev => prev ? {
          ...prev,
          attempt: response.data!.attempt || null,
          exercise: {
            ...prev.exercise,
            questions: response.data!.questions || prev.exercise.questions
          }
        } : null);
        if (response.data!.attempt?.answers) {
          setAnswers(response.data!.attempt.answers);
        }
        toast.success("Đã nộp bài thành công!");
        setIsResultModalOpen(true);
      }
    } catch (err) {
      toast.error("Lỗi khi nộp bài");
    } finally {
      setSaving(false);
    }
  };

  const handleAIGrading = async () => {
    try {
      setIsAIGrading(true);
      setSaving(true);

      // Save current draft first so backend has latest audio urls
      await learningService.saveExerciseProgress(exerciseId, answers);

      // Call AI Grading endpoint
      const response = await learningService.gradeSpeakingWithAI(exerciseId);

      if (response.success && response.data) {
        setData(prev => prev ? {
          ...prev,
          attempt: response.data || null,
        } : null);
        if (response.data.answers) {
          setAnswers(response.data.answers);
        }
        toast.success("AI đã chấm điểm xong!");
      }
    } catch (err) {
      toast.error("Lỗi khi chấm điểm bằng AI");
    } finally {
      setIsAIGrading(false);
      setSaving(false);
    }
  };

  const handleConfirmRetake = () => {
    setIsRetakeModalOpen(false);
    setData(prev => prev ? {
      ...prev,
      attempt: prev.attempt ? {
        ...prev.attempt,
        status: 'in_progress',
        answers: []
      } : null
    } : null);

    if (data?.exercise) {
      const initialAnswers = data.exercise.questions.map(q => ({
        questionId: q._id,
        questionType: q.questionType,
        selectedOptionId: null,
        blankAnswers: q.questionType === 'fillBlank' ? [] : undefined,
        essayAnswer: q.questionType === 'essay' ? "" : undefined,
      }));
      setAnswers(initialAnswers);
    }
    setCurrentIndex(0);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  if (error || !data) return <div className="p-8 text-red-400 bg-red-400/10 rounded-xl">{error || "Exercise not found"}</div>;

  const isSubmitted = data.attempt?.status === 'submitted' || data.attempt?.status === 'graded';
  const { exercise } = data;
  const questions = exercise.questions;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);
  const hasEssayOrSpeaking = questions.some((q: ExerciseQuestion) => q.questionType === 'essay' || q.questionType === 'speaking');
  const isPending = isSubmitted && hasEssayOrSpeaking && data?.attempt?.status === 'submitted';

  // Calculate score if submitted
  let correctCount = 0;
  if (isSubmitted && data.attempt) {
    data.attempt.answers.forEach(ans => {
      if (ans.isCorrect) correctCount++;
    });
  }
  const accuracy = isSubmitted ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="bg-transparent flex flex-col min-h-[600px] font-sans">

      {/* General Exercise Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-white/70 leading-relaxed text-sm lg:text-base">
            {exercise.description}
          </p>
        )}
      </div>

      {/* Result Banner */}
      {isSubmitted && (
        <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">

            <div className="flex flex-col gap-3 mt-2 md:mt-0">
              <div className="flex items-center justify-center md:justify-start gap-4">
                {isPending ? (
                  <>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/20 relative flex items-center justify-center bg-indigo-500/10 shrink-0">
                      <Clock className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-2xl">Đang chờ chấm điểm</h4>
                      <p className="text-white/70 font-medium text-lg">Bài làm của bạn đã được gửi thành công. Vui lòng quay lại sau.</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Biểu đồ tròn */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * accuracy) / 100} style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }} />
                      </svg>
                      <span className="absolute text-2xl font-bold text-white">{accuracy}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-2xl">Kết quả bài làm</h4>
                      <p className="text-white/70 font-medium text-lg">Bạn đã trả lời đúng <strong className="text-emerald-500">{correctCount}</strong> trên tổng số <strong>{questions.length}</strong> câu hỏi.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isPending && (
            <button
              onClick={() => setIsRetakeModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center gap-3 w-full md:w-auto justify-center shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Làm lại bài
            </button>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Câu hỏi {currentIndex + 1} / {questions.length}</h2>
        </div>
        {isSubmitted && (
          <div className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide">
            ĐÃ NỘP BÀI
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-white/60 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="w-full">

        {/* Left Column (Question Area) */}
        <div className="flex flex-col gap-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">

            {/* Header: Number & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0">
                {String(currentIndex + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Question Text (Blockquote style) */}
            <div className="border-l-4 border-white/20 pl-6 py-2 my-2">
              <div
                className="text-lg text-white font-bold italic"
                dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }}
              />
            </div>

            {/* Audio Player & Transcript for Listening Exercises */}
            {currentQuestion.audioUrl && (
              <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xs uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    Audio File
                  </span>
                </div>
                <audio controls className="w-full h-10 rounded-lg outline-none" src={currentQuestion.audioUrl} />

                {/* Transcript - Only visible after submission */}
                {isSubmitted && currentQuestion.transcript && (
                  <details className="group border border-white/10 rounded-xl overflow-hidden">
                    <summary className="bg-white/5 px-4 py-3 cursor-pointer select-none text-emerald-400 font-bold text-sm flex items-center justify-between hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Xem Transcript (Nội dung bài nghe)
                      </span>
                      <span className="transition-transform duration-300 group-open:rotate-180 text-white/50">▼</span>
                    </summary>
                    <div
                      className="p-5 bg-black/30 text-white/80 text-sm leading-relaxed max-h-80 overflow-y-auto prose prose-invert prose-sm max-w-none prose-p:text-white/80"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.transcript }}
                    />
                  </details>
                )}
              </div>
            )}

            {/* Answers Area */}
            <div className="mt-2">

              {/* Multiple Choice */}
              {currentQuestion.questionType === 'multipleChoice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((opt, idx) => {
                    const isSelected = currentAnswer?.selectedOptionId === opt.id;
                    const label = String.fromCharCode(65 + idx); // A, B, C, D

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                          ? "bg-white/20 border-white/30"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                          } ${isSubmitted ? "opacity-80 pointer-events-none" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, 'selectedOptionId')}
                          className="hidden"
                        />
                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? "bg-white/20 text-white" : "bg-white/5 text-white/50"
                          }`}>
                          {label}
                        </div>
                        <span className="text-white/90 font-medium">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Fill Blank */}
              {currentQuestion.questionType === 'fillBlank' && (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời..."
                    value={currentAnswer?.blankAnswers?.[0] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, [e.target.value], 'blankAnswers')}
                    disabled={isSubmitted}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-white/30 outline-none transition-all disabled:opacity-50 font-medium text-lg"
                  />
                </div>
              )}

              {/* Essay */}
              {currentQuestion.questionType === 'essay' && (
                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="Nhập bài luận của bạn..."
                    value={currentAnswer?.essayAnswer || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, 'essayAnswer')}
                    disabled={isSubmitted}
                    rows={8}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-white/30 outline-none transition-all resize-y disabled:opacity-50 font-medium"
                  />
                  <div className="flex justify-end mt-1">
                    <WordCountIndicator
                      text={currentAnswer?.essayAnswer || ""}
                      minWords={currentQuestion.minWords}
                    />
                  </div>
                </div>
              )}

              {/* Speaking */}
              {currentQuestion.questionType === 'speaking' && (
                <div className="flex flex-col gap-4">
                  <AudioRecorder
                    existingAudioUrl={currentAnswer?.audioRecordUrl}
                    onUploadSuccess={(url, publicId) => {
                      setAnswers(prev => prev.map(ans =>
                        ans.questionId === currentQuestion._id ? { ...ans, audioRecordUrl: url, audioPublicId: publicId, aiAssessment: undefined } : ans
                      ));
                    }}
                    onDelete={() => {
                      setAnswers(prev => prev.map(ans =>
                        ans.questionId === currentQuestion._id ? { ...ans, audioRecordUrl: null, audioPublicId: null, aiAssessment: undefined } : ans
                      ));
                    }}
                    disabled={isSubmitted}
                  />
                  {currentAnswer?.aiAssessment && (
                    <SpeakingAIFeedback assessment={currentAnswer.aiAssessment} />
                  )}
                </div>
              )}

              {/* Correct Answer Display */}
              {isSubmitted && currentQuestion.questionType === 'multipleChoice' && currentQuestion.correctOptionId && (
                <div className="mt-6">
                  <div className="p-4 bg-emerald-500/10 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-500/20 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0">Đáp án đúng:</span>
                      <span>{String.fromCharCode(65 + (currentQuestion.options?.findIndex((o) => o.id === currentQuestion.correctOptionId) || 0))} - {currentQuestion.options?.find((o) => o.id === currentQuestion.correctOptionId)?.text}</span>
                    </div>
                    {!showAITutor && (
                      <button onClick={() => setShowAITutor(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs transition-colors shrink-0">
                        <Image src="/inlectualBee.gif" alt="Bee thông thái" width={24} height={24} unoptimized className="text-blue-400" /> Hỏi Bee Thông Thái
                      </button>
                    )}
                  </div>
                </div>
              )}
              {isSubmitted && currentQuestion.questionType === 'fillBlank' && currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 0 && (
                <div className="mt-6">
                  <div className="p-4 bg-emerald-500/10 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-500/20 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0">Đáp án đúng:</span>
                      <span>{currentQuestion.correctAnswers.join(' hoặc ')}</span>
                    </div>
                    {!showAITutor && (
                      <button onClick={() => setShowAITutor(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs transition-colors shrink-0">
                        <Image src="/inlectualBee.gif" alt="Bee thông thái" width={24} height={24} unoptimized className="text-blue-400" /> Hỏi AI Gia Sư
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* AI Tutor Panel */}
              {isSubmitted && showAITutor && (
                <AITutorPanel
                  questionContext={{
                    questionText: currentQuestion.questionText,
                    studentAnswer: currentQuestion.questionType === 'multipleChoice'
                      ? currentQuestion.options?.find(o => o.id === currentAnswer?.selectedOptionId)?.text || 'Trống'
                      : currentAnswer?.blankAnswers?.join(', ') || 'Trống',
                    correctAnswer: currentQuestion.questionType === 'multipleChoice'
                      ? currentQuestion.options?.find(o => o.id === currentQuestion.correctOptionId)?.text || 'Trống'
                      : currentQuestion.correctAnswers?.join(', ') || 'Trống',
                    questionType: currentQuestion.questionType,
                    explanation: currentQuestion.explanation,
                    transcript: currentQuestion.transcript,
                  }}
                  onClose={() => setShowAITutor(false)}
                />
              )}

              {/* Grading Result Feedback */}
              {isSubmitted && (currentQuestion.questionType === 'essay' || currentQuestion.questionType === 'speaking') && data?.attempt?.status === 'submitted' && (
                <div className="flex flex-col gap-4 mt-6">
                  <div className="p-4 rounded-xl flex items-center gap-3 text-sm font-bold border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    <Clock className="w-5 h-5 animate-pulse" />
                    Bài làm đang chờ giáo viên chấm điểm
                  </div>
                </div>
              )}

              {/* Teacher Feedback for graded essay/speaking */}
              {isSubmitted && (currentQuestion.questionType === 'essay' || currentQuestion.questionType === 'speaking') && data?.attempt?.status === 'graded' && currentAnswer && (
                <div className="flex flex-col gap-4 mt-6 bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Image src="/learning/corrected.gif" alt="Teacher Feedback" width={24} height={24} className="object-contain" />
                    Đánh giá từ giáo viên
                    {data?.attempt?.gradedBy && data.attempt.gradedBy.name && (
                      <span className="text-sm font-normal text-indigo-300 ml-1">
                        ({data.attempt.gradedBy.name})
                      </span>
                    )}
                  </h3>

                  {/* Score */}
                  {currentAnswer.score !== undefined && currentAnswer.score !== null && (
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/5">
                      <span className="text-white/70 font-medium">Điểm số (Band):</span>
                      <span className="text-3xl font-black text-indigo-400">{Number(currentAnswer.score).toFixed(1)}</span>
                    </div>
                  )}

                  {/* Parse and display teacherFeedback */}
                  {(() => {
                    if (!currentAnswer.teacherFeedback) return <p className="text-white/50 italic mt-2">Chưa có nhận xét chi tiết.</p>;
                    try {
                      const fb = JSON.parse(currentAnswer.teacherFeedback);
                      return (
                        <div className="space-y-4 mt-2">
                          {fb.criteria && Object.keys(fb.criteria).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(fb.criteria).map(([key, value]) => (
                                <div key={key} className="bg-white/5 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                                  <span className="text-sm text-white/70 font-medium">{key}</span>
                                  <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">{(value as number).toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {fb.generalFeedback && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <h4 className="text-sm font-bold text-white/90 mb-3">Nhận xét chung:</h4>
                              <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{fb.generalFeedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      // Fallback if not JSON
                      return (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-bold text-white/90 mb-3">Nhận xét:</h4>
                          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{currentAnswer.teacherFeedback}</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Default Correct/Incorrect Banner for Auto-graded Questions */}
              {isSubmitted && currentAnswer?.isCorrect !== null && currentAnswer?.isCorrect !== undefined && currentQuestion.questionType !== 'essay' && currentQuestion.questionType !== 'speaking' && (
                <div className="flex flex-col gap-4 mt-6">
                  <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold border ${currentAnswer.isCorrect
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}>
                    {currentAnswer.isCorrect ? (
                      <span className="flex items-center gap-2">
                        <Image src="/learning/corrected.gif" alt="Correct" width={24} height={24} className="object-contain " />
                        Chính xác
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Image src="/learning/incorrected.gif" alt="Incorrect" unoptimized width={24} height={24} className="object-contain " />
                        Chưa chính xác
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation Viewer (Always show if submitted and exists) */}
              {isSubmitted && currentQuestion.explanation && (
                <div className="mt-6">
                  <details className="group">
                    <summary className="flex items-center gap-2 font-bold text-white cursor-pointer hover:opacity-80 transition-opacity list-none w-max">
                      <span className="bg-white/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Image src="/learning/explaination.gif" alt="explaination" unoptimized width={24} height={24} className="object-contain mix-blend-screen" />
                        Xem giải thích chi tiết
                      </span>
                    </summary>
                    <div className="mt-3 p-5 bg-white/5 border border-white/10 rounded-xl text-white/80 leading-relaxed font-medium text-sm">
                      <div dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }} />
                    </div>
                  </details>
                </div>
              )}

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Câu trước đó
            </button>

            <div className="flex items-center gap-3">
              {!isSubmitted && (
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Đang lưu..." : "Lưu nháp"}
                </button>
              )}
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-8 py-3 rounded-full bg-black text-white font-bold border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  Câu hỏi tiếp theo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                isSubmitted ? (
                  !isPending && (
                    <button
                      onClick={() => setIsRetakeModalOpen(true)}
                      className="px-8 py-3 rounded-full bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      Làm lại bài
                    </button>
                  )
                ) : (
                  hasEssayOrSpeaking ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-3 rounded-full bg-[#f4e900] text-black font-bold hover:bg-[#d4ca00] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
                      >
                        <Send className="w-4 h-4 text-black" />
                        {saving ? "Đang xử lý..." : "Gửi giáo viên chấm"}
                      </button>
                      <button
                        onClick={handleAIGrading}
                        disabled={saving || isAIGrading || (data?.attempt?.aiAssessmentCount ?? 0) >= 3}
                        className="px-6 py-3 rounded-full bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
                      >
                        {isAIGrading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isAIGrading
                          ? "AI Đang chấm..."
                          : (data?.attempt?.aiAssessmentCount ?? 0) >= 3
                            ? "Đã hết lượt chấm AI"
                            : `Chấm điểm phát âm bằng AI (Còn ${3 - (data?.attempt?.aiAssessmentCount ?? 0)} lượt)`}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-8 py-3 rounded-full bg-[#f4e900] text-black font-bold hover:bg-[#d4ca00] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
                    >
                      <Send className="w-4 h-4 text-black" />
                      {saving ? "Đang xử lý..." : "Nộp bài"}
                    </button>
                  )
                )
              )}
            </div>
          </div>

        </div>
      </div>
      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title={hasEssayOrSpeaking ? "Xác nhận gửi bài" : "Xác nhận nộp bài"}
        message={hasEssayOrSpeaking
          ? "Bạn có chắc chắn gửi bài cho giáo viên chấm không? Bài làm sẽ không thể chỉnh sửa sau khi gửi."
          : "Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể sửa đổi câu trả lời sau khi nộp."}
        confirmText={hasEssayOrSpeaking ? "Gửi bài" : "Nộp bài"}
        cancelText="Hủy"
        isDestructive={false}
      />
      {/* Retake Confirmation Modal */}
      <ConfirmModal
        isOpen={isRetakeModalOpen}
        onClose={() => setIsRetakeModalOpen(false)}
        onConfirm={handleConfirmRetake}
        title="Làm lại bài"
        message="Bạn có chắc chắn muốn làm lại bài? Kết quả bài làm hiện tại trên màn hình sẽ bị xóa bỏ."
        confirmText="Đồng ý"
        cancelText="Hủy"
        isDestructive={true}
      />

      {/* Result Modal */}
      <ResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onRetake={() => {
          setIsResultModalOpen(false);
          setIsRetakeModalOpen(true);
        }}
        accuracy={accuracy}
        correctCount={correctCount}
        totalQuestions={questions.length}
        isPending={isPending}
      />

    </div>
  );
};
