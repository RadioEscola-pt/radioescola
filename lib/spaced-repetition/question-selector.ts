/**
 * Smart Practice Question Selector
 * Selects questions based on spaced repetition scheduling and performance
 */

import type { Question } from "@/lib/types";
import type { UserProgress, QuestionStats } from "@/lib/types/progress";
import { getQuestionKey } from "@/lib/types/progress";
import { isReviewDue, getDaysUntilReview } from "./sm2";

export type QuestionPriority = "due-now" | "new" | "due-soon" | "weak" | "later";

export interface QuestionWithPriority {
  question: Question;
  priority: QuestionPriority;
  daysUntilDue: number;
  successRate: number;
  attempts: number;
}

/**
 * Select questions for a smart practice session
 * Priority order: due-now > new > due-soon > weak > later
 */
export function selectQuestionsForReview(
  questions: Question[],
  progress: UserProgress | null,
  category: string,
  targetCount: number = 20
): QuestionWithPriority[] {
  const questionsWithPriority: QuestionWithPriority[] = [];

  for (const question of questions) {
    const key = getQuestionKey(category, question.id);
    const stats = progress?.questionStats[key];

    const priorityData = calculateQuestionPriority(stats);

    questionsWithPriority.push({
      question,
      priority: priorityData.priority,
      daysUntilDue: priorityData.daysUntilDue,
      successRate: priorityData.successRate,
      attempts: stats?.attempts ?? 0,
    });
  }

  // Sort by priority
  const priorityOrder: Record<QuestionPriority, number> = {
    "due-now": 0,
    "new": 1,
    "due-soon": 2,
    "weak": 3,
    "later": 4,
  };

  const sorted = questionsWithPriority.sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same priority, sort weak questions by success rate (lowest first)
    if (a.priority === "weak" || b.priority === "weak") {
      return a.successRate - b.successRate;
    }

    // For due questions, sort by how overdue (most overdue first)
    if (a.priority === "due-now" || a.priority === "due-soon") {
      return a.daysUntilDue - b.daysUntilDue;
    }

    return 0;
  });

  return sorted.slice(0, targetCount);
}

function calculateQuestionPriority(stats: QuestionStats | undefined): {
  priority: QuestionPriority;
  daysUntilDue: number;
  successRate: number;
} {
  // New question - never attempted
  if (!stats) {
    return {
      priority: "new",
      daysUntilDue: 0,
      successRate: 0,
    };
  }

  const successRate = stats.attempts > 0 ? stats.correct / stats.attempts : 0;

  // Has SR data
  if (stats.spacedRep) {
    const daysUntilDue = getDaysUntilReview(stats.spacedRep);

    if (daysUntilDue <= 0) {
      return { priority: "due-now", daysUntilDue, successRate };
    }
    if (daysUntilDue <= 3) {
      return { priority: "due-soon", daysUntilDue, successRate };
    }
    return { priority: "later", daysUntilDue, successRate };
  }

  // Legacy question without SR data - use success rate
  if (stats.attempts >= 2 && successRate < 0.6) {
    return { priority: "weak", daysUntilDue: 0, successRate };
  }

  // Check if it's been a while since last attempt (more than 7 days)
  const daysSinceAttempt = Math.floor(
    (Date.now() - stats.lastAttempt) / (24 * 60 * 60 * 1000)
  );
  if (daysSinceAttempt > 7) {
    return { priority: "due-soon", daysUntilDue: -daysSinceAttempt, successRate };
  }

  return { priority: "later", daysUntilDue: 7 - daysSinceAttempt, successRate };
}

/**
 * Get count of questions by priority for a category
 */
export function getQuestionCounts(
  questions: Question[],
  progress: UserProgress | null,
  category: string
): Record<QuestionPriority, number> {
  const counts: Record<QuestionPriority, number> = {
    "due-now": 0,
    "new": 0,
    "due-soon": 0,
    "weak": 0,
    "later": 0,
  };

  for (const question of questions) {
    const key = getQuestionKey(category, question.id);
    const stats = progress?.questionStats[key];
    const { priority } = calculateQuestionPriority(stats);
    counts[priority]++;
  }

  return counts;
}

/**
 * Get total questions due for review (due-now + due-soon)
 */
export function getDueCount(
  questions: Question[],
  progress: UserProgress | null,
  category: string
): number {
  const counts = getQuestionCounts(questions, progress, category);
  return counts["due-now"] + counts["due-soon"];
}
