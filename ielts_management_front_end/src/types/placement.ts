export type PlacementDifficulty = 'easy' | 'medium' | 'hard';
export type PlacementQuestionType = 'multipleChoice' | 'listeningChoice' | 'speaking';

export interface PlacementOption {
  id: string;
  text: string;
  _id?: string;
}

export interface PlacementQuestion {
  _id: string;
  questionText: string;
  difficulty: PlacementDifficulty;
  questionType: PlacementQuestionType;
  isActive: boolean;
  createdBy?: { _id: string; name: string; email: string; avatar?: string } | string;
  createdAt: string;
  updatedAt: string;

  // For multipleChoice & listeningChoice
  options?: PlacementOption[];
  correctOptionIds?: string[];

  // For listeningChoice
  audioUrl?: string;

  // For speaking
  audioPromptUrl?: string;
  timeLimitSeconds?: number;
}

export interface PlacementAnswer {
  questionId: string | PlacementQuestion;
  selectedOptionIds: string[];
  audioSubmissionUrl: string | null;
  score: number;
  aiAssessment?: any;
}

export interface PlacementTest {
  _id: string;
  studentId: string;
  questions: PlacementQuestion[];
  answers: PlacementAnswer[];
  timeLimitMinutes: number;
  status: 'in_progress' | 'completed' | 'graded';
  totalScore: number;
  overallFeedback: string;
  startedAt: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
