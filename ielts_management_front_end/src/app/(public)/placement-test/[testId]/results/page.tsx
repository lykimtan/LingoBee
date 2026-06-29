"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Award, ArrowRight } from "lucide-react";
import { placementTestService } from "@/services/placementTestService";
import { PlacementTest } from "@/types";
import { toast } from "react-toastify";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AIAssessmentWords } from "@/components/PlacementTest/AIAssessmentWords";

const getResultDetails = (score: number) => {
  if (score <= 3) return { cefr: "Pre-A1", label: "Chưa đạt mức cơ bản", desc: "Bạn cần bắt đầu xây dựng nền tảng từ vựng và ngữ pháp cơ bản nhất để làm quen với tiếng Anh." };
  if (score <= 5) return { cefr: "A1", label: "Căn bản (Beginner)", desc: "Bạn có thể hiểu và sử dụng các cấu trúc câu đơn giản, quen thuộc trong giao tiếp hàng ngày ở mức độ cơ bản." };
  if (score <= 7) return { cefr: "A2", label: "Sơ cấp (Elementary)", desc: "Bạn có thể giao tiếp cơ bản, hiểu các câu và từ ngữ thường dùng liên quan đến các nhu cầu thiết yếu hàng ngày." };
  if (score <= 10) return { cefr: "B1", label: "Trung cấp (Intermediate)", desc: "Bạn có thể hiểu những điểm chính của các chủ đề quen thuộc và tự tin xử lý hầu hết các tình huống giao tiếp thông thường." };
  if (score <= 12) return { cefr: "B2", label: "Trung cấp trên (Upper-Intermediate)", desc: "Bạn sở hữu vốn kiến thức ngôn ngữ rộng và khả năng tư duy linh hoạt. Bạn hiểu sâu hầu hết các vấn đề, nhưng để đạt đến độ hoàn hảo, bạn cần rèn luyện thêm kỹ năng tranh biện và sử dụng ngôn ngữ học thuật cao cấp." };
  if (score <= 14) return { cefr: "C1", label: "Cao cấp (Advanced)", desc: "Bạn có khả năng sử dụng tiếng Anh linh hoạt, hiệu quả cho các mục đích xã hội và học thuật chuyên sâu. Bạn hiểu được các văn bản dài và phức tạp." };
  return { cefr: "C2", label: "Thành thạo (Proficient)", desc: "Bạn sử dụng tiếng Anh một cách tự nhiên, trôi chảy và chính xác như người bản xứ. Bạn có thể dễ dàng hiểu hầu hết mọi thứ nghe hoặc đọc." };
};

