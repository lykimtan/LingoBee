import { apiClient } from '@/utils/api';

export interface DictionaryMeaning {
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms?: string[];
}

export interface DictionaryResult {
  phonetic: string;
  audioUrl: string;
  meanings: DictionaryMeaning[];
  source?: string;
}

export const dictionaryService = {
  async fetchWordData(word: string): Promise<DictionaryResult> {
    const cleanWord = word.trim();
    if (!cleanWord) {
      throw new Error("Vui lòng nhập từ vựng cần tra cứu");
    }

    try {
      const res = await apiClient.get<DictionaryResult>(
        `/api/flashcards/dictionary/lookup?word=${encodeURIComponent(cleanWord)}`
      );

      if (res && (res.success || res.status === 'success') && res.data) {
        return res.data;
      }

      throw new Error(res.message || "Không nhận được phản hồi từ máy chủ");
    } catch (error: any) {
      console.error("Dictionary lookup error:", error);
      throw new Error(error.message || "Không thể tra cứu từ điển lúc này");
    }
  }
};
