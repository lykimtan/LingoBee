import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface FlashcardDeck {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  courseId?: string;
  videoId?: string;
  creatorId: string;
  isPublic: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  cardsCount?: number;
  learnedCount?: number;
  dueCount?: number;
  memorizedCount?: number;
}

export interface Flashcard {
  _id: string;
  deckId: string;
  frontText: string;
  backText: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  imageUrl?: string;
  audioUrl?: string;
  phonetic?: string;
  synonyms?: string[];
  order: number;
}

export interface ReviewSubmitResponse {
  _id: string;
  studentId: string;
  flashcardId: string;
  deckId: string;
  status: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewedAt: string;
}

export interface FlashcardStreak {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

export interface GetDecksResponse {
  data: FlashcardDeck[];
  streak: FlashcardStreak;
}

export interface SubmitReviewResponse {
  data: ReviewSubmitResponse;
  streak: FlashcardStreak;
}

const flashcardService = {
  // --- Deck API ---
  getDecks: async (params?: { courseId?: string; videoId?: string; isPublic?: boolean }): Promise<ApiResponse<FlashcardDeck[]> & { streak?: FlashcardStreak }> => {
    let url = '/api/flashcards/decks';
    if (params) {
      const query = new URLSearchParams();
      if (params.courseId) query.append('courseId', params.courseId);
      if (params.videoId) query.append('videoId', params.videoId);
      if (params.isPublic !== undefined) query.append('isPublic', String(params.isPublic));
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get<FlashcardDeck[] & { streak?: FlashcardStreak }>(url);
  },

  getDeckById: async (deckId: string): Promise<ApiResponse<FlashcardDeck>> => {
    return apiClient.get<FlashcardDeck>(`/api/flashcards/decks/${deckId}`);
  },

  createDeck: async (deckData: Partial<FlashcardDeck>): Promise<ApiResponse<FlashcardDeck>> => {
    return apiClient.post<FlashcardDeck>('/api/flashcards/decks', deckData);
  },

  deleteDeck: async (deckId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/api/flashcards/decks/${deckId}`);
  },

  // --- Flashcard API ---
  getCardsInDeck: async (deckId: string): Promise<ApiResponse<Flashcard[]>> => {
    return apiClient.get<Flashcard[]>(`/api/flashcards/decks/${deckId}/cards`);
  },

  createCard: async (deckId: string, cardData: Partial<Flashcard>): Promise<ApiResponse<Flashcard>> => {
    return apiClient.post<Flashcard>(`/api/flashcards/decks/${deckId}/cards`, cardData);
  },

  updateDeck: async (deckId: string, updates: Partial<FlashcardDeck>): Promise<ApiResponse<FlashcardDeck>> => {
    return apiClient.put<FlashcardDeck>(`/api/flashcards/decks/${deckId}`, updates);
  },

  updateCard: async (cardId: string, updates: Partial<Flashcard>): Promise<ApiResponse<Flashcard>> => {
    return apiClient.put<Flashcard>(`/api/flashcards/cards/${cardId}`, updates);
  },

  deleteCard: async (cardId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/api/flashcards/cards/${cardId}`);
  },

  // --- Study/SRS API ---
  getDueCards: async (deckId: string): Promise<ApiResponse<Flashcard[]>> => {
    return apiClient.get<Flashcard[]>(`/api/flashcards/decks/${deckId}/study`);
  },

  submitReview: async (flashcardId: string, quality: 0 | 1 | 2): Promise<ApiResponse<ReviewSubmitResponse> & { streak?: FlashcardStreak }> => {
    return apiClient.post<ReviewSubmitResponse & { streak?: FlashcardStreak }>(`/api/flashcards/cards/${flashcardId}/review`, { quality });
  }
};

export default flashcardService;
