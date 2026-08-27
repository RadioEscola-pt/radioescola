/**
 * Question-bank analysis for the `qbank` developer tool.
 *
 * Pure functions over parsed source questions — no filesystem, no printing —
 * so the parts that are actually hard to get right (what counts as a
 * duplicate, what counts as a template stem) are unit-testable without a
 * fixture tree on disk.
 *
 * The framing that matters: **a duplicate is not automatically a defect.**
 * Question 12 of cat 3, 255 of cat 2 and 284 of cat 1 are the same regulatory
 * question legitimately examined at all three levels, and the bank has 27 such
 * groups. What is worth a human's attention is a group whose members
 * *disagree* — different options, a different correct answer, a different
 * topic. So the finders below classify rather than condemn, and the tiers are
 * ordered by how likely they are to be a real bug.
 *
 * The second constraint is noise. Stem similarity on its own is useless here:
 * "Qual das seguintes afirmações é incorreta?" is a template shared by dozens
 * of unrelated questions, and its nearest neighbour by every string metric is
 * "Qual das seguintes afirmações está correta?" — the opposite question. Every
 * fuzzy finder therefore requires agreement on the *answers* too, which is
 * what separates a rephrased duplicate from two questions built from one
 * sentence pattern.
 */
import { fold } from "../utils/search";
import { questionFileName } from "./source";
import type { ContentCategory, ContentQuestion } from "./schema";
import type { CategoryId } from "../config/categories";
import { ABOVE_ENTRY_LEVEL, isTopicSlug } from "../config/topics";

/* -------------------------------------------------------------------------- */
/* Text normalisation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Comparison form of a string: folded, punctuation-free, single-spaced.
 *
 * Punctuation is dropped rather than kept because the bank is inconsistent
 * about it — cat2 #255 writes "discordância à ANACOM, propondo" and cat3 #12
 * writes it without the comma. Treating that as a difference would bury the
 * real difference in the same sentence (see `DuplicateTier.typo`).
 */
export function canonical(text: string): string {
  return fold(text).replace(/[^a-z0-9]+/g, " ").trim();
}

/** Canonical form split into words. */
export function tokens(text: string): string[] {
  const c = canonical(text);
  return c.length === 0 ? [] : c.split(" ");
}

/**
 * Comparison key for a stem or an option — canonical form, or the raw text
 * with whitespace collapsed when canonicalising leaves nothing behind.
 *
 * The fallback exists because of telegraphy. Question 109 of cat 3 answers in
 * dots and dashes, so all four of its options canonicalise to the empty string
 * and would compare equal to each other and to every other Morse question in
 * the bank. Comparing what is actually written keeps them distinct.
 */
export function comparisonKey(text: string): string {
  const c = canonical(text);
  return c.length > 0 ? c : text.replace(/\s+/g, " ").trim();
}

/**
 * Words that invert a question rather than describe it.
 *
 * `nao` is the folded form of "não"; the bank uses both "exceto" and the
 * pre-1990 "excepto".
 */
const NEGATIVE_MARKERS: ReadonlySet<string> = new Set([
  "incorreta", "incorretas", "incorrecta", "incorrectas",
  "incorreto", "incorretos", "incorrecto", "incorrectos",
  "errada", "erradas", "errado", "errados",
  "falsa", "falsas", "falso", "falsos",
  "nao", "excepto", "exceto", "salvo",
]);

/** The affirmative counterparts, stripped alongside so a flipped pair aligns. */
const POSITIVE_MARKERS: ReadonlySet<string> = new Set([
  "correta", "corretas", "correcta", "correctas",
  "correto", "corretos", "correcto", "correctos",
  "verdadeira", "verdadeiras", "verdadeiro", "verdadeiros",
  "certa", "certas", "certo", "certos",
]);

export type Polarity = "positive" | "negative";

/** Whether a stem asks for the true statement or the false one. */
export function polarityOf(stem: string): Polarity {
  return tokens(stem).some((t) => NEGATIVE_MARKERS.has(t)) ? "negative" : "positive";
}

/**
 * Stem tokens with the polarity words removed.
 *
 * Comparing on this is what lets a flipped pair be recognised as flipped: with
 * "incorreta" and "correta" both gone, the two stems are otherwise the same
 * sentence, which is exactly the signal wanted.
 */
