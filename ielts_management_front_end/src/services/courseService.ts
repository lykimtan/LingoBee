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

export interface CourseInvitation {
  _id: string;
  course: {
    _id: string;
    title: string;
    category: string;
    level: string;
    status: string;
  };
  teacher: string;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'teacher' | 'assistant';
  createdAt: string;
  respondedAt?: string;
}

export interface TeacherEnrollmentStats {
  totalEnrollments: number;
  newThisWeek: number;
  totalCourses: number;
  publishedCourses: number;
  chartData: Array<{
    day: string;
    value: number;
    count: number;
    active: boolean;
  }>;
}

export interface TeacherStudentEnrollment {
  enrollmentId: string;
  studentId: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
  };
  courseId: {
    _id: string;
    title: string;
    slug?: string;
    level?: string;
  };
  enrollmentDate: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped' | string;
  placementTests?: Array<{
    testId: string;
    totalScore: number;
    maxScore: number;
    date: string;
    status: string;
  }>;
}

export interface TeacherStudentsOverview {
  summary: {
    totalStudents: number;
    activeCount: number;
    completedCount: number;
    avgProgress: number;
    totalEnrollments: number;
  };
  courses: Array<{
    _id: string;
    title: string;
    level?: string;
  }>;
  enrollments: TeacherStudentEnrollment[];
}

class CourseService {
  async getTeacherEnrollmentStats(): Promise<ApiResponse<TeacherEnrollmentStats>> {
    return apiClient.get<TeacherEnrollmentStats>('/api/courses/my/enrollment-stats');
  }

  async getTeacherStudents(
    courseId?: string,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TeacherStudentsOverview>> {
    const params = new URLSearchParams();
    if (courseId && courseId !== 'all') params.append('courseId', courseId);
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<TeacherStudentsOverview>(`/api/courses/my/students${queryString}`);
  }

  async createCourseShell(
    payload: CreateCourseShellPayload
  ): Promise<ApiResponse<CourseRecord>> {
    return apiClient.post<CourseRecord>('/api/courses', payload);
  }

  async getMyCourseInvitations(status?: string): Promise<ApiResponse<CourseInvitation[]> & { count?: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<CourseInvitation[]>(`/api/courses/invitations${queryString}`);
  }

  async acceptCourseInvitation(id: string): Promise<ApiResponse<CourseInvitation>> {
    const encoded = encodeURIComponent(id);
    return apiClient.post<CourseInvitation>(`/api/courses/invitations/${encoded}/accept`);
  }

  async rejectCourseInvitation(id: string): Promise<ApiResponse<CourseInvitation>> {
    const encoded = encodeURIComponent(id);
    return apiClient.post<CourseInvitation>(`/api/courses/invitations/${encoded}/reject`);
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

  async getCourseAdminStats(courseId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const encoded = encodeURIComponent(courseId);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<any>(`/api/courses/${encoded}/admin-stats${queryString}`);
  }

  async getCourseTeacherStats(courseId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const encoded = encodeURIComponent(courseId);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<any>(`/api/courses/${encoded}/teacher-stats${queryString}`);
  }
}

export const courseService = new CourseService();
