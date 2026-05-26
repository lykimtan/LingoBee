import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Plyr = dynamic(async () => (await import('plyr-react')).Plyr, { ssr: false });
import 'plyr-react/plyr.css';
import { CourseVideo, AdminCourseItem } from '@/types';
import { Send, PlayCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import CoursePreviewExercises from './CoursePreviewExercises';
import { feedbackService, FeedbackRecord } from '@/services/feedbackService';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { createSafeHtml } from '@/utils/utils';


interface CoursePreviewVideoProps {
  course: AdminCourseItem | null;
  activeVideo: CourseVideo | null;
}

const CoursePreviewVideo: React.FC<CoursePreviewVideoProps> = ({ course, activeVideo }) => {
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (activeVideo?._id) {
      fetchFeedbacks();
    } else {
      setFeedbacks([]);
    }
  }, [activeVideo]);

  const fetchFeedbacks = async () => {
    if (!activeVideo?._id) return;
    try {
      setIsLoadingFeedbacks(true);
      const res = await feedbackService.getVideoFeedbacks(activeVideo._id);
      if (res.success || res.status === 'success') {
        setFeedbacks(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      toast.warning('Vui lòng nhập phản hồi trước.');
      return;
    }

    if (!course?._id || !activeVideo?._id) {
      toast.error('Không thể gửi phản hồi khi không có khóa học hoặc video hợp lệ được chọn.');
      return;
    }

    setIsSending(true);
    try {
      const res = await feedbackService.createFeedback({
        videoId: activeVideo._id,
        courseId: course._id,
        message: feedback.trim(),
      });

      if (res.success || res.status === 'success') {
        toast.success('Feedback đã được gửi thành công đến giáo viên!');
        setFeedback('');
        if (res.data) {
          setFeedbacks(prev => [res.data as FeedbackRecord, ...prev]);
        }
      } else {
        toast.error(res.message || 'Không thể gửi phản hồi.');
      }
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      toast.error('Đã có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Player Area */}
      <div className="bg-black rounded-xl aspect-video overflow-hidden relative flex items-center justify-center [&_.plyr]:w-full [&_.plyr]:h-full">
        {activeVideo ? (
          <Plyr
            source={{
              type: "video",
              sources: [
                {
                  src: activeVideo.videoUrl,
                },
              ],
              poster: activeVideo.thumbnailUrl,
            }}
            options={{
              controls: [
                "play-large",
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "captions",
                "settings",
                "pip",
                "airplay",
                "fullscreen",
              ],
            }}
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
            <p>No video selected</p>
          </div>
        )}
      </div>

      {/* Video / Course Info Area */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20">
              {course?.teacher?.profilePicture ? (
                <img src={course.teacher.profilePicture} alt={course.teacher.firstName || 'Teacher'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-medium">
                  {course?.teacher?.firstName?.[0] || 'T'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {activeVideo?.title || course?.title || 'Loading...'}
              </h2>
              <div className="text-sm text-gray-300 mt-1 flex flex-wrap gap-2 items-center">
                <span>Instructor: <strong className="text-white">{course?.teacher?.firstName} {course?.teacher?.lastName}</strong></span>
                <span>•</span>
                <span>Last Updated {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}</span>
                {activeVideo?.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(activeVideo.duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {course?.level && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-md text-sm font-medium">
                {course.level}
              </span>
            )}
            {course?.category && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-md text-sm font-medium">
                {course.category}
              </span>
            )}
          </div>
        </div>

        <div
          className="prose max-w-none text-gray-300"
          dangerouslySetInnerHTML={{
            __html: activeVideo?.description || course?.description || 'No description provided.'
          }}
        />
      </div>

      {/* Exercises Section */}
      <CoursePreviewExercises activeVideo={activeVideo} />

      {/* Feedback History */}
      {feedbacks.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Previous Feedback</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-xs text-white">
                      {fb.adminId?.profilePicture ? (
                        <img src={fb.adminId.profilePicture} alt="Admin" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-medium text-sm">{fb.adminId?.firstName?.[0] || 'A'}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white block">
                        {fb.adminId?.firstName} {fb.adminId?.lastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    {fb.status === 'pending_fix' && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30">Chờ chỉnh sửa</span>}
                    {fb.status === 'teacher_updated' && <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">Đã chỉnh sửa</span>}
                    {fb.status === 'resolved' && <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">Đã giải quyết</span>}
                    {fb.status === 'ignored' && <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded border border-gray-500/30">Bỏ qua</span>}
                  </div>
                </div>
                <div className='mt-2' dangerouslySetInnerHTML={createSafeHtml(fb.message)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Feedback Box */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-gray-300" />
          Admin Feedback
        </h3>
        <RichTextEditor
          className="w-full p-4 bg-white/5 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none resize-y placeholder-gray-400"
          value={feedback}
          onChange={setFeedback}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSendFeedback}
            disabled={isSending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/10 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Feedback to Teacher'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewVideo;
