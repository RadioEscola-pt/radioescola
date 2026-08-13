/**
 * Legacy adapter: `public/data/cat{n}.json` <-> canonical content model
 *
 * `fromLegacy` is the importer used by the one-time migration; `toLegacy` is
 * the emitter that keeps the shipped JSON byte-compatible with what the app
 * already fetches, so the runtime is untouched while authoring moves to
 * per-question files.
 *
 * The pair is verified by a round-trip test over the real cat3 data: importing
 * and re-emitting must reproduce the committed file byte for byte. Anything
 * the adapter cannot represent shows up there.
 */
import {
  parseCategory,
  safeParseCategory,
  type ContentCategory,
  type ContentQuestion,
} from "./schema";

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
  calc: string | null;
  /** Present only when the question has resolved page numbers. */
  fontePages?: Record<string, number>;
};

export type LegacyCategory = {
  ANACOMFILE: number;
  questions: LegacyQuestion[];
};

/**
 * Key order used when emitting. The legacy files carried three different
 * orderings (an artifact of hand-editing); cat3 has been normalized to this
 * one so the emitter's output matches the committed file exactly. cat1 and
 * cat2 still carry the old orderings until they are migrated.
 */
const LEGACY_KEY_ORDER = [
  "question",
  "answers",
  "correctIndex",
  "notes",
  "fonte",
  "img",
  "uniqueID",
  "tutorial",
  "materia",
  "calc",
  "fontePages",
] as const;

function toCanonicalQuestion(raw: LegacyQuestion): unknown {
  const answers = (raw.answers ?? []).map((text, index) => ({
    text,
    // Legacy correctIndex is 1-indexed. An out-of-range value marks no answer
    // correct, which the schema's "exactly one correct" rule then rejects
    // rather than silently clamping the way the runtime loader does.
    correct: index === raw.correctIndex - 1,
  }));

  return {
    id: raw.uniqueID,
    question: raw.question,
    answers,
    topic: raw.materia,
    sources: raw.fonte ?? [],
    sourcePages: raw.fontePages ?? {},
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

function toLegacyQuestion(q: ContentQuestion): LegacyQuestion {
  const correctIndex = q.answers.findIndex((a) => a.correct) + 1;

  const out: LegacyQuestion = {
    question: q.question,
    answers: q.answers.map((a) => a.text),
    correctIndex,
    // Always null: inline notes were moved into content/notes/ by
    // scripts/extract-notes.js long before this migration, and the field is
    // null on all 1,015 questions across the three categories. Explanations
    // are emitted as note files instead. `fromLegacy` still reads this field,
    // so a non-null one would surface as a round-trip failure rather than
    // being silently dropped.
    notes: null,
    fonte: q.sources.length > 0 ? q.sources : null,
    img: q.image,
    uniqueID: q.id,
    tutorial: q.tutorial,
    materia: q.topic,
    calc: q.calc,
  };

  // Omitted rather than nulled when empty, matching the legacy files: the
  // runtime loader treats a missing key and null identically, but reproducing
  // presence exactly keeps the round-trip check honest.
  if (Object.keys(q.sourcePages).length > 0) {
    out.fontePages = q.sourcePages;
  }

  return out;
}

/** Emits a category in the legacy shape the app fetches today. */
export function toLegacy(category: ContentCategory): LegacyCategory {
  return {
    ANACOMFILE: category.anacomFile,
    questions: category.questions.map(toLegacyQuestion),
  };
}

/** Reorders one question's keys into the canonical emission order. */
function orderKeys(q: LegacyQuestion): Record<string, unknown> {
  const source = q as unknown as Record<string, unknown>;
  const ordered: Record<string, unknown> = {};
  for (const key of LEGACY_KEY_ORDER) {
    if (key in source) {
      ordered[key] = source[key];
    }
  }
  return ordered;
}

/**
 * Serializes a category exactly as the current data files are formatted:
 * 2-space indent, trailing newline.
 */
export function serializeLegacy(category: LegacyCategory): string {
  const ordered = {
    ANACOMFILE: category.ANACOMFILE,
    questions: category.questions.map(orderKeys),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}
