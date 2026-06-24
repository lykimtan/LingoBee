/**
 * API client utilities
 */

import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@/constants';
import { ApiErrorItem, ApiResponse } from '@/types';

type BackendPayload<T> = {
  success?: boolean;
  status?: 'success' | 'error';
  data?: T;
  message?: string;
  code?: number;
  errors?: Array<{ field?: string; message?: string; help?: string | null }>;
};

const extractErrorMessage = (payload: unknown, fallbackMessage: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallbackMessage;
  }

  const typedPayload = payload as {
    message?: unknown;
    errors?: unknown;
  };

  if (Array.isArray(typedPayload.errors) && typedPayload.errors.length > 0) {
    const detailMessages = typedPayload.errors
      .map((errorItem) => {
        if (!errorItem || typeof errorItem !== 'object') {
          return null;
        }
        const message = (errorItem as { message?: unknown }).message;
        return typeof message === 'string' ? message : null;
      })
      .filter((message): message is string => Boolean(message));

    if (detailMessages.length > 0) {
      const baseMessage =
        typeof typedPayload.message === 'string' && typedPayload.message.trim().length > 0
          ? typedPayload.message
          : 'Request failed';
      return `${baseMessage}: ${detailMessages.join(', ')}`;
    }
  }

  if (typeof typedPayload.message === 'string' && typedPayload.message.trim().length > 0) {
    return typedPayload.message;
  }

  return fallbackMessage;
};

const normalizeErrors = (
  errors: BackendPayload<unknown>['errors']
): ApiErrorItem[] | undefined => {
  if (!Array.isArray(errors)) {
    return undefined;
  }

  const normalized = errors
    .map((errorItem) => {
      if (!errorItem || typeof errorItem !== 'object') {
        return null;
      }

      if (typeof errorItem.message !== 'string' || errorItem.message.trim().length === 0) {
        return null;
      }

      return {
        field: errorItem.field,
        message: errorItem.message,
        help: errorItem.help,
      } as ApiErrorItem;
    })
    .filter((errorItem): errorItem is ApiErrorItem => Boolean(errorItem));

  return normalized.length > 0 ? normalized : undefined;
};

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getStoredTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    storage: 'local' | 'session' | 'none';
  } {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null, storage: 'none' };
    }

    const readFromStorage = (storage: Storage) => ({
      accessToken: storage.getItem(STORAGE_KEYS.USER_TOKEN),
      refreshToken: storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    });

    const localTokens = readFromStorage(localStorage);
    if (localTokens.accessToken || localTokens.refreshToken) {
      return { ...localTokens, storage: 'local' };
    }

    const sessionTokens = readFromStorage(sessionStorage);
    if (sessionTokens.accessToken || sessionTokens.refreshToken) {
      return { ...sessionTokens, storage: 'session' };
    }

    return { accessToken: null, refreshToken: null, storage: 'none' };
  }

  private storeTokens(
    accessToken: string,
    refreshToken?: string | null,
    storage: 'local' | 'session' | 'none' = 'local'
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    const targetStorage = storage === 'session' ? sessionStorage : localStorage;
    targetStorage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken);
    if (refreshToken) {
      targetStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  private clearTokens() {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private buildHeaders(tokenOverride?: string | null, isFormData: boolean = false): HeadersInit {
    const { accessToken } = this.getStoredTokens();
    const token = tokenOverride ?? accessToken;
    
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const { refreshToken, storage } = this.getStoredTokens();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const payload = (await response.json()) as BackendPayload<{ accessToken?: string; refreshToken?: string }>;
      const data = payload?.data;

      if (!data?.accessToken) {
        return null;
      }

      this.storeTokens(data.accessToken, data.refreshToken || refreshToken, storage);
      return data.accessToken;
    } catch {
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attemptedRefresh: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const isFormData = options.body instanceof FormData;
      
      const response = await fetch(url, {
        ...options,
        headers: this.buildHeaders(undefined, isFormData),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let payload: unknown = null;

      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else if (contentType.includes('text/')) {
        payload = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401 && !attemptedRefresh) {
          const refreshedToken = await this.refreshAccessToken();
          if (refreshedToken) {
            return this.request<T>(
              endpoint,
              {
                ...options,
                headers: this.buildHeaders(refreshedToken, isFormData),
              },
              true
            );
          }
        }

        const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
        return {
          status: 'error',
          message: extractErrorMessage(payload, fallbackMessage),
          code: response.status,
          errors: normalizeErrors(
            payload && typeof payload === 'object'
              ? (payload as BackendPayload<T>).errors
              : undefined
          ),
        };
      }

      if (payload && typeof payload === 'object') {
        const responsePayload = payload as BackendPayload<T>;

        if (typeof responsePayload.status === 'string') {
          return {
            ...responsePayload,
            status: responsePayload.status,
            data: responsePayload.data,
            message: responsePayload.message || '',
            code: typeof responsePayload.code === 'number' ? responsePayload.code : response.status,
            errors: normalizeErrors(responsePayload.errors),
            success: responsePayload.success,
          };
        }

        if (typeof responsePayload.success === 'boolean') {
          return {
            ...responsePayload,
            status: responsePayload.success ? 'success' : 'error',
            data: responsePayload.data,
            message:
              responsePayload.message ||
              (responsePayload.success ? 'Request successful' : 'Request failed'),
            code: typeof responsePayload.code === 'number' ? responsePayload.code : response.status,
            errors: normalizeErrors(responsePayload.errors),
            success: responsePayload.success,
          };
        }
      }

      if (typeof payload === 'string') {
        return {
          status: 'success',
          message: payload,
          code: response.status,
        };
      }

      return {
        status: 'success',
        data: payload as T,
        message: 'Request successful',
        code: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
