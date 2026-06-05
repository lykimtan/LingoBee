import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface VideoProgress {
  currentTime: number;
  duration: number;
  progressPercentage: number;
  isCompleted: boolean;
  canAccessNextVideo: boolean;
}

export interface LearningVideo {
  _id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl?: string;
  order: number;
  progress: VideoProgress | null;
  exercises?: any[];
}

export interface CourseLearningData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    totalVideos: number;
  };
  videos: LearningVideo[];
}

export interface VideoResources {
  materialUrl: string;
  materialName: string;
  exercises: any[]; // Or define proper interface for Exercise if available
}

export interface ExerciseQuestion {
  _id: string;
  questionText: string;
  questionType: 'multipleChoice' | 'fillBlank' | 'essay' | 'speaking';
  options?: { id: string; text: string }[];
  explanation?: string;
  correctOptionId?: string;
  correctAnswers?: string[];
  skill?: string;
  audioUrl?: string;
  transcript?: string;
  minWords?: number;
}

export interface ExerciseAttemptAnswer {
  questionId: string;
  questionType: string;
  selectedOptionId?: string | null;
  blankAnswers?: string[];
  essayAnswer?: string;
  audioRecordUrl?: string | null;
  audioPublicId?: string | null;
  isCorrect?: boolean | null;
  score?: number;
  teacherFeedback?: string;
}

export interface ExerciseAttempt {
  _id: string;
  studentId: string;
  exerciseId: string;
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: ExerciseAttemptAnswer[];
  totalScore: number;
  gradedBy?: { name: string; avatar?: string };
}

export interface ExerciseStudentData {
  exercise: {
    _id: string;
    title: string;
    description: string;
    questions: ExerciseQuestion[];
  };
  attempt: ExerciseAttempt | null;
}

class LearningService {
  async getCourseLearningData(slug: string): Promise<ApiResponse<CourseLearningData>> {
    return apiClient.get<CourseLearningData>(`/api/learning/course/${slug}`);
  }

  async updateVideoProgress(
    videoId: string, 
    payload: { currentTime?: number; isCompleted?: boolean; duration?: number }
  ): Promise<ApiResponse<VideoProgress>> {
    return apiClient.put<VideoProgress>(`/api/learning/video/${videoId}/progress`, payload);
  }

  async getVideoResources(videoId: string): Promise<ApiResponse<VideoResources>> {
    return apiClient.get<VideoResources>(`/api/learning/video/${videoId}/resources`);
  }

  async getExerciseForStudent(exerciseId: string): Promise<ApiResponse<ExerciseStudentData>> {
    return apiClient.get<ExerciseStudentData>(`/api/learning/exercise/${exerciseId}`);
  }

  async saveExerciseProgress(exerciseId: string, answers: any[]): Promise<ApiResponse<ExerciseAttempt>> {
    return apiClient.put<ExerciseAttempt>(`/api/learning/exercise/${exerciseId}/progress`, { answers });
  }

  async submitExerciseAttempt(exerciseId: string, answers: any[]): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/learning/exercise/${exerciseId}/submit`, { answers });
  }

  async getGradingQueue(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/learning/teacher/grading-queue`);
  }

  async getAttemptDetailForGrading(attemptId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/learning/teacher/attempts/${attemptId}`);
  }

  async gradeExerciseAttempt(attemptId: string, answers: any[], gradeNote: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/learning/teacher/attempts/${attemptId}/grade`, { answers, gradeNote });
  }
}

export const learningService = new LearningService();
