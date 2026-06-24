"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { X, Clock, Loader2, ArrowRight } from "lucide-react";
import { placementTestService } from "@/services/placementTestService";
import { PlacementTest, PlacementAnswer } from "@/types";
import { toast } from "react-toastify";
import { AudioRecorder } from "@/components/AudioRecorder";

export default function TakePlacementTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for pagination
  const [currentIndex, setCurrentIndex] = useState(0);

  // State for user answers
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);

  // State for timer
  const [timeLeft, setTimeLeft] = useState<number>(12 * 60); // 30 minutes default

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await placementTestService.getTestDetails(testId);
        if (response.success && response.data) {
          if (response.data.status !== "in_progress") {
            toast.info("Bài kiểm tra này đã kết thúc.");
            router.push(`/placement-test/${testId}/results`);
            return;
          }

          setTest(response.data);

          // Initialize answers array if empty
          const initialAnswers = response.data.questions.map(q => {
            const existingAns = response.data?.answers?.find(a =>
              a.questionId === q._id || (a.questionId as any)._id === q._id
            );
            return existingAns || {
              questionId: q._id,
              selectedOptionIds: [],
              audioSubmissionUrl: null,
              score: 0
            };
          });
          setAnswers(initialAnswers);

          // Calculate time left
          const startedAt = new Date(response.data.startedAt).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - startedAt) / 1000);
          const limitSeconds = response.data.timeLimitMinutes * 60;
          const remaining = Math.max(limitSeconds - elapsedSeconds, 0);
          setTimeLeft(remaining);
        }
      } catch (error) {
        toast.error("Không thể tải bài kiểm tra");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, router]);

  // Timer countdown effect
  useEffect(() => {
    if (isLoading || isSubmitting || !test) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isSubmitting, test]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    toast.warning("Hết thời gian! Hệ thống đang nộp bài tự động...", { autoClose: false });
    await submitTest();
  }, [answers, isSubmitting]);

  const submitTest = async () => {
    setIsSubmitting(true);
    // Show a persistent toast while submitting
    const toastId = toast.loading("Hệ thống đang thu bài...");
    try {
      const formattedAnswers = answers.map(a => ({
        questionId: typeof a.questionId === 'string' ? a.questionId : (a.questionId as any)._id,
        selectedOptionIds: a.selectedOptionIds,
        audioSubmissionUrl: a.audioSubmissionUrl
      }));

      const res = await placementTestService.submitTest(testId, formattedAnswers);
      if (res.success) {
        toast.dismiss(); // Dismiss any previous warnings
        
        // Check if there are any speaking questions with audio
        const hasSpeaking = formattedAnswers.some(a => a.audioSubmissionUrl);
        if (hasSpeaking) {
          toast.update(toastId, { render: "Đang phân tích và chấm điểm Speaking bằng AI...", type: "info", isLoading: true });
          // Call the AI grading API
          await placementTestService.gradeSpeakingWithAI(testId);
        }

        toast.update(toastId, { render: "Hoàn tất! Đang chuyển sang trang kết quả...", type: "success", isLoading: false, autoClose: 2000 });
        router.push(`/placement-test/${testId}/results`);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.update(toastId, { render: error.message || "Lỗi khi nộp bài", type: "error", isLoading: false, autoClose: 3000 });
      setIsSubmitting(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    const currentQ = test?.questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => {
      const newAnswers = [...prev];
      // For now, assume single choice for MCQs. If it's multi-select, we'd toggle.
      // The instruction just says radio button like options.
      newAnswers[currentIndex] = {
        ...newAnswers[currentIndex],
        selectedOptionIds: [optionId]
      };
      return newAnswers;
    });
  };

  const handleAudioRecordingComplete = (audioUrl: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = {
        ...newAnswers[currentIndex],
        audioSubmissionUrl: audioUrl
      };
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (test && currentIndex < test.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last question -> Submit
      if (window.confirm("Bạn đã hoàn thành câu hỏi cuối. Xác nhận nộp bài?")) {
        submitTest();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) return null;

  const currentQuestion = test.questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === test.questions.length - 1;

  return (
    <div className="min-h-screen bg-[#1E88E5] flex flex-col font-sans">

      {/* Sticky Header */}
      <header className="bg-[#F8F9FA] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => {
            if (window.confirm("Bạn có chắc muốn thoát? Kết quả có thể không được lưu lại.")) {
              router.push("/placement-test");
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4" /> Thoát
        </button>

        <div className="flex items-center gap-2">
          {/* Mock Logo */}
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 hidden sm:block">
            English Multi-stage Adaptive Test
          </h1>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-500'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col relative pt-12 pb-24">

        {/* Decorative Stacked Cards Behind */}
        <div className="absolute top-8 left-4 right-4 h-full bg-blue-400/50 rounded-3xl -z-20 transform scale-[0.96]"></div>
        <div className="absolute top-10 left-2 right-2 h-full bg-blue-300/50 rounded-3xl -z-10 transform scale-[0.98]"></div>

        {/* Main Card */}
        <div className="bg-white rounded-t-3xl rounded-b-lg shadow-xl w-full flex-1 flex flex-col overflow-hidden z-0">

          {/* Card Header */}
          <div className="p-6 text-center border-b border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Câu {currentIndex + 1}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {currentQuestion.questionType === "speaking" ? "Record your answer to the following question." :
                currentQuestion.questionType === "listeningChoice" ? "Listen to the audio and answer the question." :
                  "Read the text and answer the question."}
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto">

            {/* Listening Audio Player */}
            {currentQuestion.questionType === "listeningChoice" && currentQuestion.audioUrl && (
              <div className="mb-8 p-4 bg-blue-50 rounded-2xl flex justify-center">
                <audio controls src={currentQuestion.audioUrl} className="w-full max-w-md" />
              </div>
            )}

            {/* Question Text */}
            <div className="text-gray-700 text-base sm:text-lg leading-relaxed mb-10 whitespace-pre-wrap">
              {currentQuestion.questionText}
            </div>

            {/* Options or Audio Recorder */}
            {currentQuestion.questionType === "speaking" ? (
              <div className="max-w-md mx-auto">
                <AudioRecorder
                  onRecordingComplete={handleAudioRecordingComplete}
                  initialAudioUrl={currentAnswer.audioSubmissionUrl}
                  maxDurationSeconds={45}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestion.options?.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D...
                  const isSelected = currentAnswer.selectedOptionIds.includes(option.id || option._id || "");

                  return (
                    <button
                      key={option.id || option._id}
                      onClick={() => handleOptionSelect(option.id || option._id || "")}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}>
                        {letter}
                      </div>
                      <span className={`text-base flex-1 ${isSelected ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6 fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="text-blue-600 font-bold hover:text-blue-700 transition-colors px-4 py-2"
        >
          Bỏ qua
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-[#9E9E9E] hover:bg-gray-500 text-white font-bold rounded-full px-8 py-3 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLastQuestion ? "Nộp bài" : "Câu sau"} <ArrowRight className="w-5 h-5" />
        </button>
      </footer>

      {/* Spacer to prevent content hiding behind footer */}
      <div className="h-20 bg-transparent"></div>

    </div>
  );
}
