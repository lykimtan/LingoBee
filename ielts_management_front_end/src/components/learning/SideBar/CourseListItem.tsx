import { ChevronDown, ChevronUp } from "lucide-react";
import { LessonItem } from "./LessonItem";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  state: string;
  exercises?: any[];
}

interface Module {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: Lesson[];
}

interface CourseListItemProps {
  module: Module;
  onToggle: (id: string) => void;
  onSelectVideo?: (id: string) => void;
  onSelectExercise?: (id: string) => void;
}

export const CourseListItem = ({ module, onToggle, onSelectVideo, onSelectExercise }: CourseListItemProps) => {
  return (
    <div className="flex flex-col border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <button 
        onClick={() => onToggle(module.id)}
        className="flex items-center justify-between py-2 group"
      >
        <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors text-left pr-4">
          {module.title}
        </h3>
        {module.isExpanded ? (
          <ChevronUp className="h-4 w-4 text-white/40 group-hover:text-white/70" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-white/70" />
        )}
      </button>
      
      {module.isExpanded && module.lessons.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 pl-2">
          {module.lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} onClick={onSelectVideo} onSelectExercise={onSelectExercise} />
          ))}
        </div>
      )}
    </div>
  );
};