export function stripPolarity(stem: string): string[] {
  return tokens(stem).filter(
    (t) => !NEGATIVE_MARKERS.has(t) && !POSITIVE_MARKERS.has(t)
  );
}

/** Jaccard similarity of two token lists, treated as sets. */
export function jaccard(a: readonly string[], b: readonly string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let shared = 0;
  for (const t of setA) if (setB.has(t)) shared++;
  return shared / (setA.size + setB.size - shared);
}

/** Levenshtein distance. Strings here are single options, so O(nm) is fine. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  let curr: number[] = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        (curr[j - 1] ?? 0) + 1,
        (prev[j] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost
      );
    }
    const swap = prev;
    prev = curr;
    curr = swap;
  }
  return prev[b.length] ?? 0;
}

/* -------------------------------------------------------------------------- */
/* The bank                                                                    */
/* -------------------------------------------------------------------------- */

/** A source question with its identity and comparison keys resolved once. */
export type BankQuestion = ContentQuestion & {
  category: CategoryId;
  /** Path of the file to edit, e.g. "content/questions/cat3/0012.mdx". */
  file: string;
  /** Human-facing identity, e.g. "cat3#12". Unique across the bank. */
  ref: string;
  /** Text of the one correct answer. */
  correctText: string;
  /** Canonical stem. */
  stemKey: string;
  /** Canonical options, sorted and joined — order-independent by design. */
  answerKey: string;
  /** Canonical correct answer. */
  correctKey: string;
  stemTokens: string[];
  /** Stem tokens with polarity words removed. */
  coreTokens: string[];
  /** Every option token, for answer-level similarity. */
  answerTokens: string[];
  polarity: Polarity;
};

export function questionPath(category: CategoryId, id: number): string {
  return `content/questions/cat${category}/${questionFileName(id)}`;
}

export function bankRef(category: CategoryId, id: number): string {
  return `cat${category}#${id}`;
}

