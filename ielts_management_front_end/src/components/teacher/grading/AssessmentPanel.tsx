"use client";

import { useMemo, useState } from "react";
import { learningService } from "@/services/learningService";
import { toast } from "react-toastify";

interface AssessmentPanelProps {
  attempt: any;
  manualGradingItems: any[];
  activeQuestionIndex: number;
  gradesDraft: Record<string, any>;
  onUpdateDraft: (questionId: string, newDraft: any) => void;
  onSuccess: () => void;
}

export default function AssessmentPanel({ 
  attempt, 
  manualGradingItems, 
  activeQuestionIndex, 
  gradesDraft, 
  onUpdateDraft, 
  onSuccess 
}: AssessmentPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!attempt || manualGradingItems.length === 0) {
    return null;
  }

  const manualGradingItem = manualGradingItems[activeQuestionIndex];
  if (!manualGradingItem) return null;

  const isSpeaking = manualGradingItem.type === "speaking";
  const questionId = manualGradingItem.question._id;
  const draft = gradesDraft[questionId] || { c1: 6.0, c2: 6.0, c3: 6.0, c4: 6.0, feedback: "" };

  const estimatedBand = useMemo(() => {
    const avg = (draft.c1 + draft.c2 + draft.c3 + draft.c4) / 4;
    return Math.round(avg * 2) / 2;
  }, [draft.c1, draft.c2, draft.c3, draft.c4]);

  const updateDraft = (key: string, value: any) => {
    onUpdateDraft(questionId, { ...draft, [key]: value });
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);

    const answersPayload = manualGradingItems.map((item) => {
      const qId = item.question._id;
      const d = gradesDraft[qId] || { c1: 6.0, c2: 6.0, c3: 6.0, c4: 6.0, feedback: "" };
      const avg = (d.c1 + d.c2 + d.c3 + d.c4) / 4;
      const est = Math.round(avg * 2) / 2;
      const isSpk = item.type === "speaking";

      const criteriaObj = isSpk
        ? {
            "Fluency & Coherence": d.c1,
            "Lexical Resource": d.c2,
            "Grammatical Range": d.c3,
            "Pronunciation": d.c4,
          }
        : {
            "Task Response": d.c1,
            "Coherence & Cohesion": d.c2,
            "Lexical Resource": d.c3,
            "Grammar & Accuracy": d.c4,
          };

      return {
        questionId: qId,
        score: est,
        isCorrect: true,
        teacherFeedback: JSON.stringify({
          criteria: criteriaObj,
          generalFeedback: d.feedback,
        }),
      };
    });

    try {
      const res = await learningService.gradeExerciseAttempt(
        attempt._id,
        answersPayload,
        JSON.stringify({ note: "Graded multiple questions" })
      );

      if (res.status === "success") {
        onSuccess();
      } else {
        toast.error("Chấm điểm thất bại: " + res.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = isSpeaking
    ? ["Fluency & Coherence", "Lexical Resource", "Grammatical Range", "Pronunciation"]
    : ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammar & Accuracy"];

  const Slider = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        <span className="text-sm font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md">
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="9"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Assessment</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {isSpeaking ? "SPEAKING GRADING PROTOCOL" : "WRITING GRADING PROTOCOL"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Slider label={labels[0]} value={draft.c1} onChange={(v) => updateDraft("c1", v)} />
        <Slider label={labels[1]} value={draft.c2} onChange={(v) => updateDraft("c2", v)} />
        <Slider label={labels[2]} value={draft.c3} onChange={(v) => updateDraft("c3", v)} />
        <Slider label={labels[3]} value={draft.c4} onChange={(v) => updateDraft("c4", v)} />

        <div className="mt-8">
          <label className="block text-sm font-bold text-gray-800 mb-2">Teacher Feedback</label>
          <textarea
            value={draft.feedback}
            onChange={(e) => updateDraft("feedback", e.target.value)}
            className="w-full h-32 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none resize-none"
            placeholder="Provide constructive criticism..."
          />
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Estimated Band</span>
          <span className="text-3xl font-black text-gray-900">{estimatedBand.toFixed(1)}</span>
        </div>
        <button
          onClick={handleSubmitAll}
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              {manualGradingItems.length > 1 ? "Submit All Grades" : "Publish Grade"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
