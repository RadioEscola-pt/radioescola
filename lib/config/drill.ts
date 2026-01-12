/**
 * Drill mode configuration
 * Quick 10-question, 5-minute practice sessions
 */

export const DRILL_CONFIG = {
  /** Number of questions per drill session */
  QUESTION_COUNT: 10,
  /** Time limit in seconds (5 minutes) */
  DURATION_SECONDS: 300,
  /** XP awarded for completing a drill */
  XP_COMPLETION: 15,
  /** Bonus XP for perfect score (all correct) */
  XP_PERFECT: 25,
  /** Minimum correct answers to be considered a "pass" */
  PASS_THRESHOLD: 7,
} as const;

export type DrillResult = {
  questionsAnswered: number;
  correctAnswers: number;
  timeRemaining: number;
  isPerfect: boolean;
  passed: boolean;
};

export function calculateDrillResult(
  correctAnswers: number,
  totalQuestions: number,
  timeRemaining: number
): DrillResult {
  return {
    questionsAnswered: totalQuestions,
    correctAnswers,
    timeRemaining,
    isPerfect: correctAnswers === totalQuestions,
    passed: correctAnswers >= DRILL_CONFIG.PASS_THRESHOLD,
  };
}
