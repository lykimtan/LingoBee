import { CheckCircle2, CircleDot, Lock, PlayCircle, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    duration: string;
    state: string;
    exercises?: any[];
  };
  onClick?: (id: string) => void;
  onSelectExercise?: (id: string) => void;
}

export const LessonItem = ({ lesson, onClick, onSelectExercise }: LessonItemProps) => {
  const isCompleted = lesson.state === 'completed';
  const isPlaying = lesson.state === 'playing';
  const isLocked = lesson.state === 'locked';
  const isUnlocked = lesson.state === 'unlocked';
  
  const hasExercises = lesson.exercises && lesson.exercises.length > 0;
  
  const [isExpanded, setIsExpanded] = useState(isPlaying);

  useEffect(() => {
    if (isPlaying) {
      setIsExpanded(true);
    }
  }, [isPlaying]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          if (!isLocked && onClick) {
            onClick(lesson.id);
            setIsExpanded(true);
          }
        }}
        disabled={isLocked}
        className={`flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${
          isPlaying 
            ? "bg-white/10 border border-white/10" 
            : isLocked
              ? "hover:bg-transparent border border-transparent cursor-not-allowed opacity-50"
              : "hover:bg-white/5 border border-transparent cursor-pointer"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-white/40" />}
          {isPlaying && <CircleDot className="h-4 w-4 text-white" />}
          {isUnlocked && <PlayCircle className="h-4 w-4 text-white/40" />}
          {isLocked && <Lock className="h-4 w-4 text-white/20" />}
        </div>
        <div className="flex flex-col flex-1">
          <span className={`text-sm font-medium ${
            isPlaying ? "text-white" : isLocked ? "text-white/30" : "text-white/70"
          }`}>
            {lesson.title}
          </span>
          <span className={`text-xs mt-0.5 ${isPlaying ? "text-white/60" : "text-white/30"}`}>
            {lesson.duration} {isPlaying && "• Playing"}
          </span>
        </div>
        {hasExercises && (
          <div 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            onClick={handleToggleExpand}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/50" />
            )}
          </div>
        )}
      </button>

      {hasExercises && isExpanded && (
        <div className="pl-9 pr-3 py-2 flex flex-col gap-2">
          {lesson.exercises?.map((ex, idx) => (
            <div 
              key={ex._id || idx} 
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectExercise && ex._id) onSelectExercise(ex._id);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="bg-white/10 p-1.5 rounded shrink-0 group-hover:bg-[#f4e900]/20 transition-colors">
                <LinkIcon className="w-3.5 h-3.5 text-[#f4e900]" />
              </div>
              <span className="text-xs text-white/80 font-medium group-hover:text-white transition-colors line-clamp-1">
                {ex.title || `Bài tập ${idx + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
