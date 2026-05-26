import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface CreateFeedbackPayload {
  videoId: string;
  courseId: string;
  message: string;
}

export interface FeedbackRecord {
  _id: string;
  videoId: string | { _id: string; title: string };
  courseId: string;
  adminId: string | any;
  message: string;
  status: 'pending_fix' | 'teacher_updated' | 'resolved' | 'ignored';
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string | any;
  createdAt: string;
  updatedAt: string;
}

class FeedbackService {
  async createFeedback(payload: CreateFeedbackPayload): Promise<ApiResponse<FeedbackRecord>> {
    return apiClient.post<FeedbackRecord>('/api/feedbacks', payload);
  }

  async getVideoFeedbacks(videoId: string): Promise<ApiResponse<FeedbackRecord[]>> {
    return apiClient.get<FeedbackRecord[]>(`/api/feedbacks/video/${videoId}`);
  }

  async getCourseFeedbacks(courseId: string): Promise<ApiResponse<FeedbackRecord[]>> {
    return apiClient.get<FeedbackRecord[]>(`/api/feedbacks/course/${courseId}`);
  }

  async updateFeedbackStatus(id: string, status: string): Promise<ApiResponse<FeedbackRecord>> {
    return apiClient.patch<FeedbackRecord>(`/api/feedbacks/${id}/status`, { status });
  }
}

export const feedbackService = new FeedbackService();
