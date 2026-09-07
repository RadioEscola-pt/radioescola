/**
 * Exam configuration constants
 * Centralizes all exam-related magic numbers and settings
 */
export const EXAM_CONFIG = {
  /** Total exam duration in seconds (1 hour) */
  DURATION_SECONDS: 3600,
  /**
   * Questions per page. Equal to MAX_QUESTIONS on purpose: the real ANACOM
   * exam puts all 40 on a single screen, so paginating the simulation would
   * drill a rhythm the exam room does not have. The pagination code stays —
   * it is still correct for any other value — but the control hides itself
   * when this leaves only one page.
   */
  QUESTIONS_PER_PAGE: 40,
  /** Maximum number of questions sampled for an exam */
  MAX_QUESTIONS: 40,
  /** Minimum score required to pass */
  PASSING_SCORE: 20,
  /** Penalty applied for each wrong answer */
  WRONG_ANSWER_PENALTY: 0.25,
} as const;

export type ExamConfig = typeof EXAM_CONFIG;
