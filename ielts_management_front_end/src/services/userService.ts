import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

export interface UserListResponse {
  users: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class UserService {
  async getTeachers(limit: number = 200): Promise<ApiResponse<UserListResponse>> {
    return apiClient.get<UserListResponse>(`/api/users?role=teacher&limit=${limit}`);
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/users/profile');
  }

  async searchTeachers(query: string): Promise<ApiResponse<{ results: UserListItem[], count: number }>> {
    return apiClient.get(`/api/users/teachers/search?query=${encodeURIComponent(query)}`);
  }

  async searchUsersAdmin(query: string): Promise<ApiResponse<UserListItem[]>> {
    return apiClient.get(`/api/users/search/query?query=${encodeURIComponent(query)}`);
  }

  async getAdminStudents(params?: { page?: number; limit?: number; search?: string; status?: string; courseId?: string }): Promise<ApiResponse<any>> {
    let url = '/api/users/students/admin';
    if (params) {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.courseId) query.append('courseId', params.courseId);
      
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get<any>(url);
  }

  async getAdminStudentStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/users/students/admin/stats');
  }

  async getAdminStudentDetail(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/users/students/admin/${userId}/detail`);
  }

  async blockUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/users/${userId}/block`, {});
  }

  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/users/${userId}/unblock`, {});
  }

  async upgradeToTeacher(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/users/students/admin/${userId}/upgrade-to-teacher`, {});
  }

  async upgradeToAdmin(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/users/${userId}/upgrade-to-admin`, {});
  }

  async getAdminTeachers(params?: { page?: number; limit?: number; search?: string; status?: string; courseId?: string }): Promise<ApiResponse<any>> {
    let url = '/api/users/teachers/admin';
    if (params) {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.courseId && params.courseId !== 'all') query.append('courseId', params.courseId);
      
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get<any>(url);
  }

  async getAdminTeacherStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/users/teachers/admin/stats');
  }

  async getAdminTeacherDetail(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/users/teachers/admin/${userId}/detail`);
  }

  async downgradeToStudent(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/users/teachers/admin/${userId}/downgrade-to-student`, {});
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/users/stats/overview');
  }
}

export const userService = new UserService();
