import { describe, it, expect } from "vitest";
import { isLegacyExport, convertLegacyExport } from "@/lib/backup/legacy-import";

describe("isLegacyExport", () => {
  it("detects a valid legacy export", () => {
    expect(isLegacyExport({
      question1: '{"page":0,"1":{"isCorrect":[true]}}',
      question1Fav: "[1,3]",
    })).toBe(true);
  });

  it("detects export with only favorites", () => {
    expect(isLegacyExport({ question2Fav: "[5]" })).toBe(true);
  });

  it("rejects a new-format backup", () => {
    expect(isLegacyExport({
      metadata: { exportedAt: 123 },
      data: { version: 3 },
    })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isLegacyExport(null)).toBe(false);
    expect(isLegacyExport("string")).toBe(false);
    expect(isLegacyExport([1, 2])).toBe(false);
  });
});

describe("convertLegacyExport", () => {
  it("converts question progress correctly", () => {
    const data = {
      question3: JSON.stringify({
        page: 2,
        favPage: 0,
        "5": { isCorrect: [true, false, true] },
        "10": { isCorrect: [false] },
      }),
    };

    const { progress, stats } = convertLegacyExport(data);

    expect(stats.questionsImported).toBe(2);
    expect(stats.categoriesFound).toEqual(["3"]);

    const q5 = progress.questionStats["cat3_5"];
    expect(q5).toBeDefined();
    expect(q5!.attempts).toBe(3);
    expect(q5!.correct).toBe(2);
    expect(q5!.lastCorrect).toBe(true);

    const q10 = progress.questionStats["cat3_10"];
    expect(q10).toBeDefined();
    expect(q10!.attempts).toBe(1);
    expect(q10!.correct).toBe(0);
    expect(q10!.lastCorrect).toBe(false);
  });

  it("converts favorites to bookmarks", () => {
    const data = {
      question1: JSON.stringify({
        page: 0,
        "7": { isCorrect: [true] },
      }),
      question1Fav: JSON.stringify([7, 12]),
    };

    const { progress, stats } = convertLegacyExport(data);

    expect(stats.bookmarksImported).toBe(2);

    // Question 7 has both progress and bookmark
    const q7 = progress.questionStats["cat1_7"];
    expect(q7!.bookmarked).toBe(true);
    expect(q7!.attempts).toBe(1);

    // Question 12 is bookmarked but has no answer history
    const q12 = progress.questionStats["cat1_12"];
    expect(q12!.bookmarked).toBe(true);
    expect(q12!.attempts).toBe(0);
  });

  it("handles all three categories", () => {
    const data = {
      question1: JSON.stringify({ "1": { isCorrect: [true] } }),
      question2: JSON.stringify({ "1": { isCorrect: [true] } }),
      question3: JSON.stringify({ "1": { isCorrect: [true] } }),
    };

    const { stats } = convertLegacyExport(data);
    expect(stats.categoriesFound.sort()).toEqual(["1", "2", "3"]);
    expect(stats.questionsImported).toBe(3);
  });

  it("ignores non-question keys", () => {
    const data = {
      DarkMode: JSON.stringify({ isDark: true }),
      question1: JSON.stringify({ "1": { isCorrect: [true] } }),
      mtm_consent: "1",
    };

    const { stats } = convertLegacyExport(data);
    expect(stats.questionsImported).toBe(1);
  });

  it("handles malformed data gracefully", () => {
    const data = {
      question1: "not valid json",
      question2Fav: "not valid json",
      question3: JSON.stringify({ "1": { isCorrect: [true] } }),
    };

    const { stats } = convertLegacyExport(data);
    expect(stats.questionsImported).toBe(1);
    // "question1" key is still recognized as category even though its JSON is bad
    expect(stats.categoriesFound.sort()).toEqual(["1", "3"]);
  });
});