/** Parses a "cat3#12" or "3#12" reference. */
export function parseRef(input: string): { category: CategoryId; id: number } | null {
  const m = /^(?:cat)?([123])[#:/ ](\d+)$/.exec(input.trim());
  if (!m) return null;
  return { category: m[1] as CategoryId, id: Number.parseInt(m[2]!, 10) };
}

export function buildBank(categories: readonly ContentCategory[]): BankQuestion[] {
  const bank: BankQuestion[] = [];
  for (const category of categories) {
    const id = category.id as CategoryId;
    for (const q of category.questions) {
      const options = q.answers.map((a) => a.text);
      const correct = q.answers.find((a) => a.correct);
      // The schema guarantees exactly one, so this is a type narrowing rather
      // than a real fallback.
      const correctText = correct?.text ?? "";
      bank.push({
        ...q,
        category: id,
        file: questionPath(id, q.id),
        ref: bankRef(id, q.id),
        correctText,
        stemKey: comparisonKey(q.question),
        answerKey: options.map(comparisonKey).sort().join(" | "),
        correctKey: comparisonKey(correctText),
        stemTokens: tokens(q.question),
        coreTokens: stripPolarity(q.question),
        answerTokens: options.flatMap(tokens),
        polarity: polarityOf(q.question),
      });
    }
  }
  return bank;
}

function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = out.get(k);
    if (bucket) bucket.push(item);
    else out.set(k, [item]);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Duplicate groups                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Ordered by how likely the tier is to be a defect, worst first.
 *
 * - `contradiction` — same question, same options, disagreeing on which option
 *   is right. One of them is simply wrong; nothing else in the pipeline can
 *   catch this, since each file is individually valid.
 * - `typo` — same question, options differing only below an edit-distance
 *   threshold. Mechanical to fix and easy to miss by eye.
 * - `divergent` — same stem, materially different options. Either a genuine
 *   variant worth keeping or a stem that needs disambiguating.
 * - `shared-answers` — different stems over an identical option set. Usually a
 *   rephrasing, occasionally options pasted onto the wrong question.
 * - `exact` — same question, same options, same answer. Benign across
 *   categories; within one category it is a redundant entry.
 */
export type DuplicateTier =
  | "contradiction"
  | "typo"
  | "divergent"
  | "shared-answers"
  | "exact";

export const DUPLICATE_TIERS: readonly DuplicateTier[] = [
  "contradiction",
  "typo",
  "divergent",
  "shared-answers",
  "exact",
];

/** A field the members of a group disagree on. Reported, never resolved. */
export type GroupIssue = {
  kind: "topic" | "explanation" | "sources" | "image" | "cosmetic";
  detail: string;
};

export type DuplicateGroup = {
  tier: DuplicateTier;
  /** Stable across runs, so a baseline can suppress an accepted group. */
  key: string;
  members: BankQuestion[];
  crossCategory: boolean;
  issues: GroupIssue[];
};

/**
 * Largest per-option edit distance, relative to option length, under the best
 * one-to-one pairing of two option lists. Null when the lists cannot be paired.
 *
 * Greedy nearest-match rather than optimal assignment: with four short options
 * that are either near-identical or plainly unrelated, the two agree, and the
 * greedy version stays readable.
 */
export function worstPairedDistance(a: readonly string[], b: readonly string[]): number | null {
  if (a.length !== b.length) return null;
  const taken = new Array<boolean>(b.length).fill(false);
  let worst = 0;
  for (const x of a) {
    let best = Number.POSITIVE_INFINITY;
    let bestIndex = -1;
    for (let i = 0; i < b.length; i++) {
      if (taken[i]) continue;
      const d = levenshtein(x, b[i] ?? "");
      if (d < best) {
        best = d;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) return null;
    taken[bestIndex] = true;
    const span = Math.max(x.length, (b[bestIndex] ?? "").length, 1);
    worst = Math.max(worst, best / span);
  }
  return worst;
}

/** Above this relative distance, two options are different rather than mistyped. */
export const TYPO_RATIO = 0.12;

function classifyStemGroup(members: readonly BankQuestion[]): DuplicateTier {
  const answerKeys = new Set(members.map((m) => m.answerKey));
  const correctKeys = new Set(members.map((m) => m.correctKey));

  if (answerKeys.size === 1) {
    return correctKeys.size === 1 ? "exact" : "contradiction";
  }

  // Compare every member against the first: a typo group is one where no
  // member has drifted further than a misspelling from the reference.
  const [first, ...rest] = members;
  if (!first) return "divergent";
  const reference = first.answers.map((a) => comparisonKey(a.text));
  for (const other of rest) {
    const worst = worstPairedDistance(reference, other.answers.map((a) => comparisonKey(a.text)));
    if (worst === null || worst > TYPO_RATIO) return "divergent";
  }
  return "typo";
}

function describeIssues(members: readonly BankQuestion[]): GroupIssue[] {
  const issues: GroupIssue[] = [];

  const topics = new Set(members.map((m) => m.topic ?? "—"));
  if (topics.size > 1) {
    issues.push({
      kind: "topic",
      detail: members.map((m) => `${m.ref}=${m.topic ?? "sem matéria"}`).join(", "),
    });
  }

  const withExplanation = members.filter((m) => m.explanation !== null);
  if (withExplanation.length > 0 && withExplanation.length < members.length) {
    issues.push({
      kind: "explanation",
      detail: `com explicação: ${withExplanation.map((m) => m.ref).join(", ")}; sem: ${members
        .filter((m) => m.explanation === null)
        .map((m) => m.ref)
        .join(", ")}`,
    });
  }

  const withSources = members.filter((m) => m.sources.length > 0);
  if (withSources.length > 0 && withSources.length < members.length) {
    issues.push({
      kind: "sources",
      detail: `com fonte: ${withSources.map((m) => m.ref).join(", ")}; sem: ${members
        .filter((m) => m.sources.length === 0)
        .map((m) => m.ref)
        .join(", ")}`,
    });
  }

  const images = new Set(members.map((m) => m.image ?? "—"));
  if (images.size > 1) {
    issues.push({
      kind: "image",
      detail: members.map((m) => `${m.ref}=${m.image ?? "nenhuma"}`).join(", "),
    });
  }

  // Punctuation, spacing and accents are folded away for matching, so a group
  // can be "identical" and still not be byte-identical. Only worth saying when
  // the canonical forms genuinely agree — otherwise the difference is
  // substantive, and the tier has already reported it.
  const sameStem = new Set(members.map((m) => m.stemKey)).size === 1;
  const sameAnswers = new Set(members.map((m) => m.answerKey)).size === 1;
  if (sameStem && sameAnswers) {
    const rawStems = new Set(members.map((m) => m.question));
    const rawAnswers = new Set(members.map((m) => m.answers.map((a) => a.text).join(" | ")));
    if (rawStems.size > 1 || rawAnswers.size > 1) {
      const parts = [
        rawStems.size > 1 ? "enunciado" : null,
        rawAnswers.size > 1 ? "opções" : null,
      ]
        .filter(Boolean)
        .join(" e ");
      issues.push({
        kind: "cosmetic",
        detail: `${parts} só diferem em acentos, espaços ou pontuação`,
      });
    }
  }

  return issues;
}

function makeGroup(tier: DuplicateTier, members: BankQuestion[]): DuplicateGroup {
  const sorted = [...members].sort((a, b) => a.ref.localeCompare(b.ref));
  return {
    tier,
    key: `${tier}:${sorted.map((m) => m.ref).join(",")}`,
    members: sorted,
    crossCategory: new Set(sorted.map((m) => m.category)).size > 1,
    issues: describeIssues(sorted),
  };
}

/**
 * Every group of questions that share a stem or an option set.
 *
 * Stem groups are classified first; an option-set group is only reported when
 * its members do *not* already share a stem, so nothing is listed twice.
 */
export function findDuplicateGroups(bank: readonly BankQuestion[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];

  for (const members of groupBy(bank, (q) => q.stemKey).values()) {
    if (members.length < 2) continue;
    groups.push(makeGroup(classifyStemGroup(members), members));
  }

  for (const members of groupBy(bank, (q) => q.answerKey).values()) {
    if (members.length < 2) continue;
    if (new Set(members.map((m) => m.stemKey)).size === 1) continue;
    groups.push(makeGroup("shared-answers", members));
  }

  const rank = (t: DuplicateTier) => DUPLICATE_TIERS.indexOf(t);
  return groups.sort(
    (a, b) => rank(a.tier) - rank(b.tier) || a.members.length - b.members.length
  );
}

/* -------------------------------------------------------------------------- */
/* Fuzzy pairs                                                                 */
/* -------------------------------------------------------------------------- */

export type PairFinding = {
  kind: "polarity" | "near-stem";
  key: string;
  a: BankQuestion;
  b: BankQuestion;
  stemSimilarity: number;
  answerSimilarity: number;
};

/** Stems this similar are the same sentence, modulo a word or two. */
export const NEAR_STEM_MIN = 0.7;

/**
 * Answer agreement required before a stem match is reported at all.
 *
 * This is the noise control. Without it, every question built on "Qual das
 * seguintes afirmações…" pairs with every other one, and the report is 248
 * pairs of unrelated questions that happen to share a sentence pattern.
 */
export const NEAR_ANSWER_MIN = 0.3;

/**
 * Stem-level near-duplicates and polarity flips.
 *
 * Candidates come from an inverted index rather than all-pairs: at 1,016
 * questions the quadratic form is affordable, but it grows with the bank and
 * the index costs nothing. Tokens appearing in more than `maxDocFrequency` of
 * the bank are skipped as connectives — they generate candidates without
 * discriminating between them.
 */
export function findPairFindings(
  bank: readonly BankQuestion[],
  options: { stemMin?: number; answerMin?: number; maxDocFrequency?: number } = {}
): PairFinding[] {
  const stemMin = options.stemMin ?? NEAR_STEM_MIN;
  const answerMin = options.answerMin ?? NEAR_ANSWER_MIN;
  const maxDf = options.maxDocFrequency ?? Math.max(20, Math.floor(bank.length / 20));

  const index = new Map<string, number[]>();
  bank.forEach((q, i) => {
    for (const token of new Set(q.coreTokens)) {
      const bucket = index.get(token);
      if (bucket) bucket.push(i);
      else index.set(token, [i]);
    }
  });

  const seen = new Set<string>();
  const findings: PairFinding[] = [];

  bank.forEach((q, i) => {
    const candidates = new Set<number>();
    for (const token of new Set(q.coreTokens)) {
      const bucket = index.get(token);
      if (!bucket || bucket.length > maxDf) continue;
      for (const j of bucket) if (j !== i) candidates.add(j);
    }

    for (const j of candidates) {
      const pairKey = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);

      const other = bank[j];
      if (!other) continue;

      const stemSimilarity = jaccard(q.coreTokens, other.coreTokens);
      if (stemSimilarity < stemMin) continue;

      const answerSimilarity = jaccard(q.answerTokens, other.answerTokens);
      if (answerSimilarity < answerMin) continue;

      const flipped = q.polarity !== other.polarity;
      // An exact stem match is already a duplicate group; only report it here
      // when the polarity differs, which the stem key cannot express.
      if (!flipped && q.stemKey === other.stemKey) continue;

      const [a, b] = q.ref.localeCompare(other.ref) <= 0 ? [q, other] : [other, q];
      const kind = flipped ? "polarity" : "near-stem";
      findings.push({
        kind,
        key: `${kind}:${a!.ref},${b!.ref}`,
        a: a!,
        b: b!,
        stemSimilarity,
        answerSimilarity,
      });
    }
  });

  return findings.sort(
    (x, y) =>
      (x.kind === y.kind ? 0 : x.kind === "polarity" ? -1 : 1) ||
      y.stemSimilarity + y.answerSimilarity - (x.stemSimilarity + x.answerSimilarity)
  );
}

/* -------------------------------------------------------------------------- */
/* Coverage                                                                    */
/* -------------------------------------------------------------------------- */

export type CoverageRow = {
  label: string;
  total: number;
  withSources: number;
  sourceRefs: number;
  refsWithPage: number;
  withExplanation: number;
  withImage: number;
  withTopic: number;
};

function coverageRow(label: string, questions: readonly BankQuestion[]): CoverageRow {
  const refs = questions.flatMap((q) => q.sources);
  return {
    label,
    total: questions.length,
    withSources: questions.filter((q) => q.sources.length > 0).length,
    sourceRefs: refs.length,
    refsWithPage: refs.filter((s) => s.page !== null).length,
    withExplanation: questions.filter((q) => q.explanation !== null).length,
    withImage: questions.filter((q) => q.image !== null).length,
    withTopic: questions.filter((q) => q.topic !== null).length,
  };
}

export function coverage(bank: readonly BankQuestion[]): CoverageRow[] {
  const rows: CoverageRow[] = [];
  for (const c of ["3", "2", "1"] as const) {
    rows.push(coverageRow(`cat${c}`, bank.filter((q) => q.category === c)));
  }
  rows.push(coverageRow("all", bank));
  return rows;
}

/* -------------------------------------------------------------------------- */
/* Topics                                                                      */
/* -------------------------------------------------------------------------- */

export type TopicAudit = {
  /** slug -> per-category counts, plus the total. */
  distribution: { slug: string; counts: Record<CategoryId, number>; total: number }[];
  untagged: BankQuestion[];
  /** `topic` set to something that is not a slug in lib/config/topics.ts. */
  invalid: BankQuestion[];
  /**
   * Category 3 questions in a chapter Anexo 1 marks as starting above entry
   * level. Advisory: `examinedFrom` in lib/config/topics.ts documents six of
   * these as genuine, sourced to real 2023 category 3 papers.
   */
  aboveEntryLevel: BankQuestion[];
};

export function auditTopics(bank: readonly BankQuestion[]): TopicAudit {
  const above = new Set<string>(ABOVE_ENTRY_LEVEL);
  const counts = new Map<string, Record<CategoryId, number>>();

  for (const q of bank) {
    if (q.topic === null || !isTopicSlug(q.topic)) continue;
    const row = counts.get(q.topic) ?? { "3": 0, "2": 0, "1": 0 };
    row[q.category]++;
    counts.set(q.topic, row);
  }

  const distribution = [...counts.entries()]
    .map(([slug, c]) => ({ slug, counts: c, total: c["3"] + c["2"] + c["1"] }))
    .sort((a, b) => b.total - a.total);

  return {
    distribution,
    untagged: bank.filter((q) => q.topic === null),
    invalid: bank.filter((q) => q.topic !== null && !isTopicSlug(q.topic)),
    aboveEntryLevel: bank.filter(
      (q) => q.category === "3" && q.topic !== null && above.has(q.topic)
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Exam papers                                                                 */
/* -------------------------------------------------------------------------- */

export type PaperAudit = {
  pdf: string;
  /** Perguntas cited from this paper, ascending. */
  cited: { question: number; page: number | null; ref: string; file: string }[];
  /** Pergunta numbers between the lowest and highest cited that nothing claims. */
  gaps: number[];
  /** Two questions claiming to be the same pergunta of the same paper. */
  collisions: { question: number; refs: string[] }[];
};

export function auditPapers(bank: readonly BankQuestion[]): PaperAudit[] {
  const papers = new Map<string, PaperAudit["cited"]>();
  for (const q of bank) {
    for (const s of q.sources) {
      const list = papers.get(s.pdf) ?? [];
      list.push({ question: s.question, page: s.page, ref: q.ref, file: q.file });
      papers.set(s.pdf, list);
    }
  }

  return [...papers.entries()]
    .map(([pdf, cited]) => {
      cited.sort((a, b) => a.question - b.question || a.ref.localeCompare(b.ref));

      const byNumber = groupBy(cited, (c) => String(c.question));
      const collisions = [...byNumber.entries()]
        .filter(([, entries]) => entries.length > 1)
        .map(([question, entries]) => ({
          question: Number.parseInt(question, 10),
          refs: entries.map((e) => e.ref),
        }))
        .sort((a, b) => a.question - b.question);

      const numbers = new Set(cited.map((c) => c.question));
      const highest = Math.max(...numbers);
      const gaps: number[] = [];
      for (let n = 1; n <= highest; n++) if (!numbers.has(n)) gaps.push(n);

      return { pdf, cited, gaps, collisions };
    })
    .sort((a, b) => a.pdf.localeCompare(b.pdf));
}

/* -------------------------------------------------------------------------- */
/* Answer construction                                                         */
/* -------------------------------------------------------------------------- */

export type AnswerAudit = {
  total: number;
  /** How often each option position holds the correct answer. */
  correctIndexCounts: number[];
  /** Questions where the correct answer is the longest option. */
  longestIsCorrect: number;
  /** Two options that are the same after folding — always a defect. */
  duplicateOptions: { ref: string; file: string; text: string }[];
  /** "todas as anteriores" and friends, which only make sense last. */
  misplacedCatchAll: { ref: string; file: string; index: number; count: number }[];
  /** Options identical but for spacing or punctuation across the same question. */
  optionCount: Map<number, number>;
};

const CATCH_ALL = /(todas|nenhuma|qualquer)\s+(as|das)?\s*(anteriores|respostas|opcoes|afirmacoes)/;

export function auditAnswers(bank: readonly BankQuestion[]): AnswerAudit {
  const correctIndexCounts: number[] = [];
  let longestIsCorrect = 0;
  const duplicateOptions: AnswerAudit["duplicateOptions"] = [];
  const misplacedCatchAll: AnswerAudit["misplacedCatchAll"] = [];
  const optionCount = new Map<number, number>();

  for (const q of bank) {
    const texts = q.answers.map((a) => a.text);
    const index = q.answers.findIndex((a) => a.correct);
    correctIndexCounts[index] = (correctIndexCounts[index] ?? 0) + 1;
    optionCount.set(texts.length, (optionCount.get(texts.length) ?? 0) + 1);

    const longest = texts.reduce((best, t, i) => (t.length > (texts[best]?.length ?? 0) ? i : best), 0);
    if (longest === index) longestIsCorrect++;

    // Deliberately stricter than `comparisonKey`: within one question the
    // distractors are frequently the same quantity with a sign, a prefix or an
    // operator changed, and canonicalising away punctuation makes "10 dB" and
    // "-10 dB", or "0,01 µF" and "0,01 F", look like the same option. Only
    // text that is genuinely identical is a defect here.
    const seen = new Set<string>();
    for (const t of texts) {
      const key = t.replace(/\s+/g, " ").trim();
      if (seen.has(key)) duplicateOptions.push({ ref: q.ref, file: q.file, text: t });
      seen.add(key);
    }

    texts.forEach((t, i) => {
      if (CATCH_ALL.test(canonical(t)) && i !== texts.length - 1) {
        misplacedCatchAll.push({ ref: q.ref, file: q.file, index: i, count: texts.length });
      }
    });
  }

  return {
    total: bank.length,
    correctIndexCounts,
    longestIsCorrect,
    duplicateOptions,
    misplacedCatchAll,
    optionCount,
  };
}
