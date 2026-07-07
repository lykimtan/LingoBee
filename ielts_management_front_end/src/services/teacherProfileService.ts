import { apiClient } from '@/utils/api';

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

export interface TeacherProfile {
  _id?: string;
  userId?: string;
  title: string;
  band: string;
  experienceYears: number;
  bio: string;
  teachingPhilosophy: string;
  highlights: string[];
  certificates: string[];
  socialLinks: SocialLinks;
  isFeatured: boolean;
}

export interface TeacherUserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface TeacherProfileResponse {
  user: TeacherUserData;
  profile: TeacherProfile;
}

export interface ShowcaseTeacher {
  id: string;
  name: string;
  title: string;
  band: string;
  bio: string;
  teachingPhilosophy: string;
  highlights: string[];
  certificates: string[];
  socialLinks: SocialLinks;
  image: string;
}

export const teacherProfileService = {
  async getMyProfile(): Promise<{ success: boolean; data?: TeacherProfileResponse; message?: string }> {
    try {
      const response = await apiClient.get<TeacherProfileResponse>('/api/users/teacher/my-profile');
      return {
        success: Boolean(response.success ?? true),
        data: response.data
      };
    } catch (error: any) {
      console.error('Error in getMyProfile:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Không thể tải hồ sơ giảng viên'
      };
    }
  },

  async updateMyProfile(payload: {
    name?: string;
    avatar?: string;
    phone?: string;
    title?: string;
    band?: string;
    experienceYears?: number;
    bio?: string;
    teachingPhilosophy?: string;
    highlights?: string[];
    certificates?: string[];
    socialLinks?: SocialLinks;
    isFeatured?: boolean;
  }): Promise<{ success: boolean; data?: TeacherProfileResponse; message?: string }> {
    try {
      const response = await apiClient.put<TeacherProfileResponse>('/api/users/teacher/my-profile', payload);
      return {
        success: Boolean(response.success ?? true),
        data: response.data,
        message: response.message || 'Cập nhật thành công'
      };
    } catch (error: any) {
      console.error('Error in updateMyProfile:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Cập nhật hồ sơ thất bại'
      };
    }
  },

  async getPublicShowcaseTeachers(): Promise<{ success: boolean; data?: ShowcaseTeacher[] }> {
    try {
      const response = await apiClient.get<ShowcaseTeacher[]>('/api/users/public/teachers-showcase');
      return {
        success: Boolean(response.success ?? true),
        data: response.data
      };
    } catch (error: any) {
      console.error('Error in getPublicShowcaseTeachers:', error);
      return {
        success: false
      };
    }
  }
};
