/**
 * localStorage implementation of the StorageProvider interface
 */

import {
  type StorageProvider,
  type UserProgress,
  type ExamAttempt,
  type QuestionAttempt,
  type QuestionStats,
  type SpacedRepetitionStats,
  type ArchivedExams,
  PROGRESS_VERSION,
  EXAM_HISTORY_LIMIT,
  createEmptyProgress,
  getQuestionKey,
} from "@/lib/types/progress";
import {
  addActiveDay,
  backfillActiveDays,
  deriveStreaks,
  normalizeActiveDays,
} from "@/lib/streaks";
import { migrateToGamification } from "@/lib/gamification/engine";
import { createInitialGamificationState } from "@/lib/types/gamification";
import type { GamificationState } from "@/lib/types/gamification";
import { getTodayDateString } from "@/lib/gamification/daily-goals";
import { convertLegacyExport } from "@/lib/backup/legacy-import";

const STORAGE_KEY = "hamradio_progress";
const LEGACY_MIGRATED_KEY = "hamradio_legacy_migrated";

/** Fired on `window` when a write to localStorage fails. */
export const STORAGE_ERROR_EVENT = "hamradio:storage-error";

export interface StorageWriteError {
  /** `quota` means the browser refused the write because storage is full. */
  kind: "quota" | "unknown";
  message: string;
}

function isQuotaError(error: unknown): boolean {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    // Browsers disagree on the name and Firefox only sets the legacy code.
    return (
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014
    );
  }
  return error instanceof Error && error.name === "QuotaExceededError";
}

/**
 * Surface a failed write instead of letting it become an unhandled rejection.
 * Progress writes are fired from answer handlers that do not await them, so a
 * full quota otherwise fails completely silently — the user keeps studying and
 * nothing is being saved.
 */
function reportStorageError(error: unknown): void {
  if (typeof window === "undefined") return;
  const detail: StorageWriteError = {
    kind: isQuotaError(error) ? "quota" : "unknown",
    message: error instanceof Error ? error.message : String(error),
  };
  window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail }));
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-migrate legacy RadioEscola localStorage data.
 * When the new app is deployed over the same domain, the old keys
 * (question1, question2, question3, question1Fav, etc.) are still
 * present. This converts them to the new format on first load,
 * then removes the old keys.
 */
function autoMigrateLegacy(): UserProgress | null {
  if (localStorage.getItem(LEGACY_MIGRATED_KEY)) return null;

  // Collect old RadioEscola keys
  const legacyKeys = ["question1", "question2", "question3", "question1Fav", "question2Fav", "question3Fav"];
  const legacyData: Record<string, string> = {};
  let hasLegacy = false;

  for (const key of legacyKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      legacyData[key] = value;
      hasLegacy = true;
    }
  }

  // Mark as done regardless — we only attempt once
  localStorage.setItem(LEGACY_MIGRATED_KEY, "1");

  if (!hasLegacy) return null;

  try {
    const { progress } = convertLegacyExport(legacyData);

    // Clean up old keys
    for (const key of legacyKeys) {
      localStorage.removeItem(key);
    }
    // Also remove auxiliary old keys
    localStorage.removeItem("DarkMode");

    return progress;
  } catch (error) {
    console.error("Legacy auto-migration failed:", error);
    return null;
  }
}

function getProgress(): Promise<UserProgress | null> {
  return new Promise((resolve) => {
    if (!isLocalStorageAvailable()) {
      resolve(null);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      // If no new-format data exists, try auto-migrating legacy data
      if (!stored) {
        const legacy = autoMigrateLegacy();
        if (legacy) {
          saveProgress(legacy);
          resolve(legacy);
          return;
        }
        resolve(null);
        return;
      }

      const parsed = JSON.parse(stored) as UserProgress;

      // Handle version migrations if needed
      if (parsed.version < PROGRESS_VERSION) {
        const migrated = migrateProgress(parsed);
        saveProgress(migrated);
        resolve(migrated);
        return;
      }

      resolve(parsed);
    } catch (error) {
      console.error("Failed to load progress from localStorage:", error);
      resolve(null);
    }
  });
}

function saveProgress(progress: UserProgress): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isLocalStorageAvailable()) {
      resolve();
      return;
    }

    try {
      progress.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      resolve();
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
      reportStorageError(error);
      reject(error);
    }
  });
}

