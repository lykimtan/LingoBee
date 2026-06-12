import React from 'react';
import { AiAssessment } from '@/services/learningService';
import Image from 'next/image';
import { Bot, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import WordAssessmentPopover from './WordAssessmentPopover';

interface SpeakingAIFeedbackProps {
  assessment: AiAssessment;
}

export default function SpeakingAIFeedback({ assessment }: SpeakingAIFeedbackProps) {
  if (!assessment) return null;

  const renderScoreCircle = (label: string, score: number, colorClass: string) => {
    const validScore = Number(score) || 0;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
            <circle
              cx="32" cy="32" r="28"
              stroke="currentColor" strokeWidth="6" fill="transparent"
              className={colorClass}
              strokeDasharray="175.9"
              strokeDashoffset={String(175.9 - (175.9 * validScore) / 100)}
              style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
            />
          </svg>
          <span className="absolute text-sm font-bold text-white">{Math.round(validScore)}</span>
        </div>
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  const getWordColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400 underline decoration-red-400/50 underline-offset-4";
  };

  return (
    <div className="mt-6 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6 relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Image
            src={"/inlectualBee.gif"}
            alt="AI Pronunciation Assessment"
            width={100}
            height={100}
            unoptimized
          />


        </div>
        <div>
          <h4 className="font-bold text-white text-lg">AI Pronunciation Assessment</h4>
          <p className="text-sm font-medium text-white/50">Phân tích và đánh giá phát âm </p>
        </div>

        <div className="ml-auto text-right">
          <div className="text-3xl font-black text-white">{Math.round(assessment.pronunciationScore)}<span className="text-lg text-white/40 font-bold">/100</span></div>
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-black/20 rounded-xl border border-white/5">
        {renderScoreCircle("Độ chính xác - Accuracy", assessment.accuracyScore, "text-emerald-500")}
        {renderScoreCircle("Độ trôi chảy - Fluency", assessment.fluencyScore, "text-blue-500")}
        {renderScoreCircle("Hoàn chỉnh - Completeness", assessment.completenessScore, "text-purple-500")}
        {renderScoreCircle("Ngữ điệu - Prosody", assessment.prosodyScore, "text-amber-500")}
      </div>

      <div className="space-y-3">
        <h5 className="font-semibold text-white/90 text-sm uppercase tracking-wide flex items-center gap-2">
          Chi tiết phát âm
        </h5>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 leading-relaxed text-lg">
          {assessment.words && assessment.words.length > 0 ? (
            <div className="flex flex-wrap gap-x-1.5 gap-y-2">
              {assessment.words.map((w, idx) => (
                <WordAssessmentPopover key={idx} word={w as any}>
                  <span
                    className={`font-medium transition-colors hover:bg-white/10 px-1 rounded ${getWordColor(w.accuracyScore)}`}
                  >
                    {w.word}
                  </span>
                </WordAssessmentPopover>
              ))}
            </div>
          ) : (
            <p className="text-white/50 italic text-sm">Không nhận diện được nội dung chi tiết.</p>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Phát âm tốt (&ge;80)
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Cần cải thiện (60-79)
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <AlertCircle className="w-4 h-4 text-red-400" /> Phát âm sai (&lt;60)
          </div>
        </div>
      </div>
    </div>
  );
}
