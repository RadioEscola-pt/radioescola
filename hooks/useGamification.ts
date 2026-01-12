"use client";

import { useCallback, useMemo } from "react";
import type {
  GamificationState,
  GamificationResult,
  Achievement,
  Level,
  DailyProgress,
  UnlockedAchievement,
} from "@/lib/types/gamification";
import { createInitialGamificationState } from "@/lib/types/gamification";
import { getLevelForXP, getXPProgress, getXPToNextLevel, LEVELS } from "@/lib/gamification/levels";
import { ACHIEVEMENTS, getAchievementById, getVisibleAchievements, getAchievementProgress } from "@/lib/gamification/achievements";
import { ensureTodayProgress } from "@/lib/gamification/daily-goals";

export interface UseGamificationReturn {
  // State
  isEnabled: boolean;
  totalXP: number;
  currentLevel: Level;
  xpProgress: {
    currentXP: number;
    levelXP: number;
    requiredXP: number;
    percentage: number;
  };
  xpToNextLevel: number;
  unlockedAchievements: Achievement[];
  pendingNotifications: UnlockedAchievement[];
  dailyProgress: DailyProgress | null;
  dailyGoalStreak: number;

  // Computed
  allAchievements: Achievement[];
  visibleAchievements: Achievement[];
  achievementStats: {
    unlocked: number;
    total: number;
    percentage: number;
  };

  // Helpers
  getAchievementProgress: (achievementId: string) => {
    current: number;
    target: number;
    percentage: number;
  } | null;
  isAchievementUnlocked: (achievementId: string) => boolean;
}

export function useGamification(
  gamificationState: GamificationState | undefined | null
): UseGamificationReturn {
  const state = gamificationState ?? createInitialGamificationState();

  const isEnabled = state.settings.enabled;
  const totalXP = state.totalXP;
  const currentLevel = getLevelForXP(totalXP);
  const xpProgress = getXPProgress(totalXP);
  const xpToNextLevel = getXPToNextLevel(totalXP);

  const unlockedIds = useMemo(
    () => new Set(state.unlockedAchievements.map((ua) => ua.achievementId)),
    [state.unlockedAchievements]
  );

  const unlockedAchievements = useMemo(
    () =>
      state.unlockedAchievements
        .map((ua) => getAchievementById(ua.achievementId))
        .filter((a): a is Achievement => a !== undefined),
    [state.unlockedAchievements]
  );

  const pendingNotifications = useMemo(
    () => state.unlockedAchievements.filter((ua) => !ua.notified),
    [state.unlockedAchievements]
  );

  const dailyProgress = useMemo(
    () => (state.dailyProgress ? ensureTodayProgress(state.dailyProgress) : null),
    [state.dailyProgress]
  );

  const allAchievements = ACHIEVEMENTS;

  const visibleAchievements = useMemo(
    () => getVisibleAchievements(unlockedIds),
    [unlockedIds]
  );

  const achievementStats = useMemo(() => {
    const unlocked = state.unlockedAchievements.length;
    const total = ACHIEVEMENTS.length;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }, [state.unlockedAchievements.length]);

  const getAchievementProgressFn = useCallback(
    (achievementId: string) => {
      const achievement = getAchievementById(achievementId);
      if (!achievement) return null;

      return getAchievementProgress(achievement, {
        totalExams: 0, // These will be filled from progress context
        totalPassed: 0,
        perfectScores: state.lifetimeStats.perfectScores,
        questionsAnswered: state.lifetimeStats.questionsAnswered,
        questionsCorrect: state.lifetimeStats.questionsCorrect,
        longestStreak: 0,
        dailyGoalsCompleted: state.lifetimeStats.dailyGoalsCompleted,
        smartPracticeSessions: state.lifetimeStats.smartPracticeSessions,
        currentLevel: state.currentLevel,
        categoriesAttempted: state.lifetimeStats.categoriesAttempted,
      });
    },
    [state]
  );

  const isAchievementUnlocked = useCallback(
    (achievementId: string) => unlockedIds.has(achievementId),
    [unlockedIds]
  );

  return {
    isEnabled,
    totalXP,
    currentLevel,
    xpProgress,
    xpToNextLevel,
    unlockedAchievements,
    pendingNotifications,
    dailyProgress,
    dailyGoalStreak: state.dailyGoalStreak,
    allAchievements,
    visibleAchievements,
    achievementStats,
    getAchievementProgress: getAchievementProgressFn,
    isAchievementUnlocked,
  };
}
