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
import { existsSync, readFileSync, readdirSync } from "fs";
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
  if (q.sources.length > 0) {
    // Same nesting as the source files, minus unresolved pages: the client
    // only needs `page` when there is one to link to.
    out.sources = q.sources.map((s) =>
      s.page === null
        ? { pdf: s.pdf, question: s.question }
        : { pdf: s.pdf, question: s.question, page: s.page }
    );
  }
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

export type DanglingPdf = {
  /** The `pdf` value that does not resolve, e.g. "cat1/2014_12_19". */
  pdf: string;
  /** How many references point at it. */
  refs: number;
  /** Categories whose folder does contain a file of that name. */
  alsoIn: string[];
  /** Listed in the baseline, so it does not fail the check. */
  known: boolean;
};

/**
 * Finds source references pointing at exam PDFs that are not on disk.
 *
 * Only possible now that `pdf` is a field: under the old composite-string
 * format, recovering the filename needed a regex, so nothing checked this and
 * dead references accumulated unnoticed.
 *
 * `alsoIn` exists because most of them are not missing at all — the same paper
 * sits under a different category folder, and the reference's prefix is simply
 * wrong. That is a content fix rather than something to guess at here, so it is
 * reported, not repaired.
 */
export function findDanglingPdfs(
  categories: ContentCategory[],
  examsDir: string,
  baseline: Set<string>
): DanglingPdf[] {
  const counts = new Map<string, number>();
  for (const category of categories) {
    for (const q of category.questions) {
      for (const s of q.sources) {
        if (existsSync(join(examsDir, `${s.pdf}.pdf`))) continue;
        counts.set(s.pdf, (counts.get(s.pdf) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .map(([pdf, refs]) => {
      const stem = pdf.slice(pdf.indexOf("/") + 1);
      const alsoIn = (["1", "2", "3"] as const).filter(
        (c) => `cat${c}` !== pdf.split("/")[0] && existsSync(join(examsDir, `cat${c}`, `${stem}.pdf`))
      ).map((c) => `cat${c}`);
      return { pdf, refs, alsoIn, known: baseline.has(pdf) };
    })
    .sort((a, b) => b.refs - a.refs);
}

/** Baseline of references known to point at papers we do not have. */
export const MISSING_EXAMS_FILE = join("content", "missing-exams.json");

export function loadMissingExamsBaseline(root: string): Set<string> {
  const path = join(root, MISSING_EXAMS_FILE);
  if (!existsSync(path)) return new Set();
  const parsed = JSON.parse(readFileSync(path, "utf-8")) as { pdfs?: string[] };
  return new Set(parsed.pdfs ?? []);
}

/** Serializes a manifest in the format the migration writes. */
export function serializeManifest(manifest: CategoryManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
