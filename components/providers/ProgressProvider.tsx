"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useProgress } from "@/hooks/useProgress";
import type {
  UserProgress,
  ExamAttempt,
  QuestionAttempt,
  QuestionStats,
} from "@/lib/types/progress";

type ProgressContextType = {
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

  return (
    <ProgressContext.Provider value={progressData}>
      {children}
    </ProgressContext.Provider>
  );
}
