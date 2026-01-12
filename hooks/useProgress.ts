"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type UserProgress,
  type ExamAttempt,
  type QuestionAttempt,
  type QuestionStats,
  createEmptyProgress,
  getQuestionKey,
} from "@/lib/types/progress";
import {
  storageProvider,
  getQuestionStatsFromProgress,
  getWeakQuestions,
  getCategoryProgress,
} from "@/lib/storage";

interface UseProgressReturn {
  progress: UserProgress | null;
  isLoading: boolean;
  recordExam: (attempt: ExamAttempt) => Promise<void>;
  recordQuestion: (attempt: QuestionAttempt) => Promise<void>;
  recordQuestionBatch: (attempts: QuestionAttempt[]) => Promise<void>;
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
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await storageProvider.getProgress();
      setProgress(loaded);
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const recordExam = useCallback(async (attempt: ExamAttempt) => {
    await storageProvider.recordExamAttempt(attempt);
    // Reload progress to get updated state
    const updated = await storageProvider.getProgress();
    setProgress(updated);
  }, []);

  const recordQuestion = useCallback(async (attempt: QuestionAttempt) => {
    await storageProvider.recordQuestionAttempt(attempt);
    // Don't reload for single questions to avoid performance issues
  }, []);

  const recordQuestionBatch = useCallback(
    async (attempts: QuestionAttempt[]) => {
      for (const attempt of attempts) {
        await storageProvider.recordQuestionAttempt(attempt);
      }
      // Reload progress after batch
      const updated = await storageProvider.getProgress();
      setProgress(updated);
    },
    []
  );

  const getQuestionStatsHook = useCallback(
    (category: string, questionId: number): QuestionStats | null => {
      return getQuestionStatsFromProgress(progress, category, questionId);
    },
    [progress]
  );

  const getBestScore = useCallback(
    (category: string): number | null => {
      if (!progress) return null;
      return progress.stats.bestScores[category] ?? null;
    },
    [progress]
  );

  const getStreak = useCallback((): { current: number; longest: number } => {
    if (!progress) {
      return { current: 0, longest: 0 };
    }
    return {
      current: progress.stats.currentStreak,
      longest: progress.stats.longestStreak,
    };
  }, [progress]);

  const getWeakQuestionsHook = useCallback(
    (
      minAttempts?: number
    ): Array<{ key: string; stats: QuestionStats; successRate: number }> => {
      return getWeakQuestions(progress, minAttempts);
    },
    [progress]
  );

  const getCategoryProgressHook = useCallback(
    (
      category: string,
      totalQuestions: number
    ): { mastered: number; attempted: number; masteryRate: number } => {
      return getCategoryProgress(progress, category, totalQuestions);
    },
    [progress]
  );

  const clearProgressHook = useCallback(async () => {
    await storageProvider.clearProgress();
    setProgress(null);
  }, []);

  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  return {
    progress,
    isLoading,
    recordExam,
    recordQuestion,
    recordQuestionBatch,
    getQuestionStats: getQuestionStatsHook,
    getBestScore,
    getStreak,
    getWeakQuestions: getWeakQuestionsHook,
    getCategoryProgress: getCategoryProgressHook,
    clearProgress: clearProgressHook,
    refreshProgress,
  };
}
