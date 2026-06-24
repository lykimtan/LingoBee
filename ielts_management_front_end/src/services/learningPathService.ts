import { apiClient } from '@/utils/api';

export interface LearningPathLesson {
  videoId: {
    _id: string;
    title: string;
    duration: number;
    thumbnailUrl?: string;
  };
  order: number;
  isCompleted: boolean;
  exercises: {
    exerciseId: {
      _id: string;
      title: string;
    };
    isCompleted: boolean;
    score: number;
  }[];
}

export interface LearningPathDay {
  day: number;
  date: string;
  deadline: string;
  lessons: LearningPathLesson[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface LearningPathData {
  _id: string;
  courseId: {
    _id: string;
    title: string;
  };
  studentId: string;
  preferences: {
    targetDate: string;
    availableDays: number[];
    hoursPerDay: number;
  };
  dailySchedule: LearningPathDay[];
  overallProgress: number;
}

export const learningPathService = {
  generatePath: async (payload: { courseId: string; targetDate: string; availableDays: number[]; hoursPerDay: number }) => {
    const response = await apiClient.post<LearningPathData>('/api/learning-paths/generate', payload);
    return response;
  },

  getPath: async (courseId: string) => {
    const response = await apiClient.get<LearningPathData>(`/api/learning-paths/${courseId}`);
    return response;
  }
};
