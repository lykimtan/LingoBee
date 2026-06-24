"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { placementTestService } from "@/services/placementTestService";
import { PlacementTest } from "@/types";
import { toast } from "react-toastify";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AIAssessmentWords } from "@/components/PlacementTest/AIAssessmentWords";

export default function PlacementTestResultsPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await placementTestService.getTestDetails(testId);
        if (response.success && response.data) {
          setTest(response.data);

          if (response.data.status === "in_progress") {
            toast.info("Bài kiểm tra chưa hoàn thành.");
            router.push(`/placement-test/${testId}/take`);
          }
        }
      } catch (error) {
        toast.error("Không thể tải kết quả bài kiểm tra");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen relative w-full overflow-hidden">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-12 relative z-10">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!test) return null;

  const maxScore = test.questions.length;
  const currentQuestion = test.questions[currentIndex];
  const currentAnswer = test.answers.find(a => (a.questionId as any)._id === currentQuestion._id || a.questionId === currentQuestion._id);
  const isSpeaking = currentQuestion.questionType === "speaking";

  const handleNext = () => {
    if (currentIndex < test.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-hidden font-sans bg-gradient-to-b from-[#1890FF] to-[#60B8FF] pt-28 pb-28">
      {/* We keep Navigation as requested previously "trang này có header, footer đàng hoàng" */}
      <Navigation />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col relative pt-8 sm:pt-12 pb-48 z-10">

        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-8">
          Kết quả chi tiết
        </h1>

        <div className="relative w-full flex-1 flex flex-col">
          {/* Decorative Stacked Cards Behind */}
          <div className="absolute top-0 left-4 right-4 h-full bg-white/20 rounded-t-3xl -z-20 transform -translate-y-4 scale-[0.96]"></div>
          <div className="absolute top-0 left-2 right-2 h-full bg-white/40 rounded-t-3xl -z-10 transform -translate-y-2 scale-[0.98]"></div>

          {/* Main Card */}
          <div className="bg-white rounded-t-3xl rounded-b-lg shadow-xl w-full flex-1 flex flex-col overflow-hidden z-0">

            {/* Card Header */}
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Câu {currentIndex + 1}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isSpeaking ? "Record your answer to the following question." :
                  currentQuestion.questionType === "listeningChoice" ? "Listen to the audio and answer the question." :
                    "Choose the correct word to complete the text."}
              </h2>
            </div>

            {/* Card Body */}
            <div className="px-6 sm:px-12 pb-10 flex-1 overflow-y-auto">

              {/* Listening Audio Player */}
              {currentQuestion.questionType === "listeningChoice" && currentQuestion.audioUrl && (
                <div className="mb-8 p-4 bg-blue-50 rounded-2xl flex justify-center">
                  <audio controls src={currentQuestion.audioUrl} className="w-full max-w-md" />
                </div>
              )}

              {/* Question Text */}
              <div className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8 whitespace-pre-wrap font-medium">
                {currentQuestion.questionText}
              </div>

              {/* Options */}
              {!isSpeaking && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {currentQuestion.options?.map((opt, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex);
                    const optionId = opt.id || opt._id || "";
                    const isUserSelected = currentAnswer?.selectedOptionIds?.includes(optionId);
                    const isActuallyCorrect = currentQuestion.correctOptionIds?.includes(optionId);

                    let bgClass = "bg-white";
                    let borderClass = "border-gray-100 hover:border-gray-200";
                    let textClass = "text-gray-700 font-medium";
                    let circleBgClass = "bg-gray-100 text-gray-500";

                    if (isActuallyCorrect) {
                      bgClass = "bg-green-50/50";
                      borderClass = "border-green-500";
                      textClass = "text-green-700 font-bold";
                      circleBgClass = "bg-green-500 text-white";
                    } else if (isUserSelected && !isActuallyCorrect) {
                      bgClass = "bg-red-50/50";
                      borderClass = "border-red-500";
                      textClass = "text-red-700 font-bold";
                      circleBgClass = "bg-red-500 text-white";
                    }

                    return (
                      <div key={opt._id || opt.id} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${bgClass} ${borderClass}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${circleBgClass}`}>
                          {letter}
                        </div>
                        <span className={`text-base flex-1 ${textClass}`}>
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {isSpeaking && currentAnswer?.audioSubmissionUrl && (
                <div className="max-w-md mx-auto mt-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-4 font-medium">Bản ghi âm của bạn:</p>
                  <audio controls src={currentAnswer.audioSubmissionUrl} className="w-full h-12 mb-4" />

                  {currentAnswer.aiAssessment && typeof currentAnswer.aiAssessment.pronunciationScore === 'number' ? (
                    <div className="mt-4 text-left bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        Phân tích từ AI
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between items-center">
                          <span>Phát âm (Pronunciation)</span>
                          <span className="font-bold text-blue-600">{currentAnswer.aiAssessment.pronunciationScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${currentAnswer.aiAssessment.pronunciationScore}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span>Độ chính xác (Accuracy)</span>
                          <span className="font-bold text-emerald-600">{currentAnswer.aiAssessment.accuracyScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${currentAnswer.aiAssessment.accuracyScore}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span>Độ trôi chảy (Fluency)</span>
                          <span className="font-bold text-purple-600">{currentAnswer.aiAssessment.fluencyScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${currentAnswer.aiAssessment.fluencyScore}%` }}></div>
                        </div>
                      </div>

                      <AIAssessmentWords words={currentAnswer.aiAssessment.words} />
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      Phần thi Speaking đang chờ chấm điểm.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-6xl mx-auto">
          {/* Top Info Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-gray-100 text-sm gap-4">
            <div className="flex items-center gap-2 font-bold text-gray-700">
              Trạng thái bài kiểm tra: <span className="text-green-500">Đã hoàn thành</span>
            </div>
            <div className="font-bold text-gray-700">
              Kết quả: <span className="text-gray-500 font-medium ml-2">{test.totalScore}/{maxScore} câu đúng</span>
            </div>
            <div className="flex items-center gap-4 font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Đạt
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Chưa đạt
              </div>
            </div>
          </div>

          {/* Pagination Row */}
          <div className="flex items-center justify-between px-4 py-3 gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto px-2 py-2">
              {test.questions.map((q, idx) => {
                const ans = test.answers.find(a => (a.questionId as any)._id === q._id || a.questionId === q._id);
                const isCorrect = ans && ans.score > 0;
                // For speaking questions, we might show them as neutral or pending. For now, if score > 0 it's green, else red (or gray if unanswered).
                const isSpeaking = q.questionType === "speaking";

                let circleColor = "bg-gray-300"; // default
                if (!isSpeaking) {
                  circleColor = isCorrect ? "bg-[#00C853]" : "bg-[#FF3D00]";
                } else {
                  circleColor = ans?.audioSubmissionUrl ? "bg-[#FF9100]" : "bg-gray-300"; // orange for submitted speaking
                }

                const isActive = currentIndex === idx;

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(idx)}
                    className="relative flex flex-col items-center flex-shrink-0"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-transform ${circleColor} ${isActive ? 'scale-110 shadow-md' : 'hover:scale-105'}`}>
                      {idx + 1}
                    </div>
                    {/* Active Underline */}
                    {isActive && (
                      <div className="absolute -bottom-2 w-4 h-1 rounded-full bg-green-600"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === test.questions.length - 1}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
