import { describe, it, expect } from "vitest";
import {
  shiftDay,
  addActiveDay,
  normalizeActiveDays,
  deriveStreaks,
  backfillActiveDays,
} from "@/lib/streaks";

describe("shiftDay", () => {
  it("steps across a month boundary", () => {
    expect(shiftDay("2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("steps across a year boundary", () => {
    expect(shiftDay("2025-12-31", 1)).toBe("2026-01-01");
    expect(shiftDay("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("handles leap days", () => {
    expect(shiftDay("2028-02-28", 1)).toBe("2028-02-29");
    expect(shiftDay("2028-03-01", -1)).toBe("2028-02-29");
  });

  it("steps by whole days across a DST change (Portugal springs forward 29 Mar 2026)", () => {
    expect(shiftDay("2026-03-28", 1)).toBe("2026-03-29");
    expect(shiftDay("2026-03-29", 1)).toBe("2026-03-30");
  });

  it("leaves an unparseable day alone", () => {
    expect(shiftDay("nonsense", 1)).toBe("nonsense");
  });
});

describe("addActiveDay", () => {
  it("keeps the set sorted", () => {
    expect(addActiveDay(["2026-08-03", "2026-08-01"], "2026-08-02")).toEqual([
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
    ]);
  });

  it("returns the same array when the day is already present", () => {
    const days = ["2026-08-01"];
    expect(addActiveDay(days, "2026-08-01")).toBe(days);
  });
});

describe("normalizeActiveDays", () => {
  it("sorts, de-duplicates and drops junk", () => {
    expect(
      normalizeActiveDays(["2026-08-02", "2026-08-01", "2026-08-02", "", "oops"])
    ).toEqual(["2026-08-01", "2026-08-02"]);
  });
});

describe("deriveStreaks", () => {
  it("reports nothing for an empty set", () => {
    expect(deriveStreaks([], "2026-08-25")).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    });
  });

  it("counts a run ending today", () => {
    const days = ["2026-08-23", "2026-08-24", "2026-08-25"];
    expect(deriveStreaks(days, "2026-08-25")).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      lastStudyDate: "2026-08-25",
    });
  });

  it("keeps a streak alive on a day the user has not studied yet", () => {
    const days = ["2026-08-23", "2026-08-24"];
    expect(deriveStreaks(days, "2026-08-25").currentStreak).toBe(2);
  });

  it("breaks a streak once a whole day is missed", () => {
    const days = ["2026-08-22", "2026-08-23"];
    expect(deriveStreaks(days, "2026-08-25").currentStreak).toBe(0);
  });

  it("finds the longest run even when it is not the current one", () => {
    const days = [
      "2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04",
      "2026-08-24", "2026-08-25",
    ];
    expect(deriveStreaks(days, "2026-08-25")).toEqual({
      currentStreak: 2,
      longestStreak: 4,
      lastStudyDate: "2026-08-25",
    });
  });

  it("is order-independent", () => {
    const shuffled = ["2026-08-25", "2026-08-23", "2026-08-24"];
    expect(deriveStreaks(shuffled, "2026-08-25").currentStreak).toBe(3);
  });

  it("counts a run that spans a month boundary", () => {
    const days = ["2026-07-30", "2026-07-31", "2026-08-01"];
    expect(deriveStreaks(days, "2026-08-01").currentStreak).toBe(3);
  });
});

describe("backfillActiveDays", () => {
  it("returns nothing when there is no last study date", () => {
    expect(backfillActiveDays(null, 7)).toEqual([]);
  });

  it("reconstructs exactly the days the stored streak implies", () => {
    expect(backfillActiveDays("2026-08-25", 3)).toEqual([
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
    ]);
  });

  it("still records the last study day when the streak counter is 0", () => {
    expect(backfillActiveDays("2026-08-25", 0)).toEqual(["2026-08-25"]);
  });

  it("round-trips through deriveStreaks without changing the visible streak", () => {
    const days = backfillActiveDays("2026-08-25", 12);
    expect(deriveStreaks(days, "2026-08-25").currentStreak).toBe(12);
  });
});
