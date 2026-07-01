/**
 * Achievement definitions
 */

import type { Achievement, AchievementCategory } from "@/lib/types/gamification";
import { ACHIEVEMENT_XP, FAST_FINISH_SECONDS_REMAINING } from "./xp";

export const ACHIEVEMENTS: Achievement[] = [
  // ===== MILESTONE (5) =====
  {
    id: "first_exam",
    nameKey: "achievements.first_exam.name",
    descriptionKey: "achievements.first_exam.desc",
    icon: "FileCheck",
    category: "milestone",
    rarity: "common",
    xpReward: ACHIEVEMENT_XP.common,
    condition: { type: "exams_completed", count: 1 },
  },
  {
    id: "ten_exams",
    nameKey: "achievements.ten_exams.name",
    descriptionKey: "achievements.ten_exams.desc",
    icon: "Files",
    category: "milestone",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "exams_completed", count: 10 },
  },
  {
    id: "hundred_questions",
    nameKey: "achievements.hundred_questions.name",
    descriptionKey: "achievements.hundred_questions.desc",
    icon: "MessageSquare",
    category: "milestone",
    rarity: "common",
    xpReward: ACHIEVEMENT_XP.common,
    condition: { type: "questions_answered", count: 100 },
  },
  {
    id: "thousand_questions",
    nameKey: "achievements.thousand_questions.name",
    descriptionKey: "achievements.thousand_questions.desc",
    icon: "Sparkles",
    category: "milestone",
    rarity: "rare",
    xpReward: ACHIEVEMENT_XP.rare,
    condition: { type: "questions_answered", count: 1000 },
  },
  {
    id: "level_ten",
    nameKey: "achievements.level_ten.name",
    descriptionKey: "achievements.level_ten.desc",
    icon: "Medal",
    category: "milestone",
    rarity: "epic",
    xpReward: ACHIEVEMENT_XP.epic,
    condition: { type: "level_reached", level: 10 },
  },

  // ===== EXCELLENCE (5) =====
  {
    id: "first_pass",
    nameKey: "achievements.first_pass.name",
    descriptionKey: "achievements.first_pass.desc",
    icon: "CheckCircle",
    category: "excellence",
    rarity: "common",
    xpReward: ACHIEVEMENT_XP.common,
    condition: { type: "exams_passed", count: 1 },
  },
  {
    id: "perfect_exam",
    nameKey: "achievements.perfect_exam.name",
    descriptionKey: "achievements.perfect_exam.desc",
    icon: "Target",
    category: "excellence",
    rarity: "rare",
    xpReward: ACHIEVEMENT_XP.rare,
    condition: { type: "perfect_scores", count: 1 },
  },
  {
    id: "five_perfect",
    nameKey: "achievements.five_perfect.name",
    descriptionKey: "achievements.five_perfect.desc",
    icon: "Flame",
    category: "excellence",
    rarity: "epic",
    xpReward: ACHIEVEMENT_XP.epic,
    condition: { type: "perfect_scores", count: 5 },
  },
  {
    id: "speed_demon",
    nameKey: "achievements.speed_demon.name",
    descriptionKey: "achievements.speed_demon.desc",
    icon: "Zap",
    category: "excellence",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "fast_finish", secondsRemaining: FAST_FINISH_SECONDS_REMAINING },
  },
  {
    id: "comeback_kid",
    nameKey: "achievements.comeback_kid.name",
    descriptionKey: "achievements.comeback_kid.desc",
    icon: "TrendingUp",
    category: "excellence",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "comeback" },
    secret: true,
  },

  // ===== DEDICATION (5) =====
  {
    id: "week_streak",
    nameKey: "achievements.week_streak.name",
    descriptionKey: "achievements.week_streak.desc",
    icon: "Calendar",
    category: "dedication",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "streak_days", count: 7 },
  },
  {
    id: "month_streak",
    nameKey: "achievements.month_streak.name",
    descriptionKey: "achievements.month_streak.desc",
    icon: "CalendarCheck",
    category: "dedication",
    rarity: "epic",
    xpReward: ACHIEVEMENT_XP.epic,
    condition: { type: "streak_days", count: 30 },
  },
  {
    id: "daily_champion",
    nameKey: "achievements.daily_champion.name",
    descriptionKey: "achievements.daily_champion.desc",
    icon: "Sun",
    category: "dedication",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "daily_goal_sets_completed", count: 7 },
  },
  {
    id: "smart_learner",
    nameKey: "achievements.smart_learner.name",
    descriptionKey: "achievements.smart_learner.desc",
    icon: "Brain",
    category: "dedication",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "smart_practice_sessions", count: 10 },
  },
  {
    id: "iron_will",
    nameKey: "achievements.iron_will.name",
    descriptionKey: "achievements.iron_will.desc",
    icon: "Shield",
    category: "dedication",
    rarity: "legendary",
    xpReward: ACHIEVEMENT_XP.legendary,
    condition: { type: "streak_days", count: 100 },
    secret: true,
  },

  // ===== EXPLORATION (3) =====
  {
    id: "explorer",
    nameKey: "achievements.explorer.name",
    descriptionKey: "achievements.explorer.desc",
    icon: "Compass",
    category: "exploration",
    rarity: "uncommon",
    xpReward: ACHIEVEMENT_XP.uncommon,
    condition: { type: "all_categories_attempted" },
  },
  {
    id: "cat3_master",
    nameKey: "achievements.cat3_master.name",
    descriptionKey: "achievements.cat3_master.desc",
    icon: "Award",
    category: "exploration",
    rarity: "rare",
    xpReward: ACHIEVEMENT_XP.rare,
    condition: { type: "category_mastered", categoryId: "3" },
  },
  {
    id: "cat1_master",
    nameKey: "achievements.cat1_master.name",
    descriptionKey: "achievements.cat1_master.desc",
    icon: "Crown",
    category: "exploration",
    rarity: "epic",
    xpReward: ACHIEVEMENT_XP.epic,
    condition: { type: "category_mastered", categoryId: "1" },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getVisibleAchievements(unlockedIds: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.secret || unlockedIds.has(a.id));
}

