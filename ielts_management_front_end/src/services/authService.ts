/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '@/utils/api';
import { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginPayload {
  code?: string;
  idToken?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  name: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/api/auth/login', payload);
  }

  /**
   * Google login
   */
  async googleLogin(payload: GoogleLoginPayload): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/api/auth/google', payload);
  }

  /**
   * Register new user
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>('/api/auth/register', payload);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/auth/me');
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/api/auth/logout');
  }

  /**
   * Update profile (name, avatar)
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/api/auth/profile', payload);
  }

  /**
   * Change user password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/api/auth/change-password', payload);
  }

  /**
   * Verify password for sensitive actions
   */
  async verifyPassword(payload: { password: string }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/verify-password', payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/api/auth/refresh-token');
  }
}

export const authService = new AuthService();
