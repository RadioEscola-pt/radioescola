import { Data, Category, Question } from './types';
import { CATEGORIES } from './config';

/**
 * Question data is compiled from `content/questions/**` by `content:build`,
 * already in the shape this module returns: options rather than `answers`,
 * 0-indexed `correctIndex`, absolute image paths, and `hasNotesMdx` resolved.
 *
 * So there is deliberately no normalization here. It used to run in the
 * browser over all 1,015 questions on every page load — rewriting image paths,
 * coercing `fonte`, clamping `correctIndex` — plus a second request for
 * `notes-index.json` to discover which questions had explanations. All of that
 * is now a build concern; anything malformed fails `content:check` instead of
 * being silently patched up per visitor.
 *
 * Absent optional fields are omitted from the JSON to keep it small, so they
 * are filled back in here to keep `Question` a fixed shape for consumers.
 */

export type RawQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  hasNotesMdx?: boolean;
  sources?: { pdf: string; question: number; page?: number; unavailable?: boolean }[];
  img?: string;
  tutorial?: string;
  materia?: string;
  calc?: string;
};

function toQuestion(raw: RawQuestion): Question {
  return {
    id: raw.id,
    question: raw.question,
    options: raw.options,
    correctIndex: raw.correctIndex,
    img: raw.img ?? null,
    // Inline notes were migrated into content/notes/ and are served by
    // /api/notes; the field remains only as QuestionCard's fallback.
    notes: null,
    hasNotesMdx: raw.hasNotesMdx ?? false,
    sources: raw.sources ?? null,
    tutorial: raw.tutorial ?? null,
    materia: raw.materia ?? null,
    calc: raw.calc ?? null,
  };
}

/**
 * Builds a category from a parsed artifact. Shared with `/api/data`, which
 * reads the same files from disk rather than over HTTP.
 */
export function buildCategory(
  cat: string,
  raw: { questions?: RawQuestion[] }
): Category {
  return {
    id: cat,
    name: `Category ${cat}`,
    questions: (raw.questions ?? []).map(toQuestion),
  };
}

/** Client-side loader: the relative URL means this only runs in the browser. */
export async function loadData(): Promise<Data> {
  const categoriesEntries = await Promise.all(
    CATEGORIES.map(async (cat): Promise<[string, Category]> => {
      const res = await fetch(`/data/cat${cat}.json`);
      if (!res.ok) {
        return [cat, { id: cat, name: `Category ${cat}`, questions: [] }];
      }
      return [cat, buildCategory(cat, await res.json())];
    })
  );
  const categories = Object.fromEntries(categoriesEntries) as Record<string, Category>;
  return { categories };
}