export function migrateProgress(progress: UserProgress): UserProgress {
  let migrated = { ...progress };

  // V1 -> V2: Added spaced repetition fields (optional, no-op)
  // V2 -> V3: Added gamification state
  if (migrated.version < 3) {
    migrated.gamification = migrateToGamification(migrated);
  }

  // Ensure gamification state exists
  if (!migrated.gamification) {
    migrated.gamification = createInitialGamificationState();
  }

  // V3 -> V4: Added lastGoalCompletionDate (consecutive-day daily-goal streak)
  // and lifetimeStats.dailyGoalSetsCompleted (days with all goals complete).
  // Backfill both for states that predate the fields.
  if (migrated.version < 4) {
    if (migrated.gamification.lastGoalCompletionDate === undefined) {
      migrated.gamification.lastGoalCompletionDate = null;
    }
    if (migrated.gamification.lifetimeStats.dailyGoalSetsCompleted === undefined) {
      migrated.gamification.lifetimeStats.dailyGoalSetsCompleted = 0;
    }
  }

  // V4 -> V5: streaks move from three mutable counters to a set of study days,
  // and examHistory gains a cap. Backfill the days the stored streak implies so
  // no visible streak collapses; every day before that run was never recorded
  // anywhere and is unrecoverable, which is the reason V5 starts writing them.
  if (!Array.isArray(migrated.activeDays)) {
    migrated.activeDays = backfillActiveDays(
      migrated.stats.lastStudyDate,
      migrated.stats.currentStreak
    );
  } else {
    migrated.activeDays = normalizeActiveDays(migrated.activeDays);
  }

  capExamHistory(migrated);

  migrated.version = PROGRESS_VERSION;
  return migrated;
}

/**
 * Fold exams beyond EXAM_HISTORY_LIMIT into `archivedExams`.
 * `examHistory` is newest-first, so the tail is the oldest.
 */
function capExamHistory(progress: UserProgress): void {
  if (progress.examHistory.length <= EXAM_HISTORY_LIMIT) return;

  const dropped = progress.examHistory.slice(EXAM_HISTORY_LIMIT);
  progress.examHistory = progress.examHistory.slice(0, EXAM_HISTORY_LIMIT);

  const archive: ArchivedExams = progress.archivedExams
    ? { ...progress.archivedExams, bestScores: { ...progress.archivedExams.bestScores } }
    : { count: 0, passed: 0, bestScores: {} };

  for (const exam of dropped) {
    archive.count += 1;
    if (exam.passed) archive.passed += 1;
    const best = archive.bestScores[exam.category];
    if (best === undefined || exam.score > best) {
      archive.bestScores[exam.category] = exam.score;
    }
  }

  progress.archivedExams = archive;
}

/**
 * Record today as a study day and re-derive every streak number from the set.
 *
 * `longestStreak` stays monotonic: users migrated from V4 have a real longest
 * streak whose days were never written down, so a value derived from the days
 * we do have must never lower it.
 */
function recordStudyDay(progress: UserProgress): void {
  const today = getTodayDateString();
  progress.activeDays = addActiveDay(progress.activeDays ?? [], today);

  const derived = deriveStreaks(progress.activeDays, today);
  progress.stats.currentStreak = derived.currentStreak;
  progress.stats.longestStreak = Math.max(
    progress.stats.longestStreak,
    derived.longestStreak
  );
  progress.stats.lastStudyDate = derived.lastStudyDate;
}

async function recordExamAttempt(attempt: ExamAttempt): Promise<void> {
  let progress = await getProgress();
  if (!progress) {
    progress = createEmptyProgress();
  }

  // Add exam to history
  progress.examHistory.unshift(attempt);

  // Update stats
  progress.stats.totalExams += 1;
  if (attempt.passed) {
    progress.stats.totalPassed += 1;
  }

  // Update best score for category
  const currentBest = progress.stats.bestScores[attempt.category] ?? -Infinity;
  if (attempt.score > currentBest) {
    progress.stats.bestScores[attempt.category] = attempt.score;
  }

  // Update streak
  recordStudyDay(progress);

  capExamHistory(progress);

  await saveProgress(progress);
}

async function recordQuestionAttempt(attempt: QuestionAttempt): Promise<void> {
  let progress = await getProgress();
  if (!progress) {
    progress = createEmptyProgress();
  }

  const key = getQuestionKey(attempt.category, attempt.questionId);
  const existing = progress.questionStats[key];

  if (existing) {
    // Spread `existing` rather than rebuilding the record: bookmarks, notes and
    // bookmarkedAt live on the same object, and listing fields by hand silently
    // deleted them every time a bookmarked question was answered.
    progress.questionStats[key] = {
      ...existing,
      attempts: existing.attempts + 1,
      correct: existing.correct + (attempt.correct ? 1 : 0),
      lastAttempt: attempt.timestamp,
      lastCorrect: attempt.correct,
    };
  } else {
    progress.questionStats[key] = {
      attempts: 1,
      correct: attempt.correct ? 1 : 0,
      lastAttempt: attempt.timestamp,
      lastCorrect: attempt.correct,
    };
  }

  // Update streak for any study activity
  recordStudyDay(progress);

  await saveProgress(progress);
}

async function clearProgress(): Promise<void> {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}

async function updateGamification(
  newState: GamificationState
): Promise<UserProgress | null> {
  const progress = await getProgress();
  if (!progress) return null;

  progress.gamification = newState;
  await saveProgress(progress);
  return progress;
}

/**
 * Update spaced repetition stats for a specific question
 * Used by Smart Practice mode to track review intervals
 */
