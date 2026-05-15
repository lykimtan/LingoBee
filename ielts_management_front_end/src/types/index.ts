/**
 * Global Types and Interfaces
 */

// User related types
export interface User {
  id: string;
  googleId?: string | null;
  email: string;
  name: string;
  role: 'guest' | 'student' | 'teacher' | 'staff' | 'admin';
  avatar?: string | null;
  createdAt: string;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
  help?: string | null;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message: string;
  code: number;
  errors?: ApiErrorItem[];
  success?: boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Cloudinary upload types
export type UploadResourceType = 'image' | 'video';

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string | null;
  folder: 'avatars' | 'videos' | 'thumbnails';
  resourceType: UploadResourceType;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: UploadResourceType;
  format?: string;
  bytes?: number;
  duration?: number;
  width?: number;
  height?: number;
}
