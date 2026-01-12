/**
 * Gamification system types
 * XP, Levels, Achievements, and Daily Goals
 */

// ============ XP & LEVELS ============

export type XPEventType =
  | "exam_completed"
  | "exam_passed"
  | "perfect_score"
  | "question_correct"
  | "question_incorrect"
  | "daily_goal"
  | "daily_goals_all_bonus"
  | "daily_streak_bonus"
  | "achievement_unlocked"
  | "first_of_day"
  | "smart_practice_session";

export interface XPEvent {
  type: XPEventType;
  amount: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface Level {
  level: number;
  name: string;
  nameKey: string;
  minXP: number;
  maxXP: number;
  icon: string;
}

// ============ ACHIEVEMENTS ============

export type AchievementCategory =
  | "milestone"
  | "excellence"
  | "dedication"
  | "exploration";

export type AchievementRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type AchievementCondition =
  | { type: "exams_completed"; count: number }
  | { type: "exams_passed"; count: number }
  | { type: "perfect_scores"; count: number }
  | { type: "questions_answered"; count: number }
  | { type: "questions_correct"; count: number }
  | { type: "streak_days"; count: number }
  | { type: "category_mastered"; categoryId: string }
  | { type: "all_categories_attempted" }
  | { type: "smart_practice_sessions"; count: number }
  | { type: "xp_total"; amount: number }
  | { type: "level_reached"; level: number }
  | { type: "daily_goals_completed"; count: number }
  | { type: "fast_finish"; secondsRemaining: number }
  | { type: "comeback" };

export interface Achievement {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  condition: AchievementCondition;
  secret?: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
  notified: boolean;
}

// ============ DAILY GOALS ============

export type DailyGoalType =
  | "questions_answered"
  | "questions_correct"
  | "exams_taken"
  | "smart_practice_questions";

export interface DailyGoal {
  id: string;
  type: DailyGoalType;
  target: number;
  xpReward: number;
}

export interface DailyProgress {
  date: string;
  goals: DailyGoal[];
  progress: Record<string, number>;
  completed: string[];
  bonusClaimed: boolean;
}

// ============ LIFETIME STATS ============

export interface LifetimeStats {
  questionsAnswered: number;
  questionsCorrect: number;
  perfectScores: number;
  smartPracticeSessions: number;
  dailyGoalsCompleted: number;
  fastFinishes: number;
  comebacks: number;
  categoriesAttempted: string[];
}

// ============ GAMIFICATION STATE ============

export interface GamificationSettings {
  enabled: boolean;  // Master toggle for gamification
}

export interface GamificationState {
  settings: GamificationSettings;
  totalXP: number;
  currentLevel: number;
  xpHistory: XPEvent[];
  unlockedAchievements: UnlockedAchievement[];
  achievementProgress: Record<string, number>;
  dailyProgress: DailyProgress | null;
  dailyGoalStreak: number;
  lifetimeStats: LifetimeStats;
  lastActivityDate: string | null;
}

// ============ GAMIFICATION RESULT ============

export interface GamificationResult {
  xpGained: number;
  xpEvents: XPEvent[];
  newAchievements: Achievement[];
  levelUp: boolean;
  previousLevel: number;
  newLevel: number;
  dailyGoalsCompleted: DailyGoal[];
  allDailyGoalsComplete: boolean;
}

// ============ FACTORY FUNCTIONS ============

export function createInitialLifetimeStats(): LifetimeStats {
  return {
    questionsAnswered: 0,
    questionsCorrect: 0,
    perfectScores: 0,
    smartPracticeSessions: 0,
    dailyGoalsCompleted: 0,
    fastFinishes: 0,
    comebacks: 0,
    categoriesAttempted: [],
  };
}

export function createDefaultGamificationSettings(): GamificationSettings {
  return {
    enabled: true,
  };
}

export function createInitialGamificationState(): GamificationState {
  return {
    settings: createDefaultGamificationSettings(),
    totalXP: 0,
    currentLevel: 1,
    xpHistory: [],
    unlockedAchievements: [],
    achievementProgress: {},
    dailyProgress: null,
    dailyGoalStreak: 0,
    lifetimeStats: createInitialLifetimeStats(),
    lastActivityDate: null,
  };
}
