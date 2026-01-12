/**
 * Progress tracking types
 * Designed for localStorage-first with future database migration support
 */

export interface QuestionAttempt {
  questionId: number;
  category: string;
  correct: boolean;
  timestamp: number;
}

export interface ExamAttempt {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeSpent: number;
  passed: boolean;
  timestamp: number;
  questionIds: number[];
  answers: Record<number, number>;
}

export interface QuestionStats {
  attempts: number;
  correct: number;
  lastAttempt: number;
  lastCorrect: boolean;
}

export interface UserStats {
  totalExams: number;
  totalPassed: number;
  bestScores: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface UserProgress {
  version: number;
  lastUpdated: number;
  questionStats: Record<string, QuestionStats>;
  examHistory: ExamAttempt[];
  stats: UserStats;
}

export interface StorageProvider {
  getProgress(): Promise<UserProgress | null>;
  saveProgress(progress: UserProgress): Promise<void>;
  recordExamAttempt(attempt: ExamAttempt): Promise<void>;
  recordQuestionAttempt(attempt: QuestionAttempt): Promise<void>;
  clearProgress(): Promise<void>;
}

export const PROGRESS_VERSION = 1;

export function createEmptyProgress(): UserProgress {
  return {
    version: PROGRESS_VERSION,
    lastUpdated: Date.now(),
    questionStats: {},
    examHistory: [],
    stats: {
      totalExams: 0,
      totalPassed: 0,
      bestScores: {},
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    },
  };
}

export function getQuestionKey(category: string, questionId: number): string {
  return `cat${category}_${questionId}`;
}
