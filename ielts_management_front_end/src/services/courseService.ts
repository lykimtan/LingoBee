import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface CreateCourseShellPayload {
  title: string;
  description: string;
  category: string;
  level: string;
  teacher: string;
  courseDetail?: string;
  courseStartDate?: string;
  courseEndDate?: string;
  inviteMessage?: string;
}

export interface CourseRecord {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  teacher: string;
  status: string;
}

class CourseService {
  async createCourseShell(
    payload: CreateCourseShellPayload
  ): Promise<ApiResponse<CourseRecord>> {
    return apiClient.post<CourseRecord>('/api/courses', payload);
  }
}

export const courseService = new CourseService();
