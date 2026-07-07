"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useProgress } from "@/hooks/useProgress";
import { storageProvider } from "@/lib/storage";
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
  processDrillComplete,
  toggleGamification,
  markAchievementsNotified,
} from "@/lib/gamification/engine";
import { useGamification, type UseGamificationReturn } from "@/hooks/useGamification";

type ProgressContextType = {
  progress: UserProgress | null;
  isLoading: boolean;
  recordExam: (attempt: ExamAttempt) => Promise<UserProgress | null>;
  recordQuestion: (attempt: QuestionAttempt) => Promise<void>;
  recordQuestionWithGamification: (
    attempt: QuestionAttempt
  ) => Promise<GamificationResult>;
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
  recordDrillComplete: (correctAnswers: number, totalQuestions: number, answeredQuestions?: number) => Promise<GamificationResult>;
  setGamificationEnabled: (enabled: boolean) => Promise<void>;
  dismissAchievementNotifications: (achievementIds: string[]) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

/** Neutral gamification result used when gamification is disabled or absent. */
function makeEmptyResult(level: number): GamificationResult {
  return {
    xpGained: 0,
    xpEvents: [],
    newAchievements: [],
    levelUp: false,
    previousLevel: level,
    newLevel: level,
    dailyGoalsCompleted: [],
    allDailyGoalsComplete: false,
  };
}

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
  const gamification = useGamification(gamificationState, progressData.progress?.stats);

  // Run a gamification processor against the freshest persisted progress, then
  // persist the result atomically. Reading fresh (instead of the possibly stale
  // React snapshot) fixes achievement counts lagging by one activity and avoids
  // clobbering concurrent writes.
  const runGamification = useCallback(
    async (
      run: (
        state: GamificationState,
        progress: UserProgress
      ) => { newState: GamificationState; result: GamificationResult }
    ): Promise<GamificationResult> => {
      const fresh = await storageProvider.getProgress();
      const state = fresh?.gamification ?? null;

      if (!fresh || !state || !state.settings.enabled) {
        return makeEmptyResult(state?.currentLevel ?? 1);
      }

      const { newState, result } = run(state, fresh);
      await progressData.updateGamificationState(newState);
      setLastGamificationResult(result);
      return result;
    },
    [progressData]
  );

  // Record exam with gamification processing
  const recordExamWithGamification = useCallback(
    async (attempt: ExamAttempt, timeRemaining: number = 0): Promise<GamificationResult> => {
      // Record the exam first (updates stats/streak/history), then process
      // gamification against the freshly-persisted progress.
      await progressData.recordExam(attempt);
      return runGamification((state, progress) =>
        processExamComplete(state, progress, attempt, timeRemaining)
      );
    },
    [progressData, runGamification]
  );

  // Record a single answered question (Browse / Flash) with gamification
  const recordQuestionWithGamification = useCallback(
    async (attempt: QuestionAttempt): Promise<GamificationResult> => {
      // Persist the raw attempt first (question stats + study streak), then
      // award XP / advance daily goals against the fresh progress.
      await progressData.recordQuestion(attempt);
      return runGamification((state, progress) =>
        processQuestionAnswered(state, attempt.correct, progress)
      );
    },
    [progressData, runGamification]
  );

  // Record smart practice session completion
  const recordSmartPracticeSession = useCallback(
    async (questionsCompleted: number): Promise<GamificationResult> => {
      return runGamification((state, progress) =>
        processSmartPracticeSession(state, questionsCompleted, progress)
      );
    },
    [runGamification]
  );

  // Record drill completion
  const recordDrillComplete = useCallback(
    async (
      correctAnswers: number,
      totalQuestions: number,
      answeredQuestions?: number
    ): Promise<GamificationResult> => {
      return runGamification((state, progress) =>
        processDrillComplete(state, correctAnswers, totalQuestions, progress, answeredQuestions)
      );
    },
    [runGamification]
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
    recordQuestionWithGamification,
    recordSmartPracticeSession,
    recordDrillComplete,
    setGamificationEnabled,
    dismissAchievementNotifications,
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}
