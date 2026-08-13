/**
 * Round-trip tests: legacy cat3 data <-> canonical content model
 *
 * The safety property for the content migration: importing the real
 * `public/data/cat3.json` into the canonical model and emitting it back must
 * reproduce the file's questions exactly — same values, same key presence.
 * If that holds, exploding the JSON into per-question files loses nothing.
 *
 * `cat3.json` has been normalized to be exactly this pipeline's output, so the
 * final test asserts byte equality: the committed artifact and the compiled
 * artifact cannot drift. Hand-editing the JSON, or changing the emitter, fails
 * here. The structural checks are kept alongside it because they localize a
 * failure to a question and field, which a byte diff does not.
 *
 * Key *presence* is checked exactly, not just values, since a missing vs. null
 * `fontePages` is a difference the app could observe.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  fromLegacy,
  safeFromLegacy,
  toLegacy,
  serializeLegacy,
  type LegacyCategory,
  type LegacyQuestion,
} from "@/lib/content/legacy";

const CAT3_PATH = resolve(__dirname, "../../public/data/cat3.json");
const raw = readFileSync(CAT3_PATH, "utf-8");
const original = JSON.parse(raw) as LegacyCategory;

/** Key sets, so "present and null" is distinguished from "absent". */
function keysOf(q: LegacyQuestion): string[] {
  return Object.keys(q).sort();
}

describe("cat3 content round-trip", () => {
  it("validates every question against the canonical schema", () => {
    const result = safeFromLegacy(original, "3");

    // Report the actual failures rather than a bare boolean.
    if (!result.success) {
      throw new Error(
        `schema rejected ${result.error.issues.length} value(s):\n` +
          result.error.issues
            .slice(0, 20)
            .map((i) => `  ${i.path.join(".")}: ${i.message}`)
            .join("\n")
      );
    }
    expect(result.success).toBe(true);
  });

  it("preserves the question count and ANACOMFILE", () => {
    const emitted = toLegacy(fromLegacy(original, "3"));

    expect(emitted.questions).toHaveLength(original.questions.length);
    expect(emitted.ANACOMFILE).toBe(original.ANACOMFILE);
  });

  it("reproduces every question exactly, key presence included", () => {
    const emitted = toLegacy(fromLegacy(original, "3"));

    const mismatches: string[] = [];
    original.questions.forEach((before, index) => {
      const after = emitted.questions[index];
      if (!after) {
        mismatches.push(`#${index}: missing from output`);
        return;
      }
      if (JSON.stringify(keysOf(before)) !== JSON.stringify(keysOf(after))) {
        mismatches.push(
          `#${index} (id ${before.uniqueID}): keys ${keysOf(before).join(",")} -> ${keysOf(
            after
          ).join(",")}`
        );
        return;
      }
      for (const key of keysOf(before)) {
        const a = (before as unknown as Record<string, unknown>)[key];
        const b = (after as unknown as Record<string, unknown>)[key];
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          mismatches.push(
            `#${index} (id ${before.uniqueID}) ${key}: ${JSON.stringify(
              a
            )} -> ${JSON.stringify(b)}`
          );
        }
      }
    });

    expect(mismatches.slice(0, 10)).toEqual([]);
  });

  it("assigns exactly one correct answer per question, matching legacy correctIndex", () => {
    const canonical = fromLegacy(original, "3");

    canonical.questions.forEach((q, index) => {
      const legacy = original.questions[index]!;
      const correctPositions = q.answers
        .map((a, i) => (a.correct ? i : -1))
        .filter((i) => i >= 0);

      expect(correctPositions).toHaveLength(1);
      // Canonical is 0-indexed, legacy is 1-indexed.
      expect(correctPositions[0]).toBe(legacy.correctIndex - 1);
      expect(q.answers[correctPositions[0]!]!.text).toBe(
        legacy.answers[legacy.correctIndex - 1]
      );
    });
  });

  it("is a fixpoint: re-importing emitted output changes nothing", () => {
    const once = serializeLegacy(toLegacy(fromLegacy(original, "3")));
    const twice = serializeLegacy(
      toLegacy(fromLegacy(JSON.parse(once), "3"))
    );

    expect(twice).toBe(once);
  });

  it("rejects an out-of-range correctIndex instead of clamping it", () => {
    // The runtime loader silently clamps this to a valid option, which turns
    // a data error into a question with the wrong answer marked correct.
    const broken = structuredClone(original);
    broken.questions[0]!.correctIndex = 99;

    const result = safeFromLegacy(broken, "3");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("exactly one correct answer");
  });

  it("rejects a sourcePages key that is not a cited source", () => {
    const broken = structuredClone(original);
    broken.questions[0]!.fontePages = { "cat3/not-a-real-source": 5 };

    const result = safeFromLegacy(broken, "3");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("not present in sources");
  });

  it("rejects a question with fewer than two answers", () => {
    const broken = structuredClone(original);
    broken.questions[0]!.answers = ["only one"];

    const result = safeFromLegacy(broken, "3");

    expect(result.success).toBe(false);
  });

  it("reproduces the committed file byte for byte", () => {
    const emitted = serializeLegacy(toLegacy(fromLegacy(original, "3")));

    // The strongest form of the migration safety property: what the compiler
    // emits is what is on disk. Also guards against hand-edits to the
    // generated artifact once authoring moves to per-question files.
    expect(emitted).toBe(raw);
  });
});
