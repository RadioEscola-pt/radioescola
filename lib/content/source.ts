/**
 * Per-question source files
 *
 * One question is one file: `content/questions/cat{n}/{id}.mdx`, with the
 * structured fields in YAML frontmatter and the explanation as the MDX body.
 * This replaces the three-places-per-question split (a row in cat{n}.json, a
 * file in content/notes/, an entry in notes-index.json) with a single edit
 * surface — so writing a missing explanation is editing the question, not
 * hunting a parallel tree.
 *
 * Files are named with a zero-padded id so directory listings sort correctly;
 * `parseQuestionFile` checks the name against the frontmatter id, since a
 * mismatch would silently reassign an explanation to the wrong question.
 */
import matter from "gray-matter";
import { QuestionSchema, type ContentQuestion } from "./schema";

/** Zero-padded filename for a question id, e.g. 42 -> "0042.mdx". */
export function questionFileName(id: number): string {
  return `${String(id).padStart(4, "0")}.mdx`;
}

/** Extracts the id from a question filename, or null if it is not one. */
export function idFromFileName(name: string): number | null {
  const match = /^(\d+)\.mdx$/.exec(name);
  if (!match) return null;
  const id = Number.parseInt(match[1]!, 10);
  return Number.isNaN(id) ? null : id;
}

/**
 * Parses one question file. `filename` is used only to verify it agrees with
 * the frontmatter id.
 */
export function parseQuestionFile(raw: string, filename: string): ContentQuestion {
  const { data, content } = matter(raw);

  // The body is the explanation. Blank body (a stub) means no explanation yet.
  const explanation = content.trim().length > 0 ? content.trim() : null;

  const question = QuestionSchema.parse({ ...data, explanation });

  const expected = idFromFileName(filename);
  if (expected !== null && expected !== question.id) {
    throw new Error(
      `${filename}: frontmatter id ${question.id} does not match filename id ${expected}`
    );
  }

  return question;
}

/**
 * Serializes a question to its file form. Null and empty values are omitted
 * rather than written out, so a file shows only what is actually set — the
 * schema fills the rest back in on read.
 */
export function serializeQuestionFile(q: ContentQuestion): string {
  const frontmatter: Record<string, unknown> = {
    id: q.id,
    // Second, right under the id: a withheld question should announce itself
    // in the first two lines rather than hide behind the options.
    ...(q.disabled === null ? {} : { disabled: q.disabled }),
    question: q.question,
    answers: q.answers.map((a) =>
      // `correct` is omitted on wrong answers: with exactly one correct answer
      // per question, the flag is only worth writing where it is true.
      a.correct ? { text: a.text, correct: true } : { text: a.text }
    ),
  };

  if (q.topic !== null) frontmatter.topic = q.topic;
  if (q.sources.length > 0) {
    // `page` is omitted while unresolved rather than written as null, so a
    // file shows only what is actually known.
    frontmatter.sources = q.sources.map((s) =>
      s.page === null
        ? { pdf: s.pdf, question: s.question }
        : { pdf: s.pdf, question: s.question, page: s.page }
    );
  }
  if (q.image !== null) frontmatter.image = q.image;
  if (q.tutorial !== null) frontmatter.tutorial = q.tutorial;
  if (q.calc !== null) frontmatter.calc = q.calc;

  return matter.stringify(q.explanation ?? "", frontmatter);
}