export function getAchievementProgress(
  achievement: Achievement,
  stats: {
    totalExams: number;
    totalPassed: number;
    perfectScores: number;
    questionsAnswered: number;
    questionsCorrect: number;
    longestStreak: number;
    dailyGoalsCompleted: number;
    dailyGoalSetsCompleted: number;
    smartPracticeSessions: number;
    currentLevel: number;
    categoriesAttempted: string[];
  }
): { current: number; target: number; percentage: number } {
  const condition = achievement.condition;
  let current = 0;
  let target = 1;

  switch (condition.type) {
    case "exams_completed":
      current = stats.totalExams;
      target = condition.count;
      break;
    case "exams_passed":
      current = stats.totalPassed;
      target = condition.count;
      break;
    case "perfect_scores":
      current = stats.perfectScores;
      target = condition.count;
      break;
    case "questions_answered":
      current = stats.questionsAnswered;
      target = condition.count;
      break;
    case "questions_correct":
      current = stats.questionsCorrect;
      target = condition.count;
      break;
    case "streak_days":
      current = stats.longestStreak;
      target = condition.count;
      break;
    case "daily_goals_completed":
      current = stats.dailyGoalsCompleted;
      target = condition.count;
      break;
    case "daily_goal_sets_completed":
      current = stats.dailyGoalSetsCompleted;
      target = condition.count;
      break;
    case "smart_practice_sessions":
      current = stats.smartPracticeSessions;
      target = condition.count;
      break;
    case "level_reached":
      current = stats.currentLevel;
      target = condition.level;
      break;
    case "all_categories_attempted":
      current = stats.categoriesAttempted.length;
      target = 3;
      break;
    case "category_mastered":
    case "fast_finish":
    case "comeback":
      // Binary achievements - either done or not
      current = 0;
      target = 1;
      break;
  }

  return {
    current: Math.min(current, target),
    target,
    percentage: Math.min(100, Math.round((current / target) * 100)),
  };
}
