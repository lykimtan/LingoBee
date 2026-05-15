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
}

export const userService = new UserService();
