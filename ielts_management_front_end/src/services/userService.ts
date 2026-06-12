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
}

export const userService = new UserService();
