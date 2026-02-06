/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but recognized answer
 * 2 - Incorrect, but easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect recall
 */

import {
  type SpacedRepetitionStats,
  SM2_CONFIG,
  createInitialSRStats,
} from "@/lib/types/progress";

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Input {
  currentStats: SpacedRepetitionStats | undefined;
  quality: QualityRating;
}

export interface SM2Output {
  newStats: SpacedRepetitionStats;
  wasCorrect: boolean;
}

/**
 * Calculate new spaced repetition stats based on quality of recall
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality } = input;
  const current = input.currentStats ?? createInitialSRStats();

  const wasCorrect = quality >= 3;

  // Calculate new ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let newEaseFactor = Math.max(
    SM2_CONFIG.MIN_EASE_FACTOR,
    Math.min(SM2_CONFIG.MAX_EASE_FACTOR, current.easeFactor + efDelta)
  );

  let newInterval: number;
  let newRepetitionNumber: number;

  if (quality < 3) {
    // Failed recall - reset to beginning
    newInterval = 1;
    newRepetitionNumber = 1;
    // Keep ease factor from dropping too fast on failures
    newEaseFactor = Math.max(SM2_CONFIG.MIN_EASE_FACTOR, current.easeFactor - 0.2);
  } else {
    // Successful recall - increase interval
    newRepetitionNumber = current.repetitionNumber + 1;

    if (newRepetitionNumber === 1) {
      newInterval = 1;
    } else if (newRepetitionNumber === 2) {
      newInterval = 3;
    } else {
      // After 2nd successful review, multiply by ease factor
      newInterval = Math.round(current.interval * newEaseFactor);
    }

    // Bonus for perfect recall
    if (quality === 5) {
      newInterval = Math.round(newInterval * 1.1);
    }
  }

  // Cap maximum interval at 365 days
  newInterval = Math.min(newInterval, 365);

  const newStats: SpacedRepetitionStats = {
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate: Date.now() + newInterval * 24 * 60 * 60 * 1000,
    repetitionNumber: newRepetitionNumber,
  };

  return { newStats, wasCorrect };
}

/**
 * Check if a question is due for review
 */
export function isReviewDue(stats: SpacedRepetitionStats | undefined): boolean {
  if (!stats) return true; // New questions are always due
  return Date.now() >= stats.nextReviewDate;
}

/**
 * Get days until next review (negative if overdue)
 */
export function getDaysUntilReview(
  stats: SpacedRepetitionStats | undefined
): number {
  if (!stats) return 0;
  const msUntil = stats.nextReviewDate - Date.now();
  return Math.ceil(msUntil / (24 * 60 * 60 * 1000));
}

/**
 * Map user-friendly button labels to quality ratings
 */
export const QUALITY_LABELS = {
  again: 1 as QualityRating,   // Failed - show again soon
  hard: 3 as QualityRating,    // Correct but difficult
  good: 4 as QualityRating,    // Correct with some effort
  easy: 5 as QualityRating,    // Perfect recall
} as const;

/**
 * Get the predicted next interval for each quality rating
 * Useful for showing users what will happen with each choice
 */
export function getIntervalPreviews(
  currentStats: SpacedRepetitionStats | undefined
): Record<keyof typeof QUALITY_LABELS, number> {
  return {
    again: 1, // Always 1 day for failures
    hard: calculateSM2({ currentStats, quality: QUALITY_LABELS.hard }).newStats.interval,
    good: calculateSM2({ currentStats, quality: QUALITY_LABELS.good }).newStats.interval,
    easy: calculateSM2({ currentStats, quality: QUALITY_LABELS.easy }).newStats.interval,
  };
}
