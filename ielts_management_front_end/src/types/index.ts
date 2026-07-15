/**
 * Global Types and Interfaces
 */


// User related types
export interface User {
  id: string;
  googleId?: string | null;
  hasPassword?: boolean;
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
  pagination?: any;
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
export type UploadResourceType = 'image' | 'video' | 'raw';

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string | null;
  folder: 'avatars' | 'videos' | 'thumbnails' | 'materials';
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

export type CourseVideo = {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl?: string;
  materialUrl?: string;
  materialName?: string;
  order: number;
  skills?: string[];
  isPublished?: boolean;
  isMandatory?: boolean;
  exercises?: Exercise[];
  createdAt?: string;
  updatedAt?: string;
};

export type Exercise = {
  _id: string;
  videoId?: string;
  courseId: string;
  title: string;
  description?: string;
  //eslint-disable-next-line
  questions?: any[];
  createdAt?: string;
  updatedAt?: string;
};

export type TeacherCourseItem = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  status: string;
  totalStudents?: number;
  totalVideos?: number;
  durationInHours?: number;
  createdAt?: string;
  updatedAt?: string;
  publicInfo?: {
    thumbnail?: string | null;
  };
};


export type TeacherInvitation = {
  _id: string;
  status: string;
  role?: string;
  message?: string;
  course?: {
    _id: string;
    title: string;
    category?: string;
    level?: string;
    status?: string;
  };
  invitedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
};


export type CourseSummary = {
  _id: string;
  title: string;
  slug: string;
};

export type CourseUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
};

export type AdminCourseItem = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  status?: string;
  totalStudents?: number;
  averageRating?: number;
  totalReviews?: number;
  totalVideos?: number;
  slug?: string;
  teacher?: CourseUser | null;
  publicInfo?: {
    thumbnail?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
  priceTiers?: {
    name: string;
    price: number;
    description?: string;
    features?: string[];
  }[];
};


export type NotificationItem = {
  _id?: string;
  id?: string;
  notificationType?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  actionUrl?: string | null;
  isRead?: boolean;
  recipientUser?: string | null;
};

// Chat related types
export interface ChatAttachment {
  url: string;
  fileType: string;
  fileName: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User | string;
  senderRole: string;
  message: string;
  attachments?: ChatAttachment[];
  replyToMessageId?: Message | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: User | string;
  role: string;
  lastReadMessageId?: string | null;
}

export interface Conversation {
  _id: string;
  type: 'group' | 'private';
  courseId: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  updatedAt: string;
}

export * from './placement';