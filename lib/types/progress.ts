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

/**
 * Lifetime rollup of exams trimmed out of `examHistory` by EXAM_HISTORY_LIMIT.
 * Keeps the totals honest once the cap starts biting; the individual attempts
 * are gone. Absent until the first trim.
 */
export interface ArchivedExams {
  count: number;
  passed: number;
  bestScores: Record<string, number>;
}

export interface UserProgress {
  version: number;
  lastUpdated: number;
  questionStats: Record<string, QuestionStats>;
  examHistory: ExamAttempt[];
  /**
   * Every local calendar day (YYYY-MM-DD) the user studied, sorted and unique.
   * Streaks are derived from this set (see `lib/streaks.ts`) rather than
   * incremented in place, because a counter cannot be merged across devices
   * and cannot be recomputed once it drifts. Added in V5.
   */
  activeDays: string[];
  /** Rollup of exams the history cap dropped. Absent until it first bites. */
  archivedExams?: ArchivedExams;
  stats: UserStats;
  gamification?: GamificationState;  // Optional for V3+, added via migration
}

export interface StorageProvider {
  getProgress(): Promise<UserProgress | null>;
  saveProgress(progress: UserProgress): Promise<void>;
  recordExamAttempt(attempt: ExamAttempt): Promise<void>;
  recordQuestionAttempt(attempt: QuestionAttempt): Promise<void>;
  clearProgress(): Promise<void>;
  /**
   * Atomically merge a new gamification state into the persisted progress:
   * re-reads the latest stored progress, replaces only `gamification`, and
   * saves. Prevents a stale in-memory snapshot from clobbering exam/question
   * writes that landed after it was read. Returns the merged progress (or null
   * if there is nothing stored to merge into).
   */
  updateGamification(newState: GamificationState): Promise<UserProgress | null>;
}

export const PROGRESS_VERSION = 5;

/**
 * How many individual exam attempts `examHistory` keeps. Older attempts are
 * folded into `archivedExams`. Without a bound the array grows until
 * `localStorage.setItem` throws QuotaExceededError and every later write fails.
 */
export const EXAM_HISTORY_LIMIT = 300;

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
    activeDays: [],
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
