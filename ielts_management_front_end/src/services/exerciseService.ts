import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface ExerciseOptionPayload {
  id: string;
  text: string;
}

export interface ExerciseQuestionPayload {
  questionType: 'multipleChoice' | 'fillBlank' | 'essay' | 'speaking';
  questionText: string;
  explanation?: string;
  skill?: 'reading' | 'writing' | 'listening' | 'speaking';
  options?: ExerciseOptionPayload[];
  correctOptionId?: string;
  correctAnswers?: string[];
  isExactMatch?: boolean;
  minWords?: number;
  audioPromptUrl?: string;
  timeLimitSeconds?: number;
  audioUrl?: string;
  transcript?: string;
}

export interface CreateExercisePayload {
  title: string;
  description?: string;
  questions: ExerciseQuestionPayload[];
}

export interface ExerciseRecord {
  _id: string;
  videoId: string;
  courseId: string;
  title: string;
  description?: string;
  questions: ExerciseQuestionPayload[];
  createdAt?: string;
  updatedAt?: string;
}

class ExerciseService {
  async getVideoExercises(videoId: string): Promise<ApiResponse<ExerciseRecord[]>> {
    return apiClient.get<ExerciseRecord[]>(`/api/exercises/video/${videoId}`);
  }

  async createVideoExercise(
    videoId: string,
    payload: CreateExercisePayload
  ): Promise<ApiResponse<ExerciseRecord>> {
    return apiClient.post<ExerciseRecord>(`/api/exercises/video/${videoId}`, payload);
  }

  async updateExercise(
    exerciseId: string,
    payload: Partial<CreateExercisePayload>
  ): Promise<ApiResponse<ExerciseRecord>> {
    return apiClient.put<ExerciseRecord>(`/api/exercises/${exerciseId}`, payload);
  }

  async deleteExercise(exerciseId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/api/exercises/${exerciseId}`);
  }
}

export const exerciseService = new ExerciseService();
