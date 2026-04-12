/**
 * Import progress from the old RadioEscola system.
 *
 * Old format (exported via LocalStorageManager):
 *   {
 *     "question1": "{\"page\":0,\"favPage\":0,\"5\":{\"isCorrect\":[true,false]}}",
 *     "question1Fav": "[1,3,5]",
 *     "question2": "...",
 *     ...
 *   }
 *
 * Keys "question1" / "question2" / "question3" map to categories "1" / "2" / "3".
 * Each numeric property inside is a uniqueID with { isCorrect: boolean[] }.
 * Keys ending in "Fav" contain arrays of bookmarked uniqueIDs.
 */

import type { UserProgress, QuestionStats } from "@/lib/types/progress";
import { createEmptyProgress, getQuestionKey } from "@/lib/types/progress";

/** Shape of per-question answer history in the old system */
interface LegacyQuestionRecord {
  isCorrect: boolean[];
}

/** The flat key-value export from LocalStorageManager */
type LegacyExport = Record<string, string>;

const CATEGORY_MAP: Record<string, string> = {
  question1: "1",
  question2: "2",
  question3: "3",
};

function isQuestionProgressKey(key: string): boolean {
  return key in CATEGORY_MAP;
}

function isFavoritesKey(key: string): boolean {
  return key.endsWith("Fav") && key.replace("Fav", "") in CATEGORY_MAP;
}

export interface LegacyImportStats {
  questionsImported: number;
  bookmarksImported: number;
  categoriesFound: string[];
}

/**
 * Detect whether a parsed JSON object looks like a RadioEscola legacy export.
 */
export function isLegacyExport(data: unknown): data is LegacyExport {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const keys = Object.keys(data as Record<string, unknown>);
  return keys.some((k) => isQuestionProgressKey(k) || isFavoritesKey(k));
}

/**
 * Convert a RadioEscola localStorage export into the new UserProgress format.
 */
export function convertLegacyExport(data: LegacyExport): {
  progress: UserProgress;
  stats: LegacyImportStats;
} {
  const progress = createEmptyProgress();
  const importStats: LegacyImportStats = {
    questionsImported: 0,
    bookmarksImported: 0,
    categoriesFound: [],
  };

  // Collect favorites per category first so we can set bookmarks while processing
  const favorites: Record<string, Set<number>> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!isFavoritesKey(key)) continue;
    const category = CATEGORY_MAP[key.replace("Fav", "")];
    if (!category) continue;

    try {
      const ids = JSON.parse(value) as number[];
      if (Array.isArray(ids)) {
        favorites[category] = new Set(ids);
      }
    } catch {
      // Skip malformed favorites
    }
  }

  // Process question progress
  for (const [key, value] of Object.entries(data)) {
    if (!isQuestionProgressKey(key)) continue;
    const category = CATEGORY_MAP[key];
    if (!category) continue;

    if (!importStats.categoriesFound.includes(category)) {
      importStats.categoriesFound.push(category);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(value) as Record<string, unknown>;
    } catch {
      continue;
    }

    for (const [prop, record] of Object.entries(parsed)) {
      // Skip non-question properties (page, favPage)
      if (prop === "page" || prop === "favPage") continue;

      const questionId = parseInt(prop, 10);
      if (isNaN(questionId)) continue;

      const qRecord = record as LegacyQuestionRecord;
      if (!qRecord.isCorrect || !Array.isArray(qRecord.isCorrect)) continue;

      const attempts = qRecord.isCorrect.length;
      const correct = qRecord.isCorrect.filter(Boolean).length;
      const lastCorrect = qRecord.isCorrect[attempts - 1] ?? false;
      const isFavorite = favorites[category]?.has(questionId) ?? false;

      const questionKey = getQuestionKey(category, questionId);
      const stats: QuestionStats = {
        attempts,
        correct,
        lastAttempt: Date.now(), // No timestamp in old data
        lastCorrect,
      };

      if (isFavorite) {
        stats.bookmarked = true;
        stats.bookmarkedAt = Date.now();
        importStats.bookmarksImported++;
      }

      progress.questionStats[questionKey] = stats;
      importStats.questionsImported++;
    }
  }

  // Also import favorites for questions that weren't answered yet
  for (const [category, favSet] of Object.entries(favorites)) {
    for (const questionId of favSet) {
      const questionKey = getQuestionKey(category, questionId);
      if (!progress.questionStats[questionKey]) {
        progress.questionStats[questionKey] = {
          attempts: 0,
          correct: 0,
          lastAttempt: 0,
          lastCorrect: false,
          bookmarked: true,
          bookmarkedAt: Date.now(),
        };
        importStats.bookmarksImported++;
      }
    }
  }

  return { progress, stats: importStats };
}
