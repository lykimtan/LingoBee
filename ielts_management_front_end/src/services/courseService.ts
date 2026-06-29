import { apiClient } from '@/utils/api';
import { AdminCourseItem, ApiResponse, TeacherCourseItem } from '@/types';

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

  async getMyCourses() {
    return apiClient.get<TeacherCourseItem[]>("/api/courses/my");
  }

  async getMyCourseBySlug<T = unknown>(slug: string): Promise<ApiResponse<T>> {
    const encoded = encodeURIComponent(slug);
    return apiClient.get<T>(`/api/courses/my/${encoded}`);
  }

  async updateCourse<T = unknown>(courseId: string, payload: unknown): Promise<ApiResponse<T>> {
    const encoded = encodeURIComponent(courseId);
    return apiClient.put<T>(`/api/courses/${encoded}`, payload);
  }

  async requestCoursePreview(courseId: string): Promise<ApiResponse<unknown>> {
    const encoded = encodeURIComponent(courseId);
    return apiClient.post(`/api/courses/${encoded}/request-preview`);
  }

  async getAllCourses() {
  return apiClient.get<AdminCourseItem[]>("/api/courses");
}

  async getPublicCourses() {
    return apiClient.get<AdminCourseItem[]>("/api/courses/public");
  }

  async getPublicCourseBySlug<T = AdminCourseItem>(slug: string): Promise<ApiResponse<T>> {
    const encoded = encodeURIComponent(slug);
    return apiClient.get<T>(`/api/courses/public/slug/${encoded}`);
  }

  async getAdminCourseBySlug<T = AdminCourseItem>(slug: string): Promise<ApiResponse<T>> {
    const encoded = encodeURIComponent(slug);
    return apiClient.get<T>(`/api/courses/slug/${encoded}`);
  }

  async getCourseStudents(courseId: string): Promise<ApiResponse<any[]>> {
    const encoded = encodeURIComponent(courseId);
    return apiClient.get<any[]>(`/api/courses/${encoded}/students`);
  }

  async getCourseAdminStats(courseId: string): Promise<ApiResponse<any>> {
    const encoded = encodeURIComponent(courseId);
    return apiClient.get<any>(`/api/courses/${encoded}/admin-stats`);
  }
}

export const courseService = new CourseService();
