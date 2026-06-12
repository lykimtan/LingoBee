"use client";

import { useEffect, useState } from "react";
import { learningService } from "@/services/learningService";
import { toast } from "react-toastify";
import GradingSidebar from "@/components/teacher/grading/GradingSidebar";
import GradingContent from "@/components/teacher/grading/GradingContent";
import AssessmentPanel from "@/components/teacher/grading/AssessmentPanel";

interface CourseGradingTabProps {
  courseId: string;
}

export function CourseGradingTab({ courseId }: CourseGradingTabProps) {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [attemptDetail, setAttemptDetail] = useState<any | null>(null);
  const [manualGradingItems, setManualGradingItems] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [gradesDraft, setGradesDraft] = useState<Record<string, any>>({});
  
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await learningService.getCourseAttemptsForGrading(courseId);
      if (res.status === "success") {
        setQueueItems(res.data || []);
      } else {
        toast.error("Không thể tải danh sách bài chấm");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối server");
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchQueue();
    }
  }, [courseId]);

  useEffect(() => {
    if (!selectedAttemptId) {
      setAttemptDetail(null);
      setManualGradingItems([]);
      setGradesDraft({});
      setActiveQuestionIndex(0);
      return;
    }

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await learningService.getAttemptDetailForGrading(selectedAttemptId);
        if (res.status === "success") {
          const detail = res.data;
          setAttemptDetail(detail);

          const items: any[] = [];
          if (detail && detail.exerciseId?.questions && detail.answers) {
            for (const ans of detail.answers) {
              const question = detail.exerciseId.questions.find(
                (q: any) => q._id.toString() === ans.questionId.toString()
              );
              if (question && (question.questionType === "essay" || question.questionType === "speaking")) {
                items.push({ question, answer: ans, type: question.questionType });
              }
            }
          }
          setManualGradingItems(items);
          setActiveQuestionIndex(0);

          const initialDrafts: Record<string, any> = {};
          items.forEach(item => {
            let parsedDraft = { c1: 6.0, c2: 6.0, c3: 6.0, c4: 6.0, feedback: "" };
            if (item.answer?.teacherFeedback) {
              try {
                const fb = JSON.parse(item.answer.teacherFeedback);
                const isSpk = item.type === "speaking";
                if (isSpk) {
                  parsedDraft = {
                    c1: fb.criteria?.["Fluency & Coherence"] || 6.0,
                    c2: fb.criteria?.["Lexical Resource"] || 6.0,
                    c3: fb.criteria?.["Grammatical Range"] || 6.0,
                    c4: fb.criteria?.["Pronunciation"] || 6.0,
                    feedback: fb.generalFeedback || ""
                  };
                } else {
                  parsedDraft = {
                    c1: fb.criteria?.["Task Response"] || 6.0,
                    c2: fb.criteria?.["Coherence & Cohesion"] || 6.0,
                    c3: fb.criteria?.["Lexical Resource"] || 6.0,
                    c4: fb.criteria?.["Grammar & Accuracy"] || 6.0,
                    feedback: fb.generalFeedback || ""
                  };
                }
              } catch (e) {
                // Ignore parse error
              }
            }
            initialDrafts[item.question._id] = parsedDraft;
          });
          setGradesDraft(initialDrafts);

        } else {
          toast.error("Không thể tải chi tiết bài làm");
        }
      } catch (error) {
        toast.error("Lỗi khi lấy chi tiết bài làm");
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedAttemptId]);

  const handleGradeSuccess = () => {
    setSelectedAttemptId(null);
    setAttemptDetail(null);
    toast.success("Đã chấm điểm thành công!");
    fetchQueue(); // refresh queue to update status to 'graded'
  };

  return (
    <div className="flex h-[calc(100vh-160px)] w-full overflow-hidden bg-gray-50 text-gray-900 rounded-2xl border border-gray-100 gap-4 p-2 shadow-inner">
      {/* Sidebar */}
      <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <GradingSidebar
          queueItems={queueItems}
          isLoading={isLoadingQueue}
          selectedAttemptId={selectedAttemptId}
          onSelectAttempt={setSelectedAttemptId}
        />
      </div>

      {/* Content Panel */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
        {!selectedAttemptId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Chọn một bài tập từ danh sách để xem/chấm</p>
            </div>
          </div>
        ) : (
          <GradingContent
            isLoading={isLoadingDetail}
            attempt={attemptDetail}
            manualGradingItems={manualGradingItems}
            activeQuestionIndex={activeQuestionIndex}
            onChangeQuestion={setActiveQuestionIndex}
          />
        )}
      </div>

      {/* Assessment Panel */}
      <div className="w-[340px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {!selectedAttemptId || !attemptDetail ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Trống
          </div>
        ) : (
          <AssessmentPanel
            attempt={attemptDetail}
            manualGradingItems={manualGradingItems}
            activeQuestionIndex={activeQuestionIndex}
            gradesDraft={gradesDraft}
            onUpdateDraft={(questionId: string, newDraft: any) => {
              setGradesDraft((prev) => ({
                ...prev,
                [questionId]: newDraft,
              }));
            }}
            onSuccess={handleGradeSuccess}
          />
        )}
      </div>
    </div>
  );
}
