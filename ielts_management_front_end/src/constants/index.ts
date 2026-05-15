/**
 * Application Constants
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const API_TIMEOUT = 30000; // 30 seconds

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  NOT_FOUND: '/404',
  ERROR: '/error',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const;
