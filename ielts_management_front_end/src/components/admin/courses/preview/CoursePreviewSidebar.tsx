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
      {/* Overview Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Course Curriculum</h3>
            <p className="text-sm text-gray-300">1 Module • {videos.length} Lessons</p>
          </div>
        </div>
        <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors border border-white/10">
          View Course Analytics
        </button>
      </div>

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

      {/* Resources */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resources</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
            <FileText className="w-4 h-4 text-gray-400" />
            Downloadable PDFs
          </button>
          <button className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
            <History className="w-4 h-4 text-gray-400" />
            Review History
          </button>
        </div>
      </div>



    </div>
  );
};

export default CoursePreviewSidebar;