export async function updateQuestionSR(
  category: string,
  questionId: number,
  srStats: SpacedRepetitionStats,
  wasCorrect: boolean
): Promise<void> {
  let progress = await getProgress();
  if (!progress) {
    progress = createEmptyProgress();
  }

  const key = getQuestionKey(category, questionId);
  const existing = progress.questionStats[key];

  if (existing) {
    progress.questionStats[key] = {
      ...existing,
      attempts: existing.attempts + 1,
      correct: existing.correct + (wasCorrect ? 1 : 0),
      lastAttempt: Date.now(),
      lastCorrect: wasCorrect,
      spacedRep: srStats,
    };
  } else {
    progress.questionStats[key] = {
      attempts: 1,
      correct: wasCorrect ? 1 : 0,
      lastAttempt: Date.now(),
      lastCorrect: wasCorrect,
      spacedRep: srStats,
    };
  }

  // Update streak for any study activity
  recordStudyDay(progress);

  await saveProgress(progress);
}

export const localStorageProvider: StorageProvider = {
  getProgress,
  saveProgress,
  recordExamAttempt,
  recordQuestionAttempt,
  clearProgress,
  updateGamification,
};

// Utility functions for accessing specific stats
export function getQuestionStatsFromProgress(
  progress: UserProgress | null,
  category: string,
  questionId: number
): QuestionStats | null {
  if (!progress) return null;
  const key = getQuestionKey(category, questionId);
  return progress.questionStats[key] ?? null;
}

export function getWeakQuestions(
  progress: UserProgress | null,
  minAttempts: number = 2
): Array<{ key: string; stats: QuestionStats; successRate: number }> {
  if (!progress) return [];

  return Object.entries(progress.questionStats)
    .filter(([_, stats]) => stats.attempts >= minAttempts)
    .map(([key, stats]) => ({
      key,
      stats,
      successRate: stats.correct / stats.attempts,
    }))
    .sort((a, b) => a.successRate - b.successRate);
}

export function getCategoryProgress(
  progress: UserProgress | null,
  category: string,
  totalQuestions: number
): { mastered: number; attempted: number; masteryRate: number } {
  if (!progress) {
    return { mastered: 0, attempted: 0, masteryRate: 0 };
  }

  const prefix = `cat${category}_`;
  let mastered = 0;
  let attempted = 0;

  for (const [key, stats] of Object.entries(progress.questionStats)) {
    if (key.startsWith(prefix)) {
      attempted += 1;
      // Consider a question "mastered" if answered correctly 2+ times with 70%+ success rate
      if (stats.correct >= 2 && stats.correct / stats.attempts >= 0.7) {
        mastered += 1;
      }
    }
  }

  return {
    mastered,
    attempted,
    masteryRate: totalQuestions > 0 ? mastered / totalQuestions : 0,
  };
}

/**
 * Toggle bookmark status for a question
 * Returns the new bookmarked state
 */
export async function toggleBookmark(
  category: string,
  questionId: number
): Promise<boolean> {
  let progress = await getProgress();
  if (!progress) {
    progress = createEmptyProgress();
  }

  const key = getQuestionKey(category, questionId);
  const existing = progress.questionStats[key];

  if (existing) {
    const newBookmarked = !existing.bookmarked;
    progress.questionStats[key] = {
      ...existing,
      bookmarked: newBookmarked,
      bookmarkedAt: newBookmarked ? Date.now() : undefined,
    };
  } else {
    progress.questionStats[key] = {
      attempts: 0,
      correct: 0,
      lastAttempt: 0,
      lastCorrect: false,
      bookmarked: true,
      bookmarkedAt: Date.now(),
    };
  }

  await saveProgress(progress);
  return progress.questionStats[key]?.bookmarked ?? false;
}

/**
 * Save personal notes for a question
 */
export async function saveQuestionNotes(
  category: string,
  questionId: number,
  notes: string
): Promise<void> {
  let progress = await getProgress();
  if (!progress) {
    progress = createEmptyProgress();
  }

  const key = getQuestionKey(category, questionId);
  const existing = progress.questionStats[key];

  if (existing) {
    progress.questionStats[key] = {
      ...existing,
      notes: notes || undefined,
    };
  } else {
    progress.questionStats[key] = {
      attempts: 0,
      correct: 0,
      lastAttempt: 0,
      lastCorrect: false,
      notes: notes || undefined,
    };
  }

  await saveProgress(progress);
}

/**
 * Get all bookmarked questions
 */
export function getBookmarkedQuestions(
  progress: UserProgress | null
): Array<{ key: string; category: string; questionId: number; stats: QuestionStats }> {
  if (!progress) return [];

  return Object.entries(progress.questionStats)
    .filter(([_, stats]) => stats.bookmarked)
    .map(([key, stats]) => {
      const [cat, id] = key.split("_");
      return {
        key,
        category: cat?.replace("cat", "") ?? "",
        questionId: parseInt(id ?? "0", 10),
        stats,
      };
    })
    .sort((a, b) => (b.stats.bookmarkedAt ?? 0) - (a.stats.bookmarkedAt ?? 0));
}
