/**
 * useAuth Hook
 * Custom hook for authentication logic
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  authService,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/services/authService';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncUserState = useCallback((updatedUser: User) => {
    setUser(updatedUser);

    if (typeof window === 'undefined') {
      return;
    }

    const storages = [localStorage, sessionStorage];
    for (const storage of storages) {
      if (storage.getItem(STORAGE_KEYS.USER_DATA)) {
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
    }
  }, []);

  const persistAuthSession = (
    loggedInUser: User,
    accessToken: string,
    refreshToken: string,
    remember: boolean
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    const targetStorage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    targetStorage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken);
    targetStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    targetStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(loggedInUser));

    otherStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    otherStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    otherStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storages = [localStorage, sessionStorage];
    for (const storage of storages) {
      const storedUser = storage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedUser) {
        continue;
      }

      try {
        setUser(JSON.parse(storedUser) as User);
        break;
      } catch {
        storage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload, options?: { remember?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(payload);
        if (response.status === 'success' && response.data) {
          const { user: loggedInUser, accessToken, refreshToken } = response.data;
          setUser(loggedInUser);
          const remember = options?.remember ?? true;
          persistAuthSession(loggedInUser, accessToken, refreshToken, remember);
          return response;
        }
        setError(response.message || 'Login failed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const googleLogin = useCallback(
    async (payload: GoogleLoginPayload, options?: { remember?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.googleLogin(payload);
        if (response.status === 'success' && response.data) {
          const { user: loggedInUser, accessToken, refreshToken } = response.data;
          setUser(loggedInUser);
          const remember = options?.remember ?? true;
          persistAuthSession(loggedInUser, accessToken, refreshToken, remember);
          return response;
        }
        setError(response.message || 'Google login failed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      if (response.status === 'success') {
        return response;
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(payload);
      if (response.status === 'success' && response.data) {
        syncUserState(response.data);
        return response;
      }
      setError(response.message || 'Profile update failed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [syncUserState]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    googleLogin,
    register,
    updateProfile,
    logout,
  };
};
