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
import { safeParseCategory, parseCategory, isWithheld } from "@/lib/content/schema";

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
        sources: [{ pdf: "cat3/2023_08_18", question: 17, page: 5 }],
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

  it("rejects the same paper and pergunta cited twice", () => {
    const input = validCategory();
    input.questions[0]!.sources = [
      { pdf: "cat3/2023_08_18", question: 17, page: 5 },
      { pdf: "cat3/2023_08_18", question: 17, page: 5 },
    ];

    const result = safeParseCategory(input);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("more than once");
  });

  it("accepts the same paper cited at different perguntas", () => {
    const input = validCategory();
    input.questions[0]!.sources = [
      { pdf: "cat3/2023_08_18", question: 17, page: 5 },
      { pdf: "cat3/2023_08_18", question: 21, page: 6 },
    ];

    expect(safeParseCategory(input).success).toBe(true);
  });

  it("leaves an unresolved page as null rather than dropping the reference", () => {
    const input = validCategory();
    input.questions[0]!.sources = [{ pdf: "cat3/2023_08_18", question: 17 }];

    const parsed = parseCategory(input);
    expect(parsed.questions[0]!.sources[0]!.page).toBeNull();
    expect(parsed.questions[0]!.sources[0]!.question).toBe(17);
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
    zero.questions[0]!.sources = [{ pdf: "cat3/2023_08_18", question: 17, page: 0 }];
    expect(safeParseCategory(zero).success).toBe(false);

    const fractional = validCategory();
    fractional.questions[0]!.sources = [{ pdf: "cat3/2023_08_18", question: 17, page: 1.5 }];
    expect(safeParseCategory(fractional).success).toBe(false);
  });

  it("rejects a non-positive or fractional pergunta number", () => {
    const zero = validCategory();
    zero.questions[0]!.sources = [{ pdf: "cat3/2023_08_18", question: 0 }];
    expect(safeParseCategory(zero).success).toBe(false);
  });

  it("defaults a question to live and carries a withheld reason through", () => {
    expect(parseCategory(validCategory()).questions[0]!.disabled).toBeNull();
    expect(isWithheld(parseCategory(validCategory()).questions[0]!)).toBe(false);

    const withheld = validCategory() as Record<string, any>;
    withheld.questions[0]!.disabled = "retirada pela ANACOM";
    const q = parseCategory(withheld).questions[0]!;
    expect(q.disabled).toBe("retirada pela ANACOM");
    expect(isWithheld(q)).toBe(true);
  });

  it("rejects `disabled: true`, so the flag cannot parse and mean nothing", () => {
    // A boolean is what somebody actually wrote once. Zod stripped it as an
    // unknown key, the build shipped the question anyway, and nothing said so.
    // The reason is required precisely so that mistake is now loud.
    const input = validCategory() as Record<string, any>;
    input.questions[0]!.disabled = true;
    expect(safeParseCategory(input).success).toBe(false);
  });

  it("rejects an unknown frontmatter key rather than discarding it", () => {
    // The general form of the same bug: a mistyped or invented field used to
    // vanish silently, so the author saw no effect and no error.
    const input = validCategory() as Record<string, any>;
    input.questions[0]!.disbaled = "retirada";
    const result = safeParseCategory(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message).join(" ")).toMatch(/disbaled/);
    }
  });

  it("treats a question that omits `disabled` entirely as live", () => {
    // Hand-built questions reach the analysis helpers from test fixtures and
    // the legacy importer without going through the schema.
    expect(isWithheld({ disabled: undefined as unknown as string | null })).toBe(false);
  });

  it("trims surrounding whitespace rather than preserving it", () => {
    const input = validCategory();
    input.questions[0]!.answers[0]!.text = "  da IARU  ";

    expect(parseCategory(input).questions[0]!.answers[0]!.text).toBe("da IARU");
  });
});
