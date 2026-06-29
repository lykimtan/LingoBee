import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface CommentAuthor {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface CommentModel {
  _id: string;
  author: CommentAuthor;
  content: string;
  targetType: 'Video' | 'Course' | 'User';
  targetId: string;
  rating?: number;
  parentId?: string | null;
  likes: string[];
  likeCount: number;
  isReply: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // Custom frontend state properties
  replies?: CommentModel[];
  showReplies?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetCommentsResponse {
  success: boolean;
  data: CommentModel[];
  pagination: PaginationData;
}

export interface CourseVideoMap {
  [videoId: string]: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    order: number;
    videoUrl?: string;
    description?: string;
  };
}

export interface CourseVideoCommentsData {
  comments: CommentModel[];
  videos: CourseVideoMap;
  pagination: PaginationData;
}

export interface CreateCommentData {
  targetType: 'Video' | 'Course' | 'User';
  targetId: string;
  content: string;
  rating?: number;
  parentId?: string | null;
}

class CommentService {
  async getComments(targetType: string, targetId: string, page = 1, limit = 10): Promise<GetCommentsResponse> {
    return apiClient.get<any>(`/api/comments/target/${targetType}/${targetId}?page=${page}&limit=${limit}`) as unknown as Promise<GetCommentsResponse>;
  }

  async getCourseVideoComments(courseId: string, page = 1, limit = 20): Promise<ApiResponse<CourseVideoCommentsData>> {
    return apiClient.get<CourseVideoCommentsData>(`/api/comments/teacher/course/${courseId}?page=${page}&limit=${limit}`);
  }

  async getReplies(commentId: string): Promise<ApiResponse<CommentModel[]>> {
    return apiClient.get<CommentModel[]>(`/api/comments/${commentId}/replies`);
  }

  async createComment(data: CreateCommentData): Promise<ApiResponse<CommentModel>> {
    return apiClient.post<CommentModel>(`/api/comments`, data);
  }

  async updateComment(id: string, data: { content?: string; rating?: number }): Promise<ApiResponse<CommentModel>> {
    return apiClient.put<CommentModel>(`/api/comments/${id}`, data);
  }

  async deleteComment(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/api/comments/${id}`);
  }

  async toggleLike(id: string): Promise<ApiResponse<{ isLiked: boolean; likeCount: number }>> {
    return apiClient.post<{ isLiked: boolean; likeCount: number }>(`/api/comments/${id}/like`);
  }

  async toggleHideComment(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch<any>(`/api/comments/${id}/toggle-hide`);
  }
}

export const commentService = new CommentService();
