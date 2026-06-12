import React, { useState, useRef, useLayoutEffect } from 'react';
import { AiWordAssessment } from '@/services/learningService';

interface WordAssessmentPopoverProps {
  word: AiWordAssessment;
  children: React.ReactNode;
}

export default function WordAssessmentPopover({ word, children }: WordAssessmentPopoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isHovered && popoverRef.current) {
      popoverRef.current.style.transform = 'translateX(-50%)';
      const rect = popoverRef.current.getBoundingClientRect();
      const padding = 20;
      let shift = 0;

      // Assuming main content area might have a left sidebar. 
      // If it's near the left edge, shift it right.
      if (rect.left < padding) {
        shift = padding - rect.left;
      } else if (rect.right > window.innerWidth - padding) {
        shift = (window.innerWidth - padding) - rect.right;
      }

      if (shift !== 0) {
        popoverRef.current.style.transform = `translateX(calc(-50% + ${shift}px))`;
      }
    }
  }, [isHovered]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-400/20";
    if (score >= 60) return "bg-amber-400/20";
    return "bg-red-400/20";
  };

  return (
    <div 
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {isHovered && (
        <div 
          ref={popoverRef}
          className="absolute z-[999] bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
        >
          <div className="flex justify-between items-center gap-4 mb-2 pb-2 border-b border-white/10">
            <span className="font-bold text-white text-lg">{word.word}</span>
            <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreBgColor(word.accuracyScore)} ${getScoreColor(word.accuracyScore)}`}>
              {word.accuracyScore.toFixed(0)}%
            </span>
          </div>
          
          {word.errorType && word.errorType !== 'None' && (
            <div className="text-red-400 text-xs font-semibold mb-3 px-2 py-1 bg-red-400/10 rounded">
              Error: {word.errorType}
            </div>
          )}

          {word.syllables && word.syllables.length > 0 && (
            <div className="mt-2">
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Syllables (Âm tiết)</div>
              <div className="flex flex-wrap gap-1.5">
                {word.syllables.map((s, idx) => (
                  <div key={`s-${idx}`} className="flex flex-col items-center bg-white/5 border border-white/10 rounded px-2 py-1 min-w-[40px]">
                    <span className="text-white text-sm font-medium">{s.syllable}</span>
                    <span className={`text-[10px] font-black ${getScoreColor(s.accuracyScore)}`}>{s.accuracyScore.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {word.phonemes && word.phonemes.length > 0 && (
            <div className="mt-3">
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Phonemes (Âm vị)</div>
              <div className="flex flex-wrap gap-1.5">
                {word.phonemes.map((p, idx) => (
                  <div key={`p-${idx}`} className="flex flex-col items-center bg-white/5 border border-white/10 rounded px-2 py-1 min-w-[36px]">
                    <span className="text-indigo-300 font-mono text-sm">{p.phoneme}</span>
                    <span className={`text-[10px] font-black ${getScoreColor(p.accuracyScore)}`}>{p.accuracyScore.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tam giác trỏ xuống */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 z-20"></div>
          <div className="absolute top-[calc(100%+1px)] left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-700 z-10"></div>
        </div>
      )}
    </div>
  );
}
