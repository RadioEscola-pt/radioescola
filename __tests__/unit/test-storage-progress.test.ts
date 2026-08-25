import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  localStorageProvider,
  migrateProgress,
  toggleBookmark,
  saveQuestionNotes,
  STORAGE_ERROR_EVENT,
  type StorageWriteError,
} from "@/lib/storage/localStorage";
import {
  createEmptyProgress,
  createInitialSRStats,
  getQuestionKey,
  EXAM_HISTORY_LIMIT,
  PROGRESS_VERSION,
  type ExamAttempt,
  type UserProgress,
} from "@/lib/types/progress";
import { getTodayDateString } from "@/lib/gamification/daily-goals";

const STORAGE_KEY = "hamradio_progress";

function seed(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function stored(): UserProgress {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as UserProgress;
}

function makeExam(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    id: `exam-${Math.random().toString(36).slice(2)}`,
    category: "3",
    score: 30,
    totalQuestions: 40,
    correctCount: 30,
    incorrectCount: 10,
    unansweredCount: 0,
    timeSpent: 600,
    passed: true,
    timestamp: 1_700_000_000_000,
    questionIds: [1, 2, 3],
    answers: { 1: 0 },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  // The legacy auto-migration only runs once per browser; mark it done so it
  // does not interfere with tests that start from an empty store.
  localStorage.setItem("hamradio_legacy_migrated", "1");
});

describe("recordQuestionAttempt", () => {
  it("preserves the bookmark and the note when a bookmarked question is answered", async () => {
    // Regression: this used to rebuild the record field by field, silently
    // deleting bookmarked / bookmarkedAt / notes on every answer.
    seed(createEmptyProgress());
    await toggleBookmark("3", 42);
    await saveQuestionNotes("3", 42, "lembrar: 3.5 MHz");

    await localStorageProvider.recordQuestionAttempt({
      questionId: 42,
      category: "3",
      correct: true,
      timestamp: 1_700_000_000_000,
    });

    const stats = stored().questionStats[getQuestionKey("3", 42)];
    expect(stats?.bookmarked).toBe(true);
    expect(stats?.bookmarkedAt).toEqual(expect.any(Number));
    expect(stats?.notes).toBe("lembrar: 3.5 MHz");
  });

  it("preserves spaced-repetition scheduling", async () => {
    const progress = createEmptyProgress();
    const srStats = { ...createInitialSRStats(), interval: 30, repetitionNumber: 4 };
    progress.questionStats[getQuestionKey("3", 7)] = {
      attempts: 3,
      correct: 3,
      lastAttempt: 1,
      lastCorrect: true,
      spacedRep: srStats,
    };
    seed(progress);

    await localStorageProvider.recordQuestionAttempt({
      questionId: 7,
      category: "3",
      correct: false,
      timestamp: 1_700_000_000_000,
    });

    const stats = stored().questionStats[getQuestionKey("3", 7)];
    expect(stats?.spacedRep).toEqual(srStats);
    expect(stats?.attempts).toBe(4);
    expect(stats?.correct).toBe(3);
    expect(stats?.lastCorrect).toBe(false);
  });

  it("records today as a study day", async () => {
    seed(createEmptyProgress());

    await localStorageProvider.recordQuestionAttempt({
      questionId: 1,
      category: "3",
      correct: true,
      timestamp: Date.now(),
    });

    const after = stored();
    expect(after.activeDays).toEqual([getTodayDateString()]);
    expect(after.stats.currentStreak).toBe(1);
    expect(after.stats.lastStudyDate).toBe(getTodayDateString());
  });

  it("does not add a second entry for the same day", async () => {
    seed(createEmptyProgress());
    for (const questionId of [1, 2, 3]) {
      await localStorageProvider.recordQuestionAttempt({
        questionId,
        category: "3",
        correct: true,
        timestamp: Date.now(),
      });
    }
    expect(stored().activeDays).toHaveLength(1);
  });
});

describe("recordExamAttempt", () => {
  it("caps the history and folds the overflow into archivedExams", async () => {
    const progress = createEmptyProgress();
    progress.examHistory = Array.from({ length: EXAM_HISTORY_LIMIT }, (_, i) =>
      makeExam({
        id: `old-${i}`,
        // Oldest last: the array is newest-first.
        timestamp: 1_700_000_000_000 - i,
        passed: i % 2 === 0,
        score: 10 + (i % 5),
        category: "2",
      })
    );
    seed(progress);

    await localStorageProvider.recordExamAttempt(makeExam({ id: "newest", score: 38 }));

    const after = stored();
    expect(after.examHistory).toHaveLength(EXAM_HISTORY_LIMIT);
    expect(after.examHistory[0]?.id).toBe("newest");
    // Exactly one exam fell off the end: the oldest.
    expect(after.examHistory.some((e) => e.id === `old-${EXAM_HISTORY_LIMIT - 1}`)).toBe(false);
    expect(after.archivedExams?.count).toBe(1);
    expect(after.archivedExams?.bestScores["2"]).toBeDefined();
    // Lifetime totals are unaffected by the trim.
    expect(after.stats.totalExams).toBe(1);
  });

  it("leaves a short history untouched", async () => {
    seed(createEmptyProgress());
    await localStorageProvider.recordExamAttempt(makeExam());
    const after = stored();
    expect(after.examHistory).toHaveLength(1);
    expect(after.archivedExams).toBeUndefined();
  });
});

