/**
 * Exam configuration constants
 * Centralizes all exam-related magic numbers and settings
 */
export const EXAM_CONFIG = {
  /** Total exam duration in seconds (1 hour) */
  DURATION_SECONDS: 3600,
  /** Number of questions displayed per page */
  QUESTIONS_PER_PAGE: 10,
  /** Maximum number of questions sampled for an exam */
  MAX_QUESTIONS: 40,
  /** Minimum score required to pass */
  PASSING_SCORE: 20,
  /** Penalty applied for each wrong answer */
  WRONG_ANSWER_PENALTY: 0.25,
} as const;

export type ExamConfig = typeof EXAM_CONFIG;
