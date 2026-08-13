/**
 * Schema validation tests
 *
 * These cover what the canonical schema *rejects*. A validation layer that
 * only ever passes is worth nothing, and these are the errors the old runtime
 * loader used to absorb silently — most importantly an out-of-range
 * `correctIndex`, which it clamped, turning a data error into a question with
 * the wrong answer marked correct.
 */
import { describe, it, expect } from "vitest";
import { safeParseCategory, parseCategory } from "@/lib/content/schema";

/** A minimal valid category; each test breaks one thing. */
function validCategory() {
  return {
    id: "3",
    anacomFile: 90,
    questions: [
      {
        id: 1,
        question: "O Regulamento das Radiocomunicações é uma publicação",
        answers: [
          { text: "da IARU" },
          { text: "da UIT", correct: true },
          { text: "da NATO" },
        ],
        sources: ["cat3/2023_08_18p17"],
        sourcePages: { "cat3/2023_08_18p17": 5 },
      },
    ],
  };
}

describe("canonical schema", () => {
  it("accepts a valid category and fills defaults", () => {
    const parsed = parseCategory(validCategory());
    const q = parsed.questions[0]!;

    expect(q.topic).toBeNull();
    expect(q.image).toBeNull();
    expect(q.calc).toBeNull();
    expect(q.explanation).toBeNull();
    expect(q.answers[0]!.correct).toBe(false);
  });

  it("rejects a question with no correct answer", () => {
    const input = validCategory();
    input.questions[0]!.answers.forEach((a) => {
      (a as { correct?: boolean }).correct = false;
    });

    const result = safeParseCategory(input);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("exactly one correct answer");
  });

  it("rejects a question with more than one correct answer", () => {
    const input = validCategory();
    (input.questions[0]!.answers[0] as { correct?: boolean }).correct = true;

    const result = safeParseCategory(input);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("found 2");
  });

  it("rejects a sourcePages key that is not a cited source", () => {
    const input = validCategory();
    input.questions[0]!.sourcePages = { "cat3/not-a-real-source": 5 };

    const result = safeParseCategory(input);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("not present in sources");
  });

  it("rejects a question with fewer than two answers", () => {
    const input = validCategory();
    input.questions[0]!.answers = [{ text: "only one", correct: true }];

    expect(safeParseCategory(input).success).toBe(false);
  });

  it("rejects a blank question or answer", () => {
    const blankQuestion = validCategory();
    blankQuestion.questions[0]!.question = "   ";
    expect(safeParseCategory(blankQuestion).success).toBe(false);

    const blankAnswer = validCategory();
    blankAnswer.questions[0]!.answers[0]!.text = "";
    expect(safeParseCategory(blankAnswer).success).toBe(false);
  });

  it("rejects a non-positive or fractional page number", () => {
    const zero = validCategory();
    zero.questions[0]!.sourcePages = { "cat3/2023_08_18p17": 0 };
    expect(safeParseCategory(zero).success).toBe(false);

    const fractional = validCategory();
    fractional.questions[0]!.sourcePages = { "cat3/2023_08_18p17": 1.5 };
    expect(safeParseCategory(fractional).success).toBe(false);
  });

  it("trims surrounding whitespace rather than preserving it", () => {
    const input = validCategory();
    input.questions[0]!.answers[0]!.text = "  da IARU  ";

    expect(parseCategory(input).questions[0]!.answers[0]!.text).toBe("da IARU");
  });
});
