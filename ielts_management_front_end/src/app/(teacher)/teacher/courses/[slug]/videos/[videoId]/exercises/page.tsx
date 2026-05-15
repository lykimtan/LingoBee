"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/utils/api";
import { CourseVideo } from "@/components/teacher/courses/TeacherVideoList";
import VideoExerciseHeader from "@/components/teacher/courses/video-exercises/VideoExerciseHeader";
import VideoExercisePlayer from "@/components/teacher/courses/video-exercises/VideoExercisePlayer";
import VideoExerciseForm from "@/components/teacher/courses/video-exercises/VideoExerciseForm";

type CourseSummary = {
  _id: string;
  title: string;
  slug: string;
};

export default function TeacherVideoExercisesPage() {
  const params = useParams<{ slug?: string | string[]; videoId?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const videoId = Array.isArray(params?.videoId) ? params.videoId[0] : params?.videoId;
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [video, setVideo] = useState<CourseVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setVideo(null);

      if (!slug || !videoId) {
        setError("Thieu thong tin video hoac khoa hoc.");
        setIsLoading(false);
        return;
      }

      const courseResponse = await apiClient.get<CourseSummary>(
        `/api/courses/my/${slug}`
      );

      if (!isActive) return;

      if (courseResponse.status === "error" || !courseResponse.data) {
        setError(courseResponse.message || "Khong the tai thong tin khoa hoc.");
        setIsLoading(false);
        return;
      }

      setCourse(courseResponse.data);

      const videoResponse = await apiClient.get<CourseVideo[]>(
        `/api/videos/course/${courseResponse.data._id}`
      );

      if (!isActive) return;

      if (videoResponse.status === "error" || !videoResponse.data) {
        setError(videoResponse.message || "Khong the tai danh sach video.");
        setIsLoading(false);
        return;
      }

      const matchedVideo = videoResponse.data.find((item) => item._id === videoId);

      if (!matchedVideo) {
        setError("Khong tim thay video duoc chon.");
        setIsLoading(false);
        return;
      }

      setVideo(matchedVideo);
      setIsLoading(false);
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [slug, videoId]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      <VideoExerciseHeader
        slug={slug || ""}
        courseTitle={course?.title}
        videoTitle={video?.title}
      />
      <VideoExercisePlayer video={video} isLoading={isLoading} error={error} />
      <VideoExerciseForm
        videoTitle={video?.title}
        isDisabled={isLoading || !!error}
      />
    </div>
  );
}
