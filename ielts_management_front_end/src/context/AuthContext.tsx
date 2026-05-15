/**
 * Auth Context
 * Global authentication context for the application
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ApiResponse, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  RegisterResponse,
  UpdateProfilePayload,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (
    payload: LoginPayload,
    options?: { remember?: boolean }
  ) => Promise<ApiResponse<LoginResponse> | undefined>;
  googleLogin: (
    payload: GoogleLoginPayload,
    options?: { remember?: boolean }
  ) => Promise<ApiResponse<LoginResponse> | undefined>;
  register: (payload: RegisterPayload) => Promise<ApiResponse<RegisterResponse> | undefined>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ApiResponse<User> | undefined>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, error, login, googleLogin, register, updateProfile, logout } = useAuth();

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, googleLogin, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
