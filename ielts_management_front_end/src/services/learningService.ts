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

export interface AiPhonemeAssessment {
  phoneme: string;
  accuracyScore: number;
}

export interface AiSyllableAssessment {
  syllable: string;
  accuracyScore: number;
}

export interface AiWordAssessment {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes?: AiPhonemeAssessment[];
  syllables?: AiSyllableAssessment[];
}

export interface AiAssessment {
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  words: AiWordAssessment[];
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
  aiAssessment?: AiAssessment;
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

export interface VideoNote {
  _id: string;
  studentId: string;
  videoId: string;
  courseId: string;
  timestamp: number;
  content: string;
  createdAt: string;
  updatedAt: string;
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

  async submitExerciseAttempt(exerciseId: string, answers: any[]): Promise<ApiResponse<{ attempt: ExerciseAttempt; questions: ExerciseQuestion[] }>> {
    return apiClient.post<{ attempt: ExerciseAttempt; questions: ExerciseQuestion[] }>(`/api/learning/exercise/${exerciseId}/submit`, { answers });
  }

  async gradeSpeakingWithAI(exerciseId: string): Promise<ApiResponse<ExerciseAttempt>> {
    return apiClient.post<ExerciseAttempt>(`/api/learning/exercise/${exerciseId}/grade-ai`);
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

  // --- NOTES ---
  async getVideoNotes(videoId: string): Promise<ApiResponse<VideoNote[]>> {
    return apiClient.get<VideoNote[]>(`/api/notes/video/${videoId}`);
  }

  async createNote(data: { videoId: string; courseId: string; timestamp: number; content: string }): Promise<ApiResponse<VideoNote>> {
    return apiClient.post<VideoNote>(`/api/notes`, data);
  }

  async updateNote(noteId: string, content: string): Promise<ApiResponse<VideoNote>> {
    return apiClient.put<VideoNote>(`/api/notes/${noteId}`, { content });
  }

  async deleteNote(noteId: string): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/api/notes/${noteId}`);
  }
}

export const learningService = new LearningService();