describe("migrateProgress V4 -> V5", () => {
  function makeV4(): UserProgress {
    const progress = createEmptyProgress();
    progress.version = 4;
    delete (progress as Partial<UserProgress>).activeDays;
    return progress;
  }

  it("backfills the days a stored streak implies", () => {
    const v4 = makeV4();
    v4.stats.currentStreak = 5;
    v4.stats.longestStreak = 11;
    v4.stats.lastStudyDate = "2026-08-25";

    const migrated = migrateProgress(v4);

    expect(migrated.version).toBe(PROGRESS_VERSION);
    expect(migrated.activeDays).toEqual([
      "2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25",
    ]);
    // The days behind the old longest streak were never recorded, so the stored
    // value must survive as a floor rather than being recomputed downwards.
    expect(migrated.stats.longestStreak).toBe(11);
  });

  it("copes with a user who has never studied", () => {
    const migrated = migrateProgress(makeV4());
    expect(migrated.activeDays).toEqual([]);
  });

  it("caps an oversized history that predates the limit", () => {
    const v4 = makeV4();
    v4.examHistory = Array.from({ length: EXAM_HISTORY_LIMIT + 25 }, (_, i) =>
      makeExam({ id: `e-${i}`, timestamp: 1_700_000_000_000 - i, passed: i < 10 })
    );

    const migrated = migrateProgress(v4);

    expect(migrated.examHistory).toHaveLength(EXAM_HISTORY_LIMIT);
    expect(migrated.archivedExams?.count).toBe(25);
    expect(migrated.archivedExams?.passed).toBe(0);
  });

  it("is idempotent", () => {
    const v4 = makeV4();
    v4.stats.currentStreak = 3;
    v4.stats.lastStudyDate = "2026-08-25";

    const once = migrateProgress(v4);
    const twice = migrateProgress(once);

    expect(twice.activeDays).toEqual(once.activeDays);
    expect(twice.archivedExams).toEqual(once.archivedExams);
  });
});

describe("getProgress on stored V4 data", () => {
  it("migrates, persists and keeps the visible streak — the path every existing user hits", async () => {
    const v4 = createEmptyProgress();
    v4.version = 4;
    delete (v4 as Partial<UserProgress>).activeDays;
    v4.stats.currentStreak = 6;
    v4.stats.longestStreak = 14;
    v4.stats.lastStudyDate = getTodayDateString();
    v4.questionStats[getQuestionKey("3", 9)] = {
      attempts: 2,
      correct: 1,
      lastAttempt: 1,
      lastCorrect: false,
      bookmarked: true,
      bookmarkedAt: 5,
      notes: "rever",
    };
    seed(v4);

    const loaded = await localStorageProvider.getProgress();

    expect(loaded?.version).toBe(PROGRESS_VERSION);
    expect(loaded?.activeDays).toHaveLength(6);
    expect(loaded?.stats.currentStreak).toBe(6);
    expect(loaded?.stats.longestStreak).toBe(14);
    // The migration must not disturb existing question data.
    expect(loaded?.questionStats[getQuestionKey("3", 9)]?.notes).toBe("rever");
    // ...and it is written back, so it only runs once.
    expect(stored().version).toBe(PROGRESS_VERSION);
  });
});

describe("failed writes", () => {
  let setItem: typeof Storage.prototype.setItem;

  beforeEach(() => {
    setItem = Storage.prototype.setItem;
  });

  afterEach(() => {
    Storage.prototype.setItem = setItem;
    vi.restoreAllMocks();
  });

  it("announces a quota failure instead of failing silently", async () => {
    seed(createEmptyProgress());

    const events: StorageWriteError[] = [];
    const onError = (event: Event) => {
      events.push((event as CustomEvent<StorageWriteError>).detail);
    };
    window.addEventListener(STORAGE_ERROR_EVENT, onError);

    // Reject only the real write: the availability probe uses its own key.
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === STORAGE_KEY) {
        const error = new DOMException("exceeded the quota", "QuotaExceededError");
        throw error;
      }
      return setItem.call(this, key, value);
    };
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      localStorageProvider.recordQuestionAttempt({
        questionId: 1,
        category: "3",
        correct: true,
        timestamp: Date.now(),
      })
    ).rejects.toBeInstanceOf(DOMException);

    window.removeEventListener(STORAGE_ERROR_EVENT, onError);
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("quota");
  });
});
