/**
 * Build-time feature flags
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so each constant
 * below collapses to a literal `true`/`false` and the guarded branches are
 * decided at compile time rather than per render. Flipping a flag therefore
 * requires a rebuild, not just a restart.
 *
 * The `process.env.X` access must stay written out literally for the inlining
 * to happen — destructuring or dynamic lookup silently defeats it.
 *
 * NOTE: this does *not* currently shrink the bundle. Measured builds differ by
 * ~100 bytes with gamification off, because `useGamification` runs on every
 * page via ProgressProvider and statically imports the achievement/level data,
 * so nothing becomes unreachable enough to tree-shake. The flags are a
 * behavioural kill switch, not a code-splitting mechanism.
 */

/**
 * Gamification (XP, levels, achievements, daily goals, streak calendar).
 * Disabled unless `NEXT_PUBLIC_GAMIFICATION=true` at build time.
 *
 * When off, no XP or achievements are awarded and none of the gamification UI
 * renders. Any progress already in localStorage is left untouched, so turning
 * the flag back on restores it.
 */
export const GAMIFICATION_ENABLED =
  process.env.NEXT_PUBLIC_GAMIFICATION === "true";
