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
    /** Official exam papers this question appears in, e.g. "cat3/2023_08_18p17". */
    sources: z.array(TrimmedString).default([]),
    /** Maps a `sources` entry to the PDF page it appears on. */
    sourcePages: z.record(z.string(), z.number().int().positive()).default({}),
    /** Public-relative image path, e.g. "images/cat3/foo.png". */
    image: OptionalText,
    tutorial: OptionalText,
    calc: OptionalText,
    /** Prose explanation. Becomes the MDX body once questions own their notes. */
    explanation: OptionalText,
  })
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

    // A page reference to a source the question does not cite is a dangling
    // pointer, and the most likely way this data goes subtly wrong.
    const dangling = Object.keys(q.sourcePages).filter(
      (key) => !q.sources.includes(key)
    );
    if (dangling.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `question ${q.id} has sourcePages keys not present in sources: ${dangling.join(
          ", "
        )}`,
        path: ["sourcePages"],
      });
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

/** Parses and validates a category, throwing a readable error on bad data. */
export function parseCategory(input: unknown): ContentCategory {
  return CategorySchema.parse(input);
}

/** Validates a category without throwing; use to report every problem at once. */
export function safeParseCategory(input: unknown) {
  return CategorySchema.safeParse(input);
}
