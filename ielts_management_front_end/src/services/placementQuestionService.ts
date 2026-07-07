import { apiClient } from '@/utils/api';
import { ApiResponse, PaginatedData, PlacementQuestion } from '@/types';

export interface QuestionPerformanceStats {
  multipleChoice: { totalAttempts: number; correctAttempts: number; accuracyRate: number };
  listeningChoice: { totalAttempts: number; correctAttempts: number; accuracyRate: number };
  speaking: { totalAttempts: number; totalScore: number; averageScore: number };
}

class PlacementQuestionService {
  private readonly baseUrl = '/api/placement-questions';

  async getPerformanceStats(): Promise<ApiResponse<QuestionPerformanceStats>> {
    return apiClient.get(`${this.baseUrl}/statistics/performance`);
  }

  async getQuestions(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    questionType?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedData<PlacementQuestion> | PlacementQuestion[]>> {
    let url = this.baseUrl;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return apiClient.get(url);
  }

  async getQuestionById(id: string): Promise<ApiResponse<PlacementQuestion>> {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  async createQuestion(data: Partial<PlacementQuestion>): Promise<ApiResponse<PlacementQuestion>> {
    return apiClient.post(this.baseUrl, data);
  }

  async updateQuestion(id: string, data: Partial<PlacementQuestion>): Promise<ApiResponse<PlacementQuestion>> {
    return apiClient.put(`${this.baseUrl}/${id}`, data);
  }

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const placementQuestionService = new PlacementQuestionService();
