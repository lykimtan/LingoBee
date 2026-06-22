import { apiClient } from "@/utils/api";

export interface VocabItem {
  word: string;
  translation: string;
  partOfSpeech: string;
  phonetic: string;
  example: string;
  synonyms?: string[];
}

export interface VisualVocabResult {
  _id: string;
  userId: string;
  imageUrl: string;
  vocabularies: VocabItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedHistoryResponse {
  data: VisualVocabResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const visualVocabService = {
  analyzeImage: async (file: File): Promise<VisualVocabResult> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.request<VisualVocabResult>('/api/visual-vocab/analyze', {
      method: 'POST',
      body: formData,
    });

    if (response.status === 'error') {
      throw new Error(response.message || 'Lỗi khi phân tích hình ảnh');
    }

    return response.data as VisualVocabResult;
  },

  saveVocabularies: async (imageUrl: string, vocabularies: VocabItem[]): Promise<VisualVocabResult> => {
    const response = await apiClient.request<VisualVocabResult>('/api/visual-vocab/save', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, vocabularies }),
    });

    if (response.status === 'error') {
      throw new Error(response.message || 'Lỗi khi lưu từ vựng');
    }

    return response.data as VisualVocabResult;
  },

  deleteVisualVocab: async (id: string): Promise<void> => {
    const response = await apiClient.request(`/api/visual-vocab/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 'error') {
      throw new Error(response.message || 'Lỗi khi xóa bản ghi');
    }
  },

  deleteVocabularyItem: async (id: string, word: string): Promise<VisualVocabResult> => {
    const response = await apiClient.request<VisualVocabResult>(`/api/visual-vocab/${id}/vocabularies/${encodeURIComponent(word)}`, {
      method: 'DELETE',
    });
    if (response.status === 'error') {
      throw new Error(response.message || 'Lỗi khi xóa từ vựng');
    }
    return response.data as VisualVocabResult;
  },

  getHistory: async (page: number = 1, limit: number = 8): Promise<PaginatedHistoryResponse> => {
    const response = await apiClient.get<any>(`/api/visual-vocab/history?page=${page}&limit=${limit}`);
    return {
      data: response.data || [],
      pagination: (response as any).pagination || { total: 0, page: 1, limit: 8, totalPages: 1 }
    };
  }
};
