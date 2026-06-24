import { apiClient } from '@/utils/api';
import { ApiResponse, PlacementTest } from '@/types';

class PlacementTestService {
  /**
   * Bắt đầu một bài kiểm tra mới (ngẫu nhiên 15 câu)
   */
  async startTest(): Promise<ApiResponse<PlacementTest>> {
    return apiClient.post('/api/placement-tests/start');
  }

  /**
   * Nộp bài kiểm tra
   */
  async submitTest(
    testId: string, 
    answers: Array<{
      questionId: string;
      selectedOptionIds?: string[];
      audioSubmissionUrl?: string | null;
    }>
  ): Promise<ApiResponse<PlacementTest>> {
    return apiClient.post(`/api/placement-tests/${testId}/submit`, { answers });
  }

  /**
   * Lấy chi tiết một bài kiểm tra đã làm
   */
  async getTestDetails(testId: string): Promise<ApiResponse<PlacementTest>> {
    return apiClient.get(`/api/placement-tests/${testId}`);
  }

  /**
   * Chấm điểm phần thi Speaking bằng AI
   */
  async gradeSpeakingWithAI(testId: string): Promise<ApiResponse<PlacementTest>> {
    return apiClient.post(`/api/placement-tests/${testId}/grade-speaking`);
  }

  /**
   * Lấy lịch sử làm bài kiểm tra của user hiện tại
   */
  async getMyTests(): Promise<ApiResponse<PlacementTest[]>> {
    return apiClient.get('/api/placement-tests/my-tests');
  }
}

export const placementTestService = new PlacementTestService();
