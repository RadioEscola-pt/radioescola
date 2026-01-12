"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useProgress } from "@/hooks/useProgress";
import type {
  UserProgress,
  ExamAttempt,
  QuestionAttempt,
  QuestionStats,
  SpacedRepetitionStats,
} from "@/lib/types/progress";
import type {
  GamificationState,
  GamificationResult,
  Achievement,
} from "@/lib/types/gamification";
import {
  processExamComplete,
  processQuestionAnswered,
  processSmartPracticeSession,
  toggleGamification,
  markAchievementsNotified,
} from "@/lib/gamification/engine";
import { useGamification, type UseGamificationReturn } from "@/hooks/useGamification";

type ProgressContextType = {
  progress: UserProgress | null;
  isLoading: boolean;
  recordExam: (attempt: ExamAttempt) => Promise<void>;
  recordQuestion: (attempt: QuestionAttempt) => Promise<void>;
  recordQuestionBatch: (attempts: QuestionAttempt[]) => Promise<void>;
  recordQuestionWithSR: (
    category: string,
    questionId: number,
    srStats: SpacedRepetitionStats,
    wasCorrect: boolean
  ) => Promise<void>;
  getQuestionStats: (
    category: string,
    questionId: number
  ) => QuestionStats | null;
  getBestScore: (category: string) => number | null;
  getStreak: () => { current: number; longest: number };
  getWeakQuestions: (
    minAttempts?: number
  ) => Array<{ key: string; stats: QuestionStats; successRate: number }>;
  getCategoryProgress: (
    category: string,
    totalQuestions: number
  ) => { mastered: number; attempted: number; masteryRate: number };
  clearProgress: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  // Gamification
  gamification: UseGamificationReturn;
  lastGamificationResult: GamificationResult | null;
  recordExamWithGamification: (
    attempt: ExamAttempt,
    timeRemaining?: number
  ) => Promise<GamificationResult>;
  recordSmartPracticeSession: (questionsCompleted: number) => Promise<GamificationResult>;
  setGamificationEnabled: (enabled: boolean) => Promise<void>;
  dismissAchievementNotifications: (achievementIds: string[]) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error(
      "useProgressContext must be used within a ProgressProvider"
    );
  }
  return context;
}

export default function ProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const progressData = useProgress();
  const [lastGamificationResult, setLastGamificationResult] = useState<GamificationResult | null>(null);

  // Get gamification state from progress
  const gamificationState = progressData.progress?.gamification ?? null;
  const gamification = useGamification(gamificationState);

  // Record exam with gamification processing
  const recordExamWithGamification = useCallback(
    async (attempt: ExamAttempt, timeRemaining: number = 0): Promise<GamificationResult> => {
      // First record the exam normally
      await progressData.recordExam(attempt);

      // Then process gamification if enabled and state exists
      if (gamificationState && gamificationState.settings.enabled && progressData.progress) {
        const { newState, result } = processExamComplete(
          gamificationState,
          progressData.progress,
          attempt,
          timeRemaining
        );

        await progressData.updateGamificationState(newState);
        setLastGamificationResult(result);
        return result;
      }

      // Return empty result if gamification is disabled
      const emptyResult: GamificationResult = {
        xpGained: 0,
        xpEvents: [],
        newAchievements: [],
        levelUp: false,
        previousLevel: gamificationState?.currentLevel ?? 1,
        newLevel: gamificationState?.currentLevel ?? 1,
        dailyGoalsCompleted: [],
        allDailyGoalsComplete: false,
      };
      return emptyResult;
    },
    [progressData, gamificationState]
  );

  // Record smart practice session completion
  const recordSmartPracticeSession = useCallback(
    async (questionsCompleted: number): Promise<GamificationResult> => {
      if (gamificationState && gamificationState.settings.enabled) {
        const { newState, result } = processSmartPracticeSession(
          gamificationState,
          questionsCompleted
        );

        await progressData.updateGamificationState(newState);
        setLastGamificationResult(result);
        return result;
      }

      const emptyResult: GamificationResult = {
        xpGained: 0,
        xpEvents: [],
        newAchievements: [],
        levelUp: false,
        previousLevel: gamificationState?.currentLevel ?? 1,
        newLevel: gamificationState?.currentLevel ?? 1,
        dailyGoalsCompleted: [],
        allDailyGoalsComplete: false,
      };
      return emptyResult;
    },
    [progressData, gamificationState]
  );

  // Toggle gamification enabled/disabled
  const setGamificationEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (gamificationState) {
        const newState = toggleGamification(gamificationState, enabled);
        await progressData.updateGamificationState(newState);
      }
    },
    [progressData, gamificationState]
  );

  // Dismiss achievement notifications
  const dismissAchievementNotifications = useCallback(
    async (achievementIds: string[]): Promise<void> => {
      if (gamificationState) {
        const newState = markAchievementsNotified(gamificationState, achievementIds);
        await progressData.updateGamificationState(newState);
      }
    },
    [progressData, gamificationState]
  );

  const contextValue: ProgressContextType = {
    ...progressData,
    gamification,
    lastGamificationResult,
    recordExamWithGamification,
    recordSmartPracticeSession,
    setGamificationEnabled,
    dismissAchievementNotifications,
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}
