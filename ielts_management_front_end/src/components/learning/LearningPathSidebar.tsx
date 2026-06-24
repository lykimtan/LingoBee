import React from 'react';
import { LearningPathData } from '@/services/learningPathService';

interface LearningPathSidebarProps {
  learningPath: LearningPathData;
  currentVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
  onRegenerate: () => void;
}

export const LearningPathSidebar = ({ learningPath, currentVideoId, onSelectVideo, onSelectExercise, onRegenerate }: LearningPathSidebarProps) => {
  return (
    <div className="flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Lộ Trình AI</h2>
        <button
          onClick={onRegenerate}
          className="text-xs text-[#f4e900] hover:text-yellow-400 font-semibold underline"
        >
          Tạo lại
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f4e900] rounded-full transition-all duration-500"
            style={{ width: `${learningPath.overallProgress || 0}%` }}
          />
        </div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#f4e900]">
          {learningPath.overallProgress || 0}% HOÀN THÀNH
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {learningPath.dailySchedule.map((dayItem) => {
          const today = new Date();
          const itemDate = new Date(dayItem.date);
          const isToday = itemDate.getDate() === today.getDate() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear();

          // Check if day is past deadline
          const isPastDeadline = new Date(dayItem.deadline) < today && !isToday;
          const dayDate = itemDate.toLocaleDateString('vi-VN');

          return (
            <div key={dayItem.day} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Ngày {dayItem.day} - {dayDate}</h3>
                {dayItem.isCompleted ? (
                  <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold uppercase">Hoàn thành</span>
                ) : isToday ? (
                  <span className="text-[10px] px-2 py-1 bg-[#f4e900]/20 text-[#f4e900] rounded-full font-bold uppercase">Hôm nay</span>
                ) : isPastDeadline ? (
                  <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-bold uppercase">Trễ hạn</span>
                ) : (
                  <span className="text-[10px] px-2 py-1 bg-white/10 text-white/60 rounded-full font-bold uppercase">Sắp tới</span>
                )}
              </div>

              <div className="flex flex-col gap-2 border-l-2 border-white/10 pl-4 ml-1">
                {dayItem.lessons.map((lesson) => {
                  const isCurrent = currentVideoId === lesson.videoId._id;

                  return (
                    <div key={lesson.videoId._id} className="flex flex-col gap-1">
                      <button
                        onClick={() => onSelectVideo(lesson.videoId._id)}
                        className={`text-left p-3 rounded-xl transition-colors border ${isCurrent
                            ? 'bg-white/10 border-white/20'
                            : 'bg-transparent border-transparent hover:bg-white/5'
                          } flex flex-col gap-1`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${lesson.isCompleted ? 'bg-[#f4e900] text-black' : 'bg-white/10 text-white/50'
                            }`}>
                            {lesson.isCompleted ? '✓' : lesson.order}
                          </div>
                          <span className={`text-sm font-semibold truncate ${lesson.isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                            {lesson.videoId.title}
                          </span>
                        </div>
                      </button>

                      {/* Exercises if any */}
                      {lesson.exercises && lesson.exercises.length > 0 && (
                        <div className="flex flex-col gap-1 pl-10">
                          {lesson.exercises.map(ex => (
                            <button
                              key={ex.exerciseId._id}
                              onClick={() => onSelectExercise(ex.exerciseId._id)}
                              className="text-left text-xs text-white/60 hover:text-white flex items-center gap-2 py-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-white/40" />
                              Bài tập: {ex.exerciseId.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
