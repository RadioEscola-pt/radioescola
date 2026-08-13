/**
 * Content build: per-question source files -> shipped artifacts
 *
 * Source of truth is `content/questions/cat{n}/`:
 *   category.json   category metadata + the question order
 *   {id}.mdx        one question, frontmatter + explanation body
 *
 * Artifacts (generated, do not hand-edit):
 *   public/data/cat{n}.json        what the client fetches
 *   content/notes/cat{n}/{id}.mdx  what /api/notes serves
 *
 * Why `order` lives in a manifest rather than in each file: the legacy array
 * order is editorial, not id order — questions 210-213 sit at positions 8, 10,
 * 19 and 31, grouped by subject — and it drives the browse sequence, so it has
 * to survive the migration. A manifest keeps insertion a one-line diff instead
 * of renumbering every file after the insertion point, and it is validated
 * against the files present so the two cannot drift.
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { CategorySchema, type ContentCategory, type ContentQuestion } from "./schema";
import { parseQuestionFile, questionFileName, idFromFileName } from "./source";

export const CategoryManifestSchema = z.object({
  id: z.enum(["1", "2", "3"]),
  /** Legacy ANACOMFILE — the regulator's source document number. */
  anacomFile: z.number().int().positive(),
  /** Question ids in display order. */
  order: z.array(z.number().int().positive()).min(1),
});

export type CategoryManifest = z.infer<typeof CategoryManifestSchema>;

export const MANIFEST_FILE = "category.json";

/** Reads and validates one category's source directory. */
export function loadCategory(sourceDir: string): ContentCategory {
  const manifest = CategoryManifestSchema.parse(
    JSON.parse(readFileSync(join(sourceDir, MANIFEST_FILE), "utf-8"))
  );

  const filesOnDisk = readdirSync(sourceDir)
    .map((name) => ({ name, id: idFromFileName(name) }))
    .filter((f): f is { name: string; id: number } => f.id !== null);

  // Drift between the manifest and the directory is the failure mode a
  // separate order file introduces, so it is checked in both directions.
  const idsOnDisk = new Set(filesOnDisk.map((f) => f.id));
  const missing = manifest.order.filter((id) => !idsOnDisk.has(id));
  const unlisted = [...idsOnDisk].filter((id) => !manifest.order.includes(id));
  if (missing.length > 0 || unlisted.length > 0) {
    throw new Error(
      `${sourceDir}: manifest and files disagree` +
        (missing.length ? `\n  in order but no file: ${missing.join(", ")}` : "") +
        (unlisted.length ? `\n  file but not in order: ${unlisted.join(", ")}` : "")
    );
  }
  const duplicates = manifest.order.filter((id, i) => manifest.order.indexOf(id) !== i);
  if (duplicates.length > 0) {
    throw new Error(`${sourceDir}: duplicate ids in order: ${duplicates.join(", ")}`);
  }

  const questions = manifest.order.map((id) => {
    const name = questionFileName(id);
    return parseQuestionFile(readFileSync(join(sourceDir, name), "utf-8"), name);
  });

  return CategorySchema.parse({
    id: manifest.id,
    anacomFile: manifest.anacomFile,
    questions,
  });
}

export type CategoryArtifacts = {
  /** Contents of `public/data/cat{n}.json`. */
  appJson: string;
  /** Contents of `content/notes/cat{n}/{id}.mdx`, keyed by question id. */
  notes: Map<number, string>;
};

/**
 * Makes an image path absolute. This ran in the browser for every question on
 * every page load; the source form is public-relative ("images/cat3/x.png"),
 * so resolving it is a build concern.
 */
function absoluteImagePath(image: string, categoryId: string): string {
  if (image.startsWith("/")) return image;
  if (image.startsWith("images/")) return `/${image}`;
  return `/images/cat${categoryId}/${image}`;
}

/**
 * Projects a question into the shape the app consumes directly.
 *
 * Null and empty values are omitted rather than written out — the reader fills
 * them back in — which keeps the shipped payload smaller. The two legacy
 * gotchas are resolved here rather than at runtime: `answers` becomes
 * `options`, and `correctIndex` becomes 0-indexed.
 */
function toAppQuestion(
  q: ContentQuestion,
  categoryId: string
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: q.id,
    question: q.question,
    options: q.answers.map((a) => a.text),
    correctIndex: q.answers.findIndex((a) => a.correct),
  };

  if (q.explanation !== null) out.hasNotesMdx = true;
  if (q.sources.length > 0) out.fonte = q.sources;
  if (Object.keys(q.sourcePages).length > 0) out.fontePages = q.sourcePages;
  if (q.image !== null) out.img = absoluteImagePath(q.image, categoryId);
  if (q.tutorial !== null) out.tutorial = q.tutorial;
  if (q.topic !== null) out.materia = q.topic;
  if (q.calc !== null) out.calc = q.calc;

  return out;
}

/** Compiles a validated category into the files the app ships. */
export function emitCategory(category: ContentCategory): CategoryArtifacts {
  const notes = new Map<number, string>();
  for (const q of category.questions) {
    if (q.explanation !== null) {
      notes.set(q.id, `${q.explanation}\n`);
    }
  }

  const app = {
    category: category.id,
    anacomFile: category.anacomFile,
    questions: category.questions.map((q) => toAppQuestion(q, category.id)),
  };

  return {
    appJson: `${JSON.stringify(app, null, 2)}\n`,
    notes,
  };
}

/** Serializes a manifest in the format the migration writes. */
export function serializeManifest(manifest: CategoryManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
