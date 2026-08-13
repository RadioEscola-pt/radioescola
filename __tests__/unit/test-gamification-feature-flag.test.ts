/**
 * Unit tests: gamification build flag
 *
 * `GAMIFICATION_ENABLED` is inlined at build time, so these tests stub the
 * config module and re-import the consumers to exercise both builds.
 *
 * The invariant that matters: the build flag must win over the user's stored
 * `settings.enabled`. A disabled build has no UI to turn gamification back on,
 * so saved state saying "enabled" must not resurrect it.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  createInitialGamificationState,
  type GamificationState,
} from "@/lib/types/gamification";

/** Re-imports the hook with the build flag stubbed, and returns `isEnabled`. */
async function isEnabledWithFlag(
  flag: boolean,
  state: GamificationState | null
): Promise<boolean> {
  vi.resetModules();
  vi.doMock("@/lib/config/features", () => ({ GAMIFICATION_ENABLED: flag }));
  const { useGamification } = await import("@/hooks/useGamification");
  const { result } = renderHook(() => useGamification(state));
  return result.current.isEnabled;
}

afterEach(() => {
  vi.doUnmock("@/lib/config/features");
  vi.resetModules();
});

describe("Gamification build flag", () => {
  it("reports disabled when the build flag is off, even if stored state is enabled", async () => {
    const state = createInitialGamificationState();
    expect(state.settings.enabled).toBe(true); // stored state says on

    expect(await isEnabledWithFlag(false, state)).toBe(false);
  });

  it("respects stored state when the build flag is on", async () => {
    const state = createInitialGamificationState();

    expect(await isEnabledWithFlag(true, state)).toBe(true);
  });

  it("stays disabled when the build flag is on but the user turned it off", async () => {
    const state = createInitialGamificationState();
    state.settings.enabled = false;

    expect(await isEnabledWithFlag(true, state)).toBe(false);
  });

  it("defaults to disabled for missing state when the build flag is off", async () => {
    expect(await isEnabledWithFlag(false, null)).toBe(false);
  });
});
