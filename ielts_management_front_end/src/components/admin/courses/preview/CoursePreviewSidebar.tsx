import React, { useState } from 'react';
import { CourseVideo } from '@/types';
import { BookOpen, PlayCircle, CheckCircle, ChevronDown, ChevronUp, FileText, History } from 'lucide-react';

interface CoursePreviewSidebarProps {
  videos: CourseVideo[];
  activeVideoId?: string;
  onVideoSelect: (video: CourseVideo) => void;
}

const CoursePreviewSidebar: React.FC<CoursePreviewSidebarProps> = ({
  videos,
  activeVideoId,
  onVideoSelect
}) => {
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Accordion */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-sm">
        <button
          className="w-full px-5 py-4 flex items-center justify-between bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors"
          onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
        >
          <div className="flex items-center gap-3 font-semibold text-white">
            <span className="text-gray-400">01</span>
            Main Curriculum
          </div>
          {isCurriculumOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {isCurriculumOpen && (
          <div className="divide-y divide-white/10">
            {videos.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No videos uploaded yet.
              </div>
            ) : (
              videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => onVideoSelect(video)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${activeVideoId === video._id ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                >
                  <div className={`mt-0.5 ${activeVideoId === video._id ? 'text-green-400' : 'text-gray-400'}`}>
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${activeVideoId === video._id ? 'text-green-300' : 'text-gray-200'}`}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{formatDuration(video.duration)}</p>
                  </div>
                  {activeVideoId === video._id && (
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePreviewSidebar;
