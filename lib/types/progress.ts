/**
 * Progress tracking types
 * Designed for localStorage-first with future database migration support
 */

import type { GamificationState } from "./gamification";
import { createInitialGamificationState } from "./gamification";

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

export interface SpacedRepetitionStats {
  interval: number;           // Days until next review
  easeFactor: number;         // Difficulty multiplier (1.3-2.5)
  nextReviewDate: number;     // Unix timestamp when to show next
  repetitionNumber: number;   // Which rep in sequence (1st, 2nd, 3rd...)
}

export interface QuestionStats {
  attempts: number;
  correct: number;
  lastAttempt: number;
  lastCorrect: boolean;
  spacedRep?: SpacedRepetitionStats;  // Optional for backward compatibility
  // Bookmark feature (v4)
  bookmarked?: boolean;
  notes?: string;
  bookmarkedAt?: number;
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
  gamification?: GamificationState;  // Optional for V3+, added via migration
}

export interface StorageProvider {
  getProgress(): Promise<UserProgress | null>;
  saveProgress(progress: UserProgress): Promise<void>;
  recordExamAttempt(attempt: ExamAttempt): Promise<void>;
  recordQuestionAttempt(attempt: QuestionAttempt): Promise<void>;
  clearProgress(): Promise<void>;
}

export const PROGRESS_VERSION = 3;

// SM-2 Algorithm Constants
export const SM2_CONFIG = {
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  INITIAL_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,
} as const;

export function createInitialSRStats(): SpacedRepetitionStats {
  return {
    interval: SM2_CONFIG.INITIAL_INTERVAL,
    easeFactor: SM2_CONFIG.INITIAL_EASE_FACTOR,
    nextReviewDate: Date.now(),  // Due immediately for new questions
    repetitionNumber: 0,
  };
}

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
    gamification: createInitialGamificationState(),
  };
}

export function getQuestionKey(category: string, questionId: number): string {
  return `cat${category}_${questionId}`;
}
