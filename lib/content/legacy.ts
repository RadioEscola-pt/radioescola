/**
 * Legacy adapter: `public/data/cat{n}.json` <-> canonical content model
 *
 * All three categories have been migrated, so this is import-only: it exists
 * for `scripts/content-migrate.ts` and for re-running a migration from an
 * archived JSON file. The matching emitter was removed once the shipped
 * artifacts stopped being legacy-shaped — `lib/content/build.ts` now emits the
 * app-ready form directly.
 */
import { parseCategory, safeParseCategory, type ContentCategory } from "./schema";

/** A question as stored in the legacy JSON files. */
export type LegacyQuestion = {
  question: string;
  answers: string[];
  /** 1-indexed, unlike everywhere else in the app. */
  correctIndex: number;
  notes: string | null;
  fonte: string[] | null;
  img: string | null;
  uniqueID: number;
  tutorial: string | null;
  materia: string | null;
  /** Absent on most cat1 questions rather than null. */
  calc?: string | null;
  /** Present only when the question has resolved page numbers. */
  fontePages?: Record<string, number>;
  /**
   * A stray topic annotation on exactly one cat2 question ("ohm", on an Ohm's
   * law question whose `materia` is null). Nothing reads it; it is folded into
   * `topic` on import so the annotation is not lost.
   */
  TEMA?: string | null;
};

export type LegacyCategory = {
  ANACOMFILE: number;
  questions: LegacyQuestion[];
};

function toCanonicalQuestion(raw: LegacyQuestion): unknown {
  const answers = (raw.answers ?? []).map((text, index) => ({
    text,
    // Legacy correctIndex is 1-indexed. An out-of-range value marks no answer
    // correct, which the schema's "exactly one correct" rule then rejects
    // rather than silently clamping the way the old runtime loader did.
    correct: index === raw.correctIndex - 1,
  }));

  return {
    id: raw.uniqueID,
    question: raw.question,
    answers,
    // `materia` is the topic field, empty across all 1,015 questions. One cat2
    // question carries the annotation under `TEMA` instead; preserve it rather
    // than dropping the only topic hint in the bank.
    topic: raw.materia ?? raw.TEMA ?? null,
    // Old-shape JSON keeps the composite string plus a parallel page map; the
    // canonical model nests them. "cat3/2023_08_18p4" -> pdf + pergunta 4.
    sources: (raw.fonte ?? []).flatMap((entry) => {
      const cleaned = entry.trim().replace(/<[^>]*>\s*$/, "").trim();
      const m = /^(.+)p(\d+)$/.exec(cleaned);
      if (!m) return [];
      return [{ pdf: m[1]!, question: Number(m[2]), page: raw.fontePages?.[entry.trim()] ?? null }];
    }),
    image: raw.img,
    tutorial: raw.tutorial,
    calc: raw.calc,
    explanation: raw.notes,
  };
}

/** Imports a legacy category file into the validated canonical model. */
export function fromLegacy(raw: unknown, categoryId: string): ContentCategory {
  const legacy = raw as LegacyCategory;
  return parseCategory({
    id: categoryId,
    anacomFile: legacy.ANACOMFILE,
    questions: (legacy.questions ?? []).map(toCanonicalQuestion),
  });
}

/** Non-throwing variant that collects every validation error at once. */
export function safeFromLegacy(raw: unknown, categoryId: string) {
  const legacy = raw as LegacyCategory;
  return safeParseCategory({
    id: categoryId,
    anacomFile: legacy.ANACOMFILE,
    questions: (legacy.questions ?? []).map(toCanonicalQuestion),
  });
}
