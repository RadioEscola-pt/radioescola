/**
 * XP calculation constants and functions
 */

import type { AchievementRarity } from "@/lib/types/gamification";

export const XP_VALUES = {
  QUESTION_CORRECT: 5,
  QUESTION_INCORRECT: 1,
  EXAM_COMPLETED: 25,
  EXAM_PASSED: 50,
  FIRST_CATEGORY_PASS: 25,
  PERFECT_SCORE: 100,
  DAILY_GOAL: 15,
  DAILY_GOALS_ALL_BONUS: 30,
  FIRST_OF_DAY: 10,
  DAILY_STREAK_MULTIPLIER: 5,
  DAILY_STREAK_MAX: 50,
  SMART_PRACTICE_SESSION: 20,
} as const;

export const ACHIEVEMENT_XP: Record<AchievementRarity, number> = {
  common: 25,
  uncommon: 50,
  rare: 100,
  epic: 250,
  legendary: 500,
};

export interface ExamXPResult {
  total: number;
  breakdown: {
    completed: number;
    passed: number;
    firstCategoryPass: number;
    perfectScore: number;
  };
}

export function calculateExamXP(
  passed: boolean,
  isPerfect: boolean,
  isFirstCategoryPass: boolean
): ExamXPResult {
  const breakdown = {
    completed: XP_VALUES.EXAM_COMPLETED,
    passed: passed ? XP_VALUES.EXAM_PASSED : 0,
    firstCategoryPass: passed && isFirstCategoryPass ? XP_VALUES.FIRST_CATEGORY_PASS : 0,
    perfectScore: isPerfect ? XP_VALUES.PERFECT_SCORE : 0,
  };

  return {
    total: breakdown.completed + breakdown.passed + breakdown.firstCategoryPass + breakdown.perfectScore,
    breakdown,
  };
}

export function calculateDailyStreakBonus(streakDays: number): number {
  return Math.min(
    streakDays * XP_VALUES.DAILY_STREAK_MULTIPLIER,
    XP_VALUES.DAILY_STREAK_MAX
  );
}

export function calculateQuestionXP(correct: boolean): number {
  return correct ? XP_VALUES.QUESTION_CORRECT : XP_VALUES.QUESTION_INCORRECT;
}
