"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MessageSquare, PlayCircle, Loader2, RefreshCw, Video as VideoIcon } from "lucide-react";
import { commentService, CommentModel, CourseVideoMap } from "@/services/commentService";
import { toast } from "react-toastify";
import { TeacherDiscussionTab } from "./TeacherDiscussionTab";
import VideoExercisePlayer from "./video-exercises/VideoExercisePlayer";

interface TeacherCourseDiscussionsProps {
  courseId: string;
}

export default function TeacherCourseDiscussions({ courseId }: TeacherCourseDiscussionsProps) {
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [videoMap, setVideoMap] = useState<CourseVideoMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const plyrRef = useRef<any>(null);

  const handleSeekTo = (time: number) => {
    if (plyrRef.current?.plyr) {
      plyrRef.current.plyr.currentTime = time;
      plyrRef.current.plyr.play();
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await commentService.getCourseVideoComments(courseId, 1, 50);
      if (response.success && response.data) {
        setComments(response.data.comments || []);
        const videos = response.data.videos || {};
        setVideoMap(videos);

        // Auto select first video if none selected
        if (!selectedVideoId && Object.keys(videos).length > 0) {
          const sortedVideos = Object.values(videos).sort((a, b) => a.order - b.order);
          setSelectedVideoId(sortedVideos[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
      toast.error("Không thể tải danh sách bình luận.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchComments();
    }
  }, [courseId]);

  const videosList = Object.values(videoMap).sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[600px] w-full gap-6 rounded-3xl bg-white/40 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md border border-white/60">

      {/* Left Pane: Videos List */}
      <div className="flex w-1/3 flex-col rounded-2xl bg-white/60 shadow-sm border border-white flex-shrink-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-blue-500" />
            Video Bài Giảng
          </h2>
          <button onClick={fetchComments} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Tải lại danh sách">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : videosList.length === 0 ? (
            <div className="text-center p-8 text-sm text-gray-500 italic">
              Không có video nào trong khóa học này.
            </div>
          ) : (
            videosList.map(video => {
              const isSelected = selectedVideoId === video._id;
              const commentCount = comments.filter(c => c.targetId === video._id).length;

              return (
                <div
                  key={video._id}
                  onClick={() => setSelectedVideoId(video._id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-3 ${isSelected
                      ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                >
                  <div className="w-16 h-10 bg-gray-200 rounded-lg overflow-hidden relative shrink-0">
                    {video.thumbnailUrl ? (
                      <Image src={video.thumbnailUrl} alt={video.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><PlayCircle className="w-4 h-4 text-gray-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{video.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Thứ tự: {video.order}</p>
                  </div>
                  {commentCount > 0 && (
                    <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                      {commentCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Discussion Detail */}
      <div className="flex flex-1 flex-col rounded-2xl bg-white/60 shadow-lg overflow-hidden relative border border-white">
        {selectedVideoId ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-white/80 shrink-0 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Thảo luận: {videoMap[selectedVideoId]?.title}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent">
              <div className="p-6 pb-2">
                <VideoExercisePlayer 
                  video={videoMap[selectedVideoId] as any} 
                  isLoading={false} 
                  error={null} 
                  plyrRef={plyrRef}
                />
              </div>
              {/* Render the teacher discussion tab */}
              <div className="px-6 pb-6">
                <TeacherDiscussionTab 
                  targetId={selectedVideoId} 
                  targetType="Video" 
                  onSeekTo={handleSeekTo}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/40">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa chọn video nào</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Vui lòng chọn một video từ danh sách bên trái để xem chi tiết bình luận và trả lời học viên.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
