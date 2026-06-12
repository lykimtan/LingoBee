"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { LearningHeader } from "./Layout/LearningHeader";
import { FloatingAskButton } from "./Layout/FloatingAskButton";
import { CourseListItem } from "./SideBar/CourseListItem";
import { OverviewTab } from "./Tabs/OverviewTab";
import { NotesTab } from "./Tabs/NotesTab";
import { DicussionTab } from "./Tabs/DicussionTab";
import { ResourcesTab } from "./Tabs/ResourcesTab";
import { ExerciseInterface } from "./Exercise/ExerciseInterface";
import { learningService, CourseLearningData, LearningVideo } from "@/services/learningService";
import { CourseReviewModal } from "./CourseReviewModal";
import { apiClient } from '@/utils/api';

const PlayrWrapper = dynamic(
  () => import("./VideoPlyr").then((mod) => mod.PlayrWrapper),
  { ssr: false }
);

const TABS = ["Tổng quan", "Tài liệu", "Ghi chú", "Thảo luận"];

// Helper to format duration
const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface LearningInterfaceProps {
  slug?: string;
  initialVideoId?: string;
}

export const LearningInterface = ({ slug, initialVideoId }: LearningInterfaceProps) => {
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [sidebarTab, setSidebarTab] = useState<"content" | "notes">("content");
  const [noteTime, setNoteTime] = useState(0);
  const videoRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<CourseLearningData['course'] | null>(null);
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(initialVideoId || null);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleSelectVideo = (videoId: string) => {
    setCurrentExerciseId(null);
    setCurrentVideoId(videoId);
  };

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await learningService.getCourseLearningData(slug);
        if (response.success && response.data) {
          const fetchedVideos = response.data.videos;
          console.log(fetchedVideos);
          setCourseData(response.data.course);
          setVideos(fetchedVideos);

          const accessibleArray = fetchedVideos.map((v, index) => {
            if (index === 0) return true;
            if (v.progress?.isCompleted) return true;
            const prevVideo = fetchedVideos[index - 1];
            return !!(prevVideo?.progress?.isCompleted || prevVideo?.progress?.canAccessNextVideo);
          });

          const currentIdx = fetchedVideos.findIndex(v => v._id === currentVideoId);
          const isCurrentAccessible = currentIdx !== -1 && accessibleArray[currentIdx];

          if (!isCurrentAccessible && fetchedVideos.length > 0) {
            const nextVideo = fetchedVideos.find((v, idx) => !v.progress?.isCompleted && accessibleArray[idx]) || fetchedVideos[0];
            handleSelectVideo(nextVideo._id);
          }

          // Fetch review status
          try {
            const reviewRes = await apiClient.get<{ hasReviewed: boolean }>(`/api/comments/course/${response.data.course.id}/my-review`);
            if (reviewRes.success && reviewRes.data?.hasReviewed) {
              setHasReviewed(true);
            }
          } catch (e) {
            console.error("Failed to fetch review status", e);
          }
        } else {
          setError("Failed to load course data");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Sync URL when video changes
  useEffect(() => {
    if (currentVideoId && currentVideoId !== initialVideoId) {
      window.history.replaceState(null, '', `/course/${slug}/learn/${currentVideoId}`);
    }
  }, [currentVideoId, slug, initialVideoId]);

  const handleProgressUpdate = React.useCallback(async (currentTime: number, duration: number, isCompleted: boolean) => {
    if (!currentVideoId) return;

    try {
      await learningService.updateVideoProgress(currentVideoId, {
        currentTime,
        duration,
        isCompleted
      });

      // Optimistically update local state if completed
      if (isCompleted) {
        setVideos(prev => prev.map(v =>
          v._id === currentVideoId
            ? { ...v, progress: { ...v.progress, isCompleted: true } as any }
            : v
        ));
      }
    } catch (err) {
      console.error("Failed to update progress", err);
    }
  }, [currentVideoId]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Tổng quan": return <OverviewTab description={currentVideo?.description} />;
      case "Tài liệu": return currentVideoId ? <ResourcesTab videoId={currentVideoId} onSelectExercise={setCurrentExerciseId} /> : null;
      case "Thảo luận": return currentVideoId ? (
        <DicussionTab 
          targetId={currentVideoId} 
          targetType="Video" 
          onSeekTo={(time) => {
            if (videoRef.current) {
              videoRef.current.seekTo(time);
            }
          }}
        />
      ) : null;
      case "Ghi chú": return currentVideoId && courseData ? (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-2">
          <NotesTab
            videoId={currentVideoId}
            courseId={courseData.id}
            currentTime={noteTime}
            onFocus={() => {
              if (videoRef.current) {
                videoRef.current.pause();
                setNoteTime(videoRef.current.getCurrentTime());
              }
            }}
            onSeekTo={(time) => {
              if (videoRef.current) {
                videoRef.current.seekTo(time);
              }
            }}
          />
        </div>
      ) : null;
      default: return <div className="py-6 text-white/60 text-sm">Nội dung cho {activeTab} đang được cập nhật.</div>;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Đang tải dữ liệu khóa học...</div>;
  }

  if (error || !courseData) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Không tìm thấy khóa học"}</div>;
  }

  const currentVideo = videos.find(v => v._id === currentVideoId) || videos[0];
  const completedCount = videos.filter(v => v.progress?.isCompleted).length;
  const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const accessibleVideos = videos.map((v, index) => {
    if (index === 0) return true;
    if (v.progress?.isCompleted) return true;
    const prevVideo = videos[index - 1];
    return !!(prevVideo?.progress?.isCompleted || prevVideo?.progress?.canAccessNextVideo);
  });

  // Map to Sidebar Modules
  const mappedModule = {
    id: "all-lessons",
    title: "Nội dung khóa học",
    isExpanded: true,
    lessons: videos.map((v, index) => {
      let state = "locked";
      if (currentVideoId === v._id) {
        state = "playing";
      } else if (v.progress?.isCompleted) {
        state = "completed";
      } else if (accessibleVideos[index]) {
        state = "unlocked";
      }

      return {
        id: v._id,
        title: v.title,
        duration: formatDuration(v.duration),
        state,
        exercises: v.exercises || []
      };
    })
  };

  const nextUncompletedVideo = videos.find((v, index) => !v.progress?.isCompleted && v._id !== currentVideoId && accessibleVideos[index]);

  return (
    <div className="min-h-screen text-white selection:bg-[#f4e900]/30 font-sans">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          <div className="flex flex-col gap-6">
            {currentExerciseId ? (
              <ExerciseInterface exerciseId={currentExerciseId} />
            ) : (
              <>
                <PlayrWrapper
                  key={currentVideoId || 'default'}
                  ref={videoRef}
                  videoUrl={currentVideo?.videoUrl}
                  thumbnailUrl={currentVideo?.thumbnailUrl}
                  initialTime={currentVideo?.progress?.currentTime}
                  onProgressUpdate={handleProgressUpdate}
                />
                <LearningHeader title={currentVideo?.title} />

                <div className="flex items-center gap-8 border-b border-white/10 mt-4 overflow-x-auto no-scrollbar">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                        }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>

                {renderActiveTab()}
              </>
            )}
          </div>

          <div className="flex flex-col gap-6 sticky top-24">
            <div className="rounded-2xl liquid-glass p-6 shadow-xl flex flex-col max-h-[80vh]">
              <div className="flex items-center gap-4 border-b border-white/10 mb-6 pb-2">
                <button
                  onClick={() => setSidebarTab("content")}
                  className={`text-sm font-bold uppercase tracking-wide transition-colors ${sidebarTab === "content" ? "text-white border-b-2 border-[#f4e900] pb-2 -mb-2.5" : "text-white/40 hover:text-white/70"}`}
                >
                  Nội dung
                </button>
                <button
                  onClick={() => setSidebarTab("notes")}
                  className={`text-sm font-bold uppercase tracking-wide transition-colors ${sidebarTab === "notes" ? "text-white border-b-2 border-[#f4e900] pb-2 -mb-2.5" : "text-white/40 hover:text-white/70"}`}
                >
                  Ghi chú
                </button>
              </div>

              {sidebarTab === "content" ? (
                <div className="flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-4">
                  <h2 className="text-lg font-bold text-white mb-4">{courseData.title}</h2>
                  <div className="space-y-2 mb-6">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/70 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">
                        {progressPercentage}% HOÀN THÀNH ({completedCount}/{videos.length} BÀI HỌC)
                      </p>
                      {progressPercentage === 100 && !hasReviewed && (
                        <button
                          onClick={() => setIsReviewModalOpen(true)}
                          className="px-3 py-1 bg-[#f4e900] text-black text-[10px] font-bold tracking-wider uppercase rounded-full hover:bg-yellow-400 transition-colors"
                        >
                          Đánh giá khóa học
                        </button>
                      )}
                      {progressPercentage === 100 && hasReviewed && (
                        <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] font-bold tracking-wider uppercase rounded-full">
                          Đã đánh giá
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <CourseListItem
                      module={mappedModule}
                      onToggle={() => { }}
                      onSelectVideo={handleSelectVideo}
                      onSelectExercise={setCurrentExerciseId}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {currentVideoId ? (
                    <NotesTab
                      videoId={currentVideoId}
                      courseId={courseData.id}
                      currentTime={noteTime}
                      onFocus={() => {
                        if (videoRef.current) {
                          videoRef.current.pause();
                          setNoteTime(videoRef.current.getCurrentTime());
                        }
                      }}
                      onSeekTo={(time) => {
                        if (videoRef.current) {
                          videoRef.current.seekTo(time);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-white/50 text-sm">Vui lòng chọn bài học để ghi chú.</div>
                  )}
                </div>
              )}
            </div>

            {nextUncompletedVideo && (
              <div
                className="rounded-2xl liquid-glass p-6 shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:bg-white/5"
                onClick={() => handleSelectVideo(nextUncompletedVideo._id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">Next Lesson</p>
                <h3 className="text-base font-semibold text-white mb-4">{nextUncompletedVideo.title}</h3>
                <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors flex items-center gap-2">
                  Continue Course <span>&rarr;</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingAskButton />

      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --plyr-color-main: #f4e900;
          --plyr-video-background: #000;
          --plyr-menu-background: #1c1c1f;
          --plyr-menu-color: #fff;
        }
        .plyr--video {
          border-radius: 1rem;
          overflow: hidden;
        }
      `}} />

      {courseData && (
        <CourseReviewModal
          courseId={courseData.id}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => setHasReviewed(true)}
        />
      )}
    </div>
  );
};