export default function PlacementTestResultsPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"overview" | "detail">("overview");

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

  const resultDetails = getResultDetails(test.totalScore || 0);

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-hidden font-sans bg-gradient-to-b from-[#1890FF] to-[#60B8FF] pt-28 pb-28">
      <Navigation />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col relative pt-8 sm:pt-12 pb-48 z-10">

        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-8">
          {viewMode === "overview" ? "Tổng quan kết quả" : "Kết quả chi tiết"}
        </h1>

        <div className="relative w-full flex-1 flex flex-col">
          {/* Decorative Stacked Cards Behind */}
          <div className="absolute top-0 left-4 right-4 h-full bg-white/20 rounded-t-3xl -z-20 transform -translate-y-4 scale-[0.96]"></div>
          <div className="absolute top-0 left-2 right-2 h-full bg-white/40 rounded-t-3xl -z-10 transform -translate-y-2 scale-[0.98]"></div>

          {/* Main Card */}
          <div className="bg-white rounded-t-3xl rounded-b-lg shadow-xl w-full flex-1 flex flex-col overflow-hidden z-0">

            {viewMode === "overview" ? (
              <div className="p-8 sm:p-12 flex flex-col gap-8 h-full">
                
                {/* Badge and Info Header */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-6 rounded-2xl border-2 border-blue-50 shadow-sm relative overflow-hidden bg-white">
                  {/* Decorative faint glow */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                  
                  {/* Left Badge */}
                  <div className="w-40 h-40 flex-shrink-0 relative flex items-center justify-center">
                    {/* Simulated Badge Background */}
                    <div className="absolute inset-0 bg-amber-400 rounded-full shadow-lg flex items-center justify-center">
                      <div className="absolute inset-2 border-2 border-amber-200 border-dashed rounded-full"></div>
                    </div>
                    {/* Badge Content */}
                    <div className="z-10 flex flex-col items-center text-white">
                      <Award className="w-12 h-12 mb-1" />
                      <span className="font-bold text-[10px] tracking-wider text-amber-50 uppercase">ENTRY TEST</span>
                    </div>
                  </div>

                  {/* Right Info */}
                  <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10 pt-2">
                    <p className="text-gray-600 font-medium mb-1">
                      Chúc mừng! Bạn đã hoàn thành <span className="font-bold text-gray-800">English Multi-stage Adaptive Test</span>
                    </p>
                    
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-600 tracking-tight my-4">
                      CEFR – {resultDetails.cefr}
                    </h2>
                    
                    <button className="text-blue-500 font-semibold hover:text-blue-600 transition-colors flex items-center justify-center md:justify-start gap-1 text-sm mb-6">
                      Xem các thang điểm tương đương <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Trạng thái bài kiểm tra:</span>
                        <span className="text-emerald-500 font-semibold">Đã hoàn thành</span>
                      </div>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Kết quả:</span>
                        <span>{test.totalScore || 0}/{maxScore} câu đúng</span>
                        <button 
                          onClick={() => setViewMode("detail")}
                          className="text-blue-500 font-semibold hover:text-blue-600 transition-colors ml-1"
                        >
                          Xem chi tiết →
                        </button>
                      </div>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <div className="text-gray-500">
                        {`${new Date(test.createdAt || new Date()).getDate()} tháng ${new Date(test.createdAt || new Date()).getMonth() + 1}, ${new Date(test.createdAt || new Date()).getFullYear()}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 mt-auto">
                  <h3 className="font-bold text-gray-800 mb-2">Mô tả năng lực</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {resultDetails.desc}
                  </p>
                </div>

              </div>
            ) : (
              <>
                {/* Card Header (Detail Mode) */}
                <div className="p-6 text-center relative border-b border-gray-100">
                  <button 
                    onClick={() => setViewMode("overview")}
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Tổng quan</span>
                  </button>
                  <p className="text-sm font-medium text-gray-500 mb-1">Câu {currentIndex + 1}</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 px-12">
                    {isSpeaking ? "Record your answer to the following question." :
                      currentQuestion.questionType === "listeningChoice" ? "Listen to the audio and answer the question." :
                        "Choose the correct word to complete the text."}
                  </h2>
                </div>

                {/* Card Body (Detail Mode) */}
                <div className="px-6 sm:px-12 py-10 flex-1 overflow-y-auto">
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
                              <span className="font-bold text-blue-600">{Math.round(currentAnswer.aiAssessment.pronunciationScore)}/100</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${currentAnswer.aiAssessment.pronunciationScore}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <span>Độ chính xác (Accuracy)</span>
                              <span className="font-bold text-emerald-600">{Math.round(currentAnswer.aiAssessment.accuracyScore)}/100</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${currentAnswer.aiAssessment.accuracyScore}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <span>Độ trôi chảy (Fluency)</span>
                              <span className="font-bold text-purple-600">{Math.round(currentAnswer.aiAssessment.fluencyScore)}/100</span>
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
              </>
            )}

          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar - Only show in detail mode or maybe we can keep it as a constant element but it might not be needed in overview. Actually let's hide the pagination bottom bar in overview mode since we have an overview. */}
      {viewMode === "detail" && (
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
                  const isSpeaking = q.questionType === "speaking";

                  let circleColor = "bg-gray-300"; 
                  if (!isSpeaking) {
                    circleColor = isCorrect ? "bg-[#00C853]" : "bg-[#FF3D00]";
                  } else {
                    circleColor = ans?.audioSubmissionUrl ? "bg-[#FF9100]" : "bg-gray-300"; 
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
      )}
    </div>
  );
}
