/**
 * Study-streak derivation.
 *
 * Streaks are computed from `UserProgress.activeDays` — the set of local
 * calendar days the user studied — rather than incremented in place. An
 * incremented counter cannot be merged between two devices and cannot be
 * recomputed once it drifts; a set of days can be unioned, and every streak
 * number falls out of it.
 *
 * Day strings are local calendar days produced by `toLocalDateString`
 * (Portugal/WEST, not UTC). They are only ever *compared* and *stepped* here,
 * which is done through UTC so DST never shortens or lengthens a step.
 */

const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` → UTC epoch ms. Returns NaN for anything malformed. */
function dayToUtcMs(day: string): number {
  const parts = day.split("-");
  if (parts.length !== 3) return NaN;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const date = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(date)) {
    return NaN;
  }
  return Date.UTC(year, month - 1, date);
}

function utcMsToDay(ms: number): string {
  const d = new Date(ms);
  const year = String(d.getUTCFullYear()).padStart(4, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const date = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/** Move a `YYYY-MM-DD` day string by whole days. */
export function shiftDay(day: string, deltaDays: number): string {
  const ms = dayToUtcMs(day);
  if (Number.isNaN(ms)) return day;
  return utcMsToDay(ms + deltaDays * DAY_MS);
}

/**
 * Add a day to the set, keeping it sorted and unique.
 * Returns the original array unchanged when the day is already present, so
 * callers can cheaply skip a write.
 */
export function addActiveDay(activeDays: string[], day: string): string[] {
  if (activeDays.includes(day)) return activeDays;
  return [...activeDays, day].sort();
}

/** Sort, de-duplicate and drop anything that is not a usable day string. */
export function normalizeActiveDays(activeDays: readonly string[]): string[] {
  const seen = new Set<string>();
  for (const day of activeDays) {
    if (typeof day === "string" && !Number.isNaN(dayToUtcMs(day))) {
      seen.add(day);
    }
  }
  return [...seen].sort();
}

export interface DerivedStreaks {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

/**
 * Derive every streak number from the set of active days.
 *
 * `currentStreak` counts the consecutive run ending today, or — if the user
 * has not studied yet today — the run ending yesterday, which is what keeps a
 * streak visibly alive between sessions. Anything older reads as 0.
 */
export function deriveStreaks(activeDays: readonly string[], today: string): DerivedStreaks {
  const days = normalizeActiveDays(activeDays);
  if (days.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1] as string;
    const curr = days[i] as string;
    run = shiftDay(prev, 1) === curr ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const last = days[days.length - 1] as string;
  const yesterday = shiftDay(today, -1);

  let current = 0;
  if (last === today || last === yesterday) {
    current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const prev = days[i - 1] as string;
      const curr = days[i] as string;
      if (shiftDay(prev, 1) !== curr) break;
      current++;
    }
  }

  return { currentStreak: current, longestStreak: longest, lastStudyDate: last };
}

/**
 * Reconstruct the days a pre-V5 streak implies, so migrating does not collapse
 * a visible streak to 1.
 *
 * A stored `currentStreak` of 12 ending on `lastStudyDate` means exactly those
 * 12 consecutive days were study days. Every earlier day is unrecoverable —
 * it was never written down — which is why V5 starts recording them.
 */
export function backfillActiveDays(
  lastStudyDate: string | null,
  currentStreak: number
): string[] {
  if (!lastStudyDate || Number.isNaN(dayToUtcMs(lastStudyDate))) return [];

  const span = Math.max(1, Math.min(currentStreak, 3650));
  const days: string[] = [];
  for (let i = span - 1; i >= 0; i--) {
    days.push(shiftDay(lastStudyDate, -i));
  }
  return days;
}
