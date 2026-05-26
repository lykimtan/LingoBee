import { apiClient } from "@/utils/api";
import { CourseVideo } from "@/types";

export const videoService = {

  createVideoByCourse: async (
    courseId: string,
    payload: Partial<CourseVideo>
  ) => {
    const encoded = encodeURIComponent(courseId);
    return await apiClient.post<CourseVideo>(
      `/api/videos/course/${encoded}`,
      payload
    );
  },
  
  getVideosByCourse: async (courseId: string) => {
    return await apiClient.get<CourseVideo[]>(`/api/videos/course/${courseId}`);
  },

  updateVideo: async (videoId: string, payload: Partial<CourseVideo>) => {
    return await apiClient.put<CourseVideo>(`/api/videos/${videoId}`, payload);
  },
  
  deleteVideo: async (videoId: string) => {
    return await apiClient.delete(`/api/videos/${videoId}`);
  },
  
  // Sau này có thể thêm các hàm khác như:
  // updateVideoStatus: async (...) => {}
};

export default videoService;