/**
 * Daily goals system
 */

import type { DailyGoal, DailyProgress, DailyGoalType } from "@/lib/types/gamification";
import { XP_VALUES } from "./xp";

interface GoalTemplate {
  type: DailyGoalType;
  targets: number[];
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  { type: "questions_answered", targets: [10, 15, 20, 25] },
  { type: "questions_correct", targets: [5, 8, 10, 15] },
  { type: "exams_taken", targets: [1, 2] },
  { type: "smart_practice_questions", targets: [10, 15, 20] },
];

/**
 * Simple seeded random number generator for consistent daily goals
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Generate daily goals based on date
 */
export function generateDailyGoals(date: string): DailyGoal[] {
  // Use date as seed for consistent goals throughout the day
  const parts = date.split("-").map(Number);
  const seed = parts.reduce((a, b) => a * 100 + b, 0);
  const random = seededRandom(seed);

  // Shuffle templates
  const shuffled = [...GOAL_TEMPLATES].sort(() => random() - 0.5);

  // Pick first 3
  return shuffled.slice(0, 3).map((template, index) => {
    const targets = template.targets;
    const targetIndex = Math.floor(random() * targets.length);
    const target = targets[targetIndex] ?? targets[0] ?? 10;

    return {
      id: `${date}-${index}`,
      type: template.type,
      target,
      xpReward: XP_VALUES.DAILY_GOAL,
    };
  });
}

/**
 * Create a new daily progress object for today
 */
export function createDailyProgress(date: string): DailyProgress {
  return {
    date,
    goals: generateDailyGoals(date),
    progress: {},
    completed: [],
    bonusClaimed: false,
  };
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/**
 * Update daily progress for a specific goal type
 */
export function updateDailyGoalProgress(
  daily: DailyProgress,
  goalType: DailyGoalType,
  increment: number = 1
): { updated: DailyProgress; newlyCompleted: DailyGoal[] } {
  const newProgress = { ...daily.progress };
  const newlyCompleted: DailyGoal[] = [];

  for (const goal of daily.goals) {
    if (goal.type === goalType && !daily.completed.includes(goal.id)) {
      const current = (newProgress[goal.id] ?? 0) + increment;
      newProgress[goal.id] = current;

      if (current >= goal.target) {
        newlyCompleted.push(goal);
      }
    }
  }

  return {
    updated: {
      ...daily,
      progress: newProgress,
      completed: [...daily.completed, ...newlyCompleted.map((g) => g.id)],
    },
    newlyCompleted,
  };
}

/**
 * Check if all daily goals are complete
 */
export function areAllDailyGoalsComplete(daily: DailyProgress): boolean {
  return daily.completed.length >= daily.goals.length;
}

/**
 * Get translation key for goal type
 */
export function getDailyGoalLabelKey(type: DailyGoalType): string {
  const labels: Record<DailyGoalType, string> = {
    questions_answered: "dailyGoals.questionsAnswered",
    questions_correct: "dailyGoals.questionsCorrect",
    exams_taken: "dailyGoals.examsTaken",
    smart_practice_questions: "dailyGoals.smartPractice",
  };
  return labels[type];
}

/**
 * Ensure daily progress is for today, create new if needed
 */
export function ensureTodayProgress(
  current: DailyProgress | null
): DailyProgress {
  const today = getTodayDateString();
  if (current && current.date === today) {
    return current;
  }
  return createDailyProgress(today);
}
