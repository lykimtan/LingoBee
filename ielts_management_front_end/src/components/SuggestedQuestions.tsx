import React from 'react';
import { MessageCircleQuestion } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2 w-full max-w-full">
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="flex items-center gap-1.5 text-xs text-amber-500 bg-[#162933] hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 rounded-full px-3 py-1.5 transition-all text-left"
          >
            <MessageCircleQuestion size={12} className="shrink-0" />
            <span className="line-clamp-1">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
