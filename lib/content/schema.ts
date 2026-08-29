/**
 * Canonical content schema
 *
 * This is the single definition of what a question *is*. Types are inferred
 * from it rather than declared alongside it, so the runtime validation and the
 * compile-time types cannot drift apart.
 *
 * It describes the shape authors will edit (one file per question), not the
 * legacy `public/data/cat{n}.json` shape — see `./legacy.ts` for the adapter
 * between the two. Differences from legacy are deliberate:
 *
 * - `answers` carry their own `correct` flag, replacing the 1-indexed
 *   `correctIndex` that has to be decremented everywhere it is read.
 * - Absent values are consistently `null` / `[]` / `{}` rather than a mix of
 *   missing keys, nulls and empty strings.
 * - `topic` exists as a real field, so question -> study-guide mapping has
 *   somewhere to live.
 */
import { z } from "zod";

/** A non-empty string with surrounding whitespace removed. */
const TrimmedString = z.string().transform((s) => s.trim()).pipe(z.string().min(1));

/**
 * Optional text: null when absent or blank, trimmed otherwise.
 *
 * `.nullish()` so source files may omit the key entirely rather than writing
 * `topic: null` on every question.
 */
const OptionalText = z
  .string()
  .nullish()
  .transform((s) => {
    if (typeof s !== "string") return null;
    const trimmed = s.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const AnswerSchema = z.object({
  text: TrimmedString,
  /** Exactly one answer per question carries `correct: true`. */
  correct: z.boolean().default(false),
});

/**
 * A place this question appears in an official exam paper.
 *
 * Replaces the old pair of a composite string ("cat3/2023_08_18p4") and a
 * parallel `sourcePages` map. That split needed a cross-field invariant to stay
 * consistent, forced the same filename-and-number regex to be reimplemented in
 * three places, and made "does this PDF exist?" unanswerable without parsing.
 *
 * The two numbers are unrelated and both are needed: `question` is the pergunta
 * number printed in the paper, `page` is the PDF page it is printed on. These
 * papers carry about four questions per page, so pergunta 17 is on page 5.
 */
export const SourceRefSchema = z.object({
  /** Folder and file stem under public/exams, e.g. "cat3/2023_08_18". */
  pdf: TrimmedString,
  /** Pergunta number as printed in the paper. */
  question: z.number().int().positive(),
  /** PDF page it appears on. Null until somebody resolves it. */
  page: z
    .number()
    .int()
    .positive()
    .nullish()
    .transform((p) => p ?? null),
});

export const QuestionSchema = z
  .object({
    /** Stable identifier, unique within a category (legacy `uniqueID`). */
    id: z.number().int().positive(),
    question: TrimmedString,
    answers: z.array(AnswerSchema).min(2),
    /**
     * Topic slug used to join questions to study guides. Null until the
     * taxonomy is applied — legacy `materia` is empty on every question.
     */
    topic: OptionalText,
    /**
     * Why this question is withheld from the build; null when it is live.
     *
     * A withheld question stays in its file and keeps its place in the
     * category's `order`, so the id is never reissued and the question is
     * still compared against by `qbank` and by `content:new` — a withdrawn
     * question must go on blocking an accidental re-add of the same thing.
     * `emitCategory` is the single point that drops it from the artifacts.
     *
     * A reason string rather than a boolean on purpose: `disabled: true`
     * is then a schema error rather than something that parses and means
     * nothing, and the next reader learns why without a git archaeology dig.
     */
    disabled: OptionalText,
    /** Official exam papers this question appears in. */
    sources: z.array(SourceRefSchema).default([]),
    /** Public-relative image path, e.g. "images/cat3/foo.png". */
    image: OptionalText,
    tutorial: OptionalText,
    calc: OptionalText,
    /** Prose explanation. Becomes the MDX body once questions own their notes. */
    explanation: OptionalText,
  })
  // Unknown keys are an error, not something to discard. Zod strips them by
  // default, which made an invented frontmatter field (`disabled: true`, once)
  // parse cleanly and do nothing at all — the silent-typo failure that `topic`
  // being free text already causes. Nothing in the bank uses a key outside
  // this list, so the strictness costs nothing and catches the next one.
  .strict()
  // superRefine rather than refine: Zod 4 takes a static object as refine's
  // second argument, so this is the way to keep the offending question's id
  // and values in the message.
  .superRefine((q, ctx) => {
    const correct = q.answers.filter((a) => a.correct).length;
    if (correct !== 1) {
      ctx.addIssue({
        code: "custom",
        message: `question ${q.id} must have exactly one correct answer, found ${correct}`,
        path: ["answers"],
      });
    }

    // The old shape needed a check that every `sourcePages` key was also in
    // `sources`; nesting makes that unrepresentable. What remains expressible
    // is a question citing the same paper and pergunta twice, which is a
    // duplicate rather than two appearances.
    const seen = new Set<string>();
    for (const s of q.sources) {
      const key = `${s.pdf}#${s.question}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `question ${q.id} cites ${s.pdf} pergunta ${s.question} more than once`,
          path: ["sources"],
        });
      }
      seen.add(key);
    }
  });

export const CategorySchema = z.object({
  /** Category id: "1", "2" or "3". */
  id: z.enum(["1", "2", "3"]),
  /** Legacy `ANACOMFILE` — the regulator's source document number. */
  anacomFile: z.number().int().positive(),
  questions: z.array(QuestionSchema),
});

export type Answer = z.infer<typeof AnswerSchema>;
export type ContentQuestion = z.infer<typeof QuestionSchema>;
export type ContentCategory = z.infer<typeof CategorySchema>;

/**
 * Whether a question is withheld from the build.
 *
 * One name for the concept, used by the compiler, `qbank` and the authoring
 * review alike, and `!= null` rather than `=== null` so a hand-built question
 * that simply omits the field — a test fixture, a legacy import — reads as
 * live rather than as withheld-with-an-undefined-reason.
 */
export function isWithheld(q: Pick<ContentQuestion, "disabled">): boolean {
  return q.disabled != null;
}

/** Parses and validates a category, throwing a readable error on bad data. */
export function parseCategory(input: unknown): ContentCategory {
  return CategorySchema.parse(input);
}

/** Validates a category without throwing; use to report every problem at once. */
export function safeParseCategory(input: unknown) {
  return CategorySchema.safeParse(input);
}
