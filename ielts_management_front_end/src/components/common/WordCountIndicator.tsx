import React, { useMemo } from 'react';
import { Type } from 'lucide-react';

interface WordCountIndicatorProps {
  text: string;
  minWords?: number;
  maxWords?: number;
  className?: string;
}

export const WordCountIndicator: React.FC<WordCountIndicatorProps> = ({
  text,
  minWords = 0,
  maxWords,
  className = '',
}) => {
  const wordCount = useMemo(() => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [text]);

  // Determine status color
  let statusColor = "text-white/50 bg-white/5 border-white/10"; // Default
  
  if (wordCount > 0) {
    if (minWords > 0 && wordCount < minWords) {
      // Under minimum
      statusColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";
    } else if (maxWords && wordCount > maxWords) {
      // Over maximum
      statusColor = "text-red-400 bg-red-400/10 border-red-400/20";
    } else {
      // Good
      statusColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    }
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-colors duration-300 w-max ${statusColor} ${className}`}>
      <Type size={14} className="opacity-70" />
      <span>{wordCount} words</span>
      {minWords > 0 && <span className="opacity-50 ml-1">/ Min: {minWords}</span>}
      {maxWords && <span className="opacity-50 ml-1">/ Max: {maxWords}</span>}
    </div>
  );
};
