"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { courseService } from '@/services/courseService';
import { videoService } from '@/services/videoService';
import { AdminCourseItem, CourseVideo } from '@/types';
import CoursePreviewHeader from '@/components/admin/courses/preview/CoursePreviewHeader';
import CoursePreviewVideo from '@/components/admin/courses/preview/CoursePreviewVideo';
import CoursePreviewSidebar from '@/components/admin/courses/preview/CoursePreviewSidebar';
export default function AdminCoursePreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<AdminCourseItem | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCourseData();
    }
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const courseRes = await courseService.getAdminCourseBySlug<AdminCourseItem>(slug);

      if (courseRes.success || courseRes.status === 'success') {
        const courseData = courseRes.data as AdminCourseItem;
        setCourse(courseData);

        if (courseData?._id) {
          const videosRes = await videoService.getVideosByCourse(courseData._id);
          if (videosRes.status === 'success' && videosRes.data) {
            setVideos(videosRes.data);
            if (videosRes.data.length > 0) {
              setActiveVideo(videosRes.data[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!course || !course._id) return;
    try {
      setIsPublishing(true);
      const res = await courseService.updateCourse(course._id, { status: newStatus });
      if (res.status === 'success' || res.success) {
        toast.success(`Khóa học đã được cập nhập trạng thái: ${newStatus}`);
        setCourse(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error('Không thể cập nhập trạng thái khóa học.');
      }
    } catch (error) {
      console.error('Lỗi cập nhập trạng thái khóa học:', error);
      toast.error('Có lỗi xảy ra trong quá trình cập nhập trạng thái.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdatePrice = async (priceTiers: any[]) => {
    if (!course || !course._id) return;
    try {
      setIsPublishing(true);
      const res = await courseService.updateCourse(course._id, { priceTiers });
      if (res.status === 'success' || res.success) {
        toast.success(`Thiết lập giá thành công!`);
        setCourse(prev => prev ? { ...prev, priceTiers } : null);
      } else {
        toast.error('Không thể thiết lập giá khóa học.');
      }
    } catch (error) {
      console.error('Lỗi thiết lập giá khóa học:', error);
      toast.error('Có lỗi xảy ra trong quá trình thiết lập giá.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <CoursePreviewHeader
        course={course}
        onStatusChange={handleStatusChange}
        onUpdatePrice={handleUpdatePrice}
        isPublishing={isPublishing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CoursePreviewVideo
            course={course}
            activeVideo={activeVideo}
          />
        </div>

        <div className="lg:col-span-1">
          <CoursePreviewSidebar
            videos={videos}
            activeVideoId={activeVideo?._id}
            onVideoSelect={setActiveVideo}
          />
        </div>
      </div>
    </div>
  );
}
