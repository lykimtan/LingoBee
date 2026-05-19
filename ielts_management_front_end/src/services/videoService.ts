import { apiClient } from "@/utils/api";
import { CourseVideo } from "@/types";

export const videoService = {
  getVideosByCourse: async (courseId: string) => {
    return await apiClient.get<CourseVideo[]>(`/api/videos/course/${courseId}`);
  },
  
  deleteVideo: async (videoId: string) => {
    return await apiClient.delete(`/api/videos/${videoId}`);
  },
  
  // Sau này có thể thêm các hàm khác như:
  // updateVideoStatus: async (...) => {}
};

export default videoService;