import React from 'react';
import { AdminCourseItem } from '@/types';
import { ArrowLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoursePreviewHeaderProps {
  course: AdminCourseItem | null;
  onStatusChange: (status: string) => void;
  isPublishing?: boolean;
}

const CoursePreviewHeader: React.FC<CoursePreviewHeaderProps> = ({
  course,
  onStatusChange,
  isPublishing = false
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <nav className="flex items-center text-sm text-gray-400 mb-2">
          <button onClick={() => router.back()} className="hover:text-white transition-colors">
            Admin
          </button>
          <ChevronRight className="w-4 h-4 mx-1" />
          <button onClick={() => router.back()} className="hover:text-white transition-colors">
            Course Approval
          </button>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">{course?.title || 'Loading...'}</span>
        </nav>

        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">
            {course?.title || 'Course Title'}
          </h1>
          {course?.status === 'pending' && (
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
              Pending Review
            </span>
          )}
          {course?.status === 'published' && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Published
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => onStatusChange('published')}
          disabled={isPublishing}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isPublishing ? 'Publishing...' : 'Publish Course'}
        </button>
      </div>
    </div>
  );
};

export default CoursePreviewHeader;
