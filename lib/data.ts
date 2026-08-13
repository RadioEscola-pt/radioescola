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

type RawQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  hasNotesMdx?: boolean;
  fonte?: string[];
  fontePages?: Record<string, number>;
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
    fonte: raw.fonte ?? null,
    fontePages: raw.fontePages ?? null,
    tutorial: raw.tutorial ?? null,
    materia: raw.materia ?? null,
    calc: raw.calc ?? null,
  };
}

export async function loadData(): Promise<Data> {
  const categoriesEntries = await Promise.all(
    CATEGORIES.map(async (cat): Promise<[string, Category]> => {
      const res = await fetch(`/data/cat${cat}.json`);
      if (!res.ok) {
        return [cat, { id: cat, name: `Category ${cat}`, questions: [] }];
      }
      const raw = (await res.json()) as { questions?: RawQuestion[] };
      return [
        cat,
        {
          id: cat,
          name: `Category ${cat}`,
          questions: (raw.questions ?? []).map(toQuestion),
        },
      ];
    })
  );
  const categories = Object.fromEntries(categoriesEntries) as Record<string, Category>;
  return { categories };
}
