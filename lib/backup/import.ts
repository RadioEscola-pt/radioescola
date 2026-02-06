import type { UserProgress, QuestionStats, ExamAttempt } from "@/lib/types/progress";
import { PROGRESS_VERSION } from "@/lib/types/progress";
import type { GamificationState, UnlockedAchievement } from "@/lib/types/gamification";
import type { BackupFile, ValidationResult, ImportResult, ImportStrategy } from "./types";
import { generateChecksum } from "./export";
import { migrateProgress } from "@/lib/storage/localStorage";

export async function parseBackupFile(file: File): Promise<BackupFile> {
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    return parsed as BackupFile;
  } catch {
    throw new Error("Invalid JSON file");
  }
}

export function validateBackup(backup: BackupFile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!backup.metadata) {
    errors.push("Missing metadata");
  } else {
    if (typeof backup.metadata.exportedAt !== "number") {
      errors.push("Invalid export timestamp");
    }
    if (typeof backup.metadata.progressVersion !== "number") {
      errors.push("Invalid progress version");
    }
    if (backup.metadata.progressVersion > PROGRESS_VERSION) {
      errors.push(`Backup version ${backup.metadata.progressVersion} is newer than supported version ${PROGRESS_VERSION}`);
    }
    if (backup.metadata.progressVersion < PROGRESS_VERSION) {
      warnings.push(`Backup will be migrated from version ${backup.metadata.progressVersion} to ${PROGRESS_VERSION}`);
    }
  }

  if (!backup.data) {
    errors.push("Missing progress data");
  } else {
    if (typeof backup.data.questionStats !== "object") {
      errors.push("Invalid questionStats");
    }
    if (!Array.isArray(backup.data.examHistory)) {
      errors.push("Invalid examHistory");
    }
    if (typeof backup.data.stats !== "object") {
      errors.push("Invalid stats");
    }

    if (backup.metadata?.checksum) {
      const calculatedChecksum = generateChecksum(backup.data);
      if (calculatedChecksum !== backup.metadata.checksum) {
        warnings.push("Checksum mismatch - data may have been modified");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function mergeQuestionStats(
  existing: Record<string, QuestionStats>,
  imported: Record<string, QuestionStats>
): { merged: Record<string, QuestionStats>; added: number } {
  const merged = { ...existing };
  let added = 0;

  for (const [key, importedStats] of Object.entries(imported)) {
    const existingStats = existing[key];

    if (!existingStats) {
      merged[key] = importedStats;
      added++;
    } else {
      merged[key] = {
        attempts: existingStats.attempts + importedStats.attempts,
        correct: existingStats.correct + importedStats.correct,
        lastAttempt: Math.max(existingStats.lastAttempt, importedStats.lastAttempt),
        lastCorrect: existingStats.lastAttempt > importedStats.lastAttempt
          ? existingStats.lastCorrect
          : importedStats.lastCorrect,
        spacedRep: existingStats.spacedRep || importedStats.spacedRep,
        bookmarked: existingStats.bookmarked || importedStats.bookmarked,
        notes: existingStats.notes || importedStats.notes,
        bookmarkedAt: existingStats.bookmarkedAt || importedStats.bookmarkedAt,
      };
    }
  }

  return { merged, added };
}

function mergeExamHistory(
  existing: ExamAttempt[],
  imported: ExamAttempt[]
): { merged: ExamAttempt[]; added: number } {
  const existingIds = new Set(existing.map(e => e.id));
  const newExams = imported.filter(e => !existingIds.has(e.id));

  const merged = [...existing, ...newExams].sort((a, b) => b.timestamp - a.timestamp);

  return { merged, added: newExams.length };
}

function mergeAchievements(
  existing: UnlockedAchievement[],
  imported: UnlockedAchievement[]
): { merged: UnlockedAchievement[]; added: number } {
  const existingIds = new Set(existing.map(a => a.achievementId));
  const newAchievements = imported.filter(a => !existingIds.has(a.achievementId));

  return {
    merged: [...existing, ...newAchievements],
    added: newAchievements.length,
  };
}

function mergeGamification(
  existing: GamificationState | undefined,
  imported: GamificationState | undefined
): { merged: GamificationState | undefined; achievementsAdded: number } {
  if (!imported) return { merged: existing, achievementsAdded: 0 };
  if (!existing) return { merged: imported, achievementsAdded: imported.unlockedAchievements?.length || 0 };

  const { merged: mergedAchievements, added: achievementsAdded } = mergeAchievements(
    existing.unlockedAchievements || [],
    imported.unlockedAchievements || []
  );

  return {
    merged: {
      ...existing,
      totalXP: Math.max(existing.totalXP, imported.totalXP),
      currentLevel: Math.max(existing.currentLevel, imported.currentLevel),
      unlockedAchievements: mergedAchievements,
      lifetimeStats: {
        questionsAnswered: Math.max(
          existing.lifetimeStats?.questionsAnswered || 0,
          imported.lifetimeStats?.questionsAnswered || 0
        ),
        questionsCorrect: Math.max(
          existing.lifetimeStats?.questionsCorrect || 0,
          imported.lifetimeStats?.questionsCorrect || 0
        ),
        perfectScores: Math.max(
          existing.lifetimeStats?.perfectScores || 0,
          imported.lifetimeStats?.perfectScores || 0
        ),
        smartPracticeSessions: Math.max(
          existing.lifetimeStats?.smartPracticeSessions || 0,
          imported.lifetimeStats?.smartPracticeSessions || 0
        ),
        drillsCompleted: Math.max(
          existing.lifetimeStats?.drillsCompleted || 0,
          imported.lifetimeStats?.drillsCompleted || 0
        ),
        drillsPerfect: Math.max(
          existing.lifetimeStats?.drillsPerfect || 0,
          imported.lifetimeStats?.drillsPerfect || 0
        ),
        dailyGoalsCompleted: Math.max(
          existing.lifetimeStats?.dailyGoalsCompleted || 0,
          imported.lifetimeStats?.dailyGoalsCompleted || 0
        ),
        fastFinishes: Math.max(
          existing.lifetimeStats?.fastFinishes || 0,
          imported.lifetimeStats?.fastFinishes || 0
        ),
        comebacks: Math.max(
          existing.lifetimeStats?.comebacks || 0,
          imported.lifetimeStats?.comebacks || 0
        ),
        categoriesAttempted: [
          ...new Set([
            ...(existing.lifetimeStats?.categoriesAttempted || []),
            ...(imported.lifetimeStats?.categoriesAttempted || []),
          ]),
        ],
      },
    },
    achievementsAdded,
  };
}

export function mergeProgress(
  existing: UserProgress,
  imported: UserProgress
): { merged: UserProgress; stats: ImportResult["mergeStats"] } {
  const { merged: questionStats, added: questionsAdded } = mergeQuestionStats(
    existing.questionStats,
    imported.questionStats
  );

  const { merged: examHistory, added: examsAdded } = mergeExamHistory(
    existing.examHistory,
    imported.examHistory
  );

  const { merged: gamification, achievementsAdded } = mergeGamification(
    existing.gamification,
    imported.gamification
  );

  const merged: UserProgress = {
    version: PROGRESS_VERSION,
    lastUpdated: Date.now(),
    questionStats,
    examHistory,
    stats: {
      totalExams: Math.max(existing.stats.totalExams, imported.stats.totalExams),
      totalPassed: Math.max(existing.stats.totalPassed, imported.stats.totalPassed),
      bestScores: { ...existing.stats.bestScores },
      currentStreak: Math.max(existing.stats.currentStreak, imported.stats.currentStreak),
      longestStreak: Math.max(existing.stats.longestStreak, imported.stats.longestStreak),
      lastStudyDate: existing.stats.lastStudyDate && imported.stats.lastStudyDate
        ? existing.stats.lastStudyDate > imported.stats.lastStudyDate
          ? existing.stats.lastStudyDate
          : imported.stats.lastStudyDate
        : existing.stats.lastStudyDate || imported.stats.lastStudyDate,
    },
    gamification,
  };

  for (const [cat, score] of Object.entries(imported.stats.bestScores)) {
    if (!merged.stats.bestScores[cat] || score > merged.stats.bestScores[cat]) {
      merged.stats.bestScores[cat] = score;
    }
  }

  return {
    merged,
    stats: {
      questionsAdded,
      examsAdded,
      achievementsAdded,
    },
  };
}

export function importBackup(
  backup: BackupFile,
  existing: UserProgress | null,
  strategy: ImportStrategy
): { progress: UserProgress; result: ImportResult } {
  let importedData = backup.data;

  if (backup.metadata.progressVersion < PROGRESS_VERSION) {
    importedData = migrateProgress(importedData);
  }

  if (strategy === "replace" || !existing) {
    return {
      progress: {
        ...importedData,
        version: PROGRESS_VERSION,
        lastUpdated: Date.now(),
      },
      result: {
        success: true,
        strategy,
        warnings: [],
      },
    };
  }

  const { merged, stats } = mergeProgress(existing, importedData);

  return {
    progress: merged,
    result: {
      success: true,
      strategy: "merge",
      warnings: [],
      mergeStats: stats,
    },
  };
}
