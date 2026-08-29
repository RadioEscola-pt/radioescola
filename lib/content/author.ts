/**
 * Authoring a new question
 *
 * The write half of the content pipeline. `content:check` validates one file
 * at a time and `qbank` compares files against each other, but neither runs
 * until the question has already been written by hand — so the mistakes that
 * are cheapest to prevent are the ones currently caught last, or not at all:
 * a misspelled `topic` fails silently forever, and a question that already
 * exists in another category with a different answer is only found by
 * remembering to run `qbank dupes` afterwards.
 *
 * Pure, like `analysis.ts`. Filesystem questions ("is that PDF on disk?")
 * arrive as predicates, so the rules are unit-testable without a fixture tree
 * and `scripts/content-new.ts` stays I/O and prompting.
 *
 * Findings are split by whether they can be waved through:
 *
 * - `error` — the build fails, or the question fails silently at runtime.
 *   Never written without an explicit override.
 * - `warning` — legitimate often enough that only a human can say. The bank
 *   examines the same regulatory question at all three levels on purpose.
 */
import { QuestionSchema, isWithheld, type ContentQuestion } from "./schema";
import {
  auditAnswers,
  buildBank,
  findDuplicateGroups,
  findPairFindings,
  type BankQuestion,
  type DuplicateGroup,
  type PairFinding,
} from "./analysis";
import type { CategoryId } from "../config/categories";
import { CATEGORIES } from "../config/categories";
import { TOPIC_BY_SLUG, TOPIC_SLUGS, isTopicSlug } from "../config/topics";

/** How many options every question in the bank actually has. */
export const EXPECTED_OPTIONS = 4;

export type DraftAnswer = { text: string; correct?: boolean };

/**
 * A question on its way in.
 *
 * Deliberately the shape of the destination file rather than a second format:
 * `--from` takes a question file with the id left out, so nothing has to be
 * translated and a draft that is rejected can be fixed and re-fed as-is.
 */
export type Draft = {
  category: CategoryId;
  /** Omitted for a new question; `nextId` supplies it. */
  id?: number;
  question: string;
  answers: DraftAnswer[];
  /** Reason the question is withheld, for one that arrives already withdrawn. */
  disabled?: string | null;
  topic?: string | null;
  sources?: { pdf: string; question: number; page?: number | null }[];
  image?: string | null;
  tutorial?: string | null;
  calc?: string | null;
  explanation?: string | null;
};

export type FindingLevel = "error" | "warning";

export type Finding = {
  level: FindingLevel;
  /** Stable identifier, so a caller can suppress or test one rule. */
  code: string;
  message: string;
  /** Indented lines under the message: the offending values, or the fix. */
  detail?: string[];
};

export type Review = {
  /** The parsed question, or null when it does not satisfy the schema. */
  question: ContentQuestion | null;
  findings: Finding[];
  /** Duplicate groups the draft would join, worst tier first. */
  duplicates: DuplicateGroup[];
  /** Fuzzy near-neighbours of the draft. */
  pairs: PairFinding[];
};

export type PdfLookup = (pdf: string) => { exists: boolean; alsoIn: string[] };

export type ReviewContext = {
  /** The category the draft is being added to. */
  category: CategoryId;
  anacomFile: number;
  /** Every existing question, the draft excluded. */
  bank: readonly BankQuestion[];
  /** The category's current `order`, for the id collision check. */
  order: readonly number[];
  pdfLookup: PdfLookup;
  /** Takes a public-relative path, e.g. "images/cat3/x.png". */
  imageExists: (publicRelative: string) => boolean;
};

/**
 * The next free id: the current maximum plus one, never a gap below it.
 *
 * The bank has holes — id 352 in cat1 is free — and they stay holes. Recycling
 * a retired id would silently repoint every stale link to a different
 * question, with nothing anywhere reporting an error.
 */
export function nextId(order: readonly number[]): number {
  return order.reduce((max, id) => Math.max(max, id), 0) + 1;
}

export function hasErrors(findings: readonly Finding[]): boolean {
  return findings.some((f) => f.level === "error");
}

/** Images referenced from inside an explanation body, as public-relative paths. */
function imagesInBody(explanation: string | null): string[] {
  const found: string[] = [];
  for (const m of (explanation ?? "").matchAll(/<img[^>]+src=['"]([^'"]+)['"]/gi)) {
    const rel = (m[1] ?? "").replace(/^\//, "");
    if (rel.startsWith("images/")) found.push(rel);
  }
  return found;
}

function reviewTopic(topic: string | null, category: CategoryId): Finding[] {
  if (topic === null) {
    return [
      {
        level: "warning",
        code: "topic-missing",
        message: "Sem `topic` — a pergunta não recebe etiqueta e o filtro do browse ignora-a.",
      },
    ];
  }

  // The schema takes `topic` as free text on purpose — it is a join key, not a
  // closed enum, and validating it there would couple the content schema to
  // the UI's taxonomy. That leaves this as the one place a typo can be caught
  // before it becomes a card that renders without a label.
  if (!isTopicSlug(topic)) {
    return [
      {
        level: "error",
        code: "topic-unknown",
        message: `\`topic: ${topic}\` não é um slug da taxonomia — falharia em silêncio.`,
        detail: [TOPIC_SLUGS.join(", ")],
      },
    ];
  }

  const examinedFrom = TOPIC_BY_SLUG[topic].examinedFrom;
  // CATEGORIES is 3 -> 2 -> 1, beginner first, so a later index is a higher level.
  if (CATEGORIES.indexOf(category) < CATEGORIES.indexOf(examinedFrom)) {
    return [
      {
        level: "warning",
        code: "topic-above-level",
        message: `O Anexo 1 marca \`${topic}\` como examinável a partir da categoria ${examinedFrom}.`,
        detail: [
          "Advisory, não um erro: o anexo é de 2009 e as provas de 2023 já examinam matéria acima do nível.",
        ],
      },
    ];
  }

  return [];
}

function reviewAnswers(q: ContentQuestion, draftBank: BankQuestion): Finding[] {
  const findings: Finding[] = [];

  if (q.answers.length !== EXPECTED_OPTIONS) {
    findings.push({
      level: "warning",
      code: "option-count",
      message: `${q.answers.length} opções — as provas oficiais e todas as perguntas do banco têm ${EXPECTED_OPTIONS}.`,
    });
  }

  const audit = auditAnswers([draftBank]);
  for (const d of audit.duplicateOptions) {
    findings.push({
      level: "error",
      code: "option-duplicate",
      message: "Duas opções com o mesmo texto.",
      detail: [d.text],
    });
  }
  for (const m of audit.misplacedCatchAll) {
    findings.push({
      level: "warning",
      code: "option-catch-all",
      message: `Opção do tipo "todas as anteriores" na posição ${m.index + 1} de ${m.count}.`,
      detail: ["Só faz sentido em último lugar."],
    });
  }

  return findings;
}

function reviewSources(q: ContentQuestion, pdfLookup: PdfLookup): Finding[] {
  const findings: Finding[] = [];

  if (q.sources.length === 0) {
    findings.push({
      level: "warning",
      code: "sources-missing",
      message: "Sem `sources` — nada liga a pergunta à prova oficial de onde veio.",
    });
  }

  for (const s of q.sources) {
    const { exists, alsoIn } = pdfLookup(s.pdf);
    if (!exists) {
      findings.push({
        level: "error",
        code: "pdf-missing",
        message: `\`${s.pdf}\` não existe em public/exams/ — o content:check falha.`,
        detail:
          alsoIn.length > 0
            ? [`Existe em ${alsoIn.join(", ")}, portanto o prefixo da categoria está errado.`]
            : [
                "Acrescentar o PDF, corrigir a referência, ou (última opção) baselinar em content/missing-exams.json.",
              ],
      });
    }

    // The two numbers are unrelated — the papers carry about four questions
    // per page — so equality is nearly always the pergunta number typed into
    // both fields. It is legitimate for the first pages, hence a warning.
    if (s.page !== null && s.page === s.question) {
      findings.push({
        level: "warning",
        code: "page-equals-question",
        message: `\`${s.pdf}\`: page ${s.page} igual ao número da pergunta.`,
        detail: [
          "São números sem relação: ~4 perguntas por página, a pergunta 29 está na página 9.",
        ],
      });
    }
  }

  return findings;
}

/**
 * Everything wrong with a draft, before anything is written.
 *
 * The duplicate pass is the reason this runs pre-write rather than post-commit:
 * a new question that contradicts an existing one is invisible to every
 * per-file rule, because both files are individually valid.
 */
export function reviewDraft(draft: Draft, ctx: ReviewContext): Review {
  const id = draft.id ?? nextId(ctx.order);
  const findings: Finding[] = [];

  const parsed = QuestionSchema.safeParse({
    id,
    question: draft.question,
    answers: draft.answers,
    disabled: draft.disabled,
    topic: draft.topic,
    sources: draft.sources,
    image: draft.image,
    tutorial: draft.tutorial,
    calc: draft.calc,
    explanation: draft.explanation,
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      findings.push({
        level: "error",
        code: "schema",
        message: path.length > 0 ? `\`${path}\`: ${issue.message}` : issue.message,
      });
    }
    return { question: null, findings, duplicates: [], pairs: [] };
  }

  const question = parsed.data;

  if (ctx.order.includes(question.id)) {
    findings.push({
      level: "error",
      code: "id-taken",
      message: `O id ${question.id} já existe em cat${ctx.category}.`,
      detail: [`Próximo livre: ${nextId(ctx.order)}.`],
    });
  }

  // Built through `buildBank` rather than by hand so the comparison keys are
  // computed exactly as they are for every other question.
  const [draftBank] = buildBank([
    { id: ctx.category, anacomFile: ctx.anacomFile, questions: [question] },
  ]);
  if (!draftBank) return { question, findings, duplicates: [], pairs: [] };

  findings.push(...reviewTopic(question.topic, ctx.category));
  findings.push(...reviewAnswers(question, draftBank));
  findings.push(...reviewSources(question, ctx.pdfLookup));

  for (const rel of [
    ...(question.image === null ? [] : [question.image.replace(/^\//, "")]),
    ...imagesInBody(question.explanation),
  ]) {
    if (ctx.imageExists(rel)) continue;
    findings.push({
      level: "error",
      code: "image-missing",
      message: `\`${rel}\` não existe em public/ — a compilação falha.`,
    });
  }

  if (question.explanation === null) {
    findings.push({
      level: "warning",
      code: "explanation-missing",
      message: "Sem explicação. Válido — 260 perguntas estão assim — mas é o que dá valor à pergunta.",
    });
  }

  const withDraft = [...ctx.bank, draftBank];
  const duplicates = findDuplicateGroups(withDraft).filter((g) =>
    g.members.some((m) => m.ref === draftBank.ref)
  );
  const pairs = findPairFindings(withDraft).filter(
    (p) => p.a.ref === draftBank.ref || p.b.ref === draftBank.ref
  );

  for (const group of duplicates) {
    const others = group.members.filter((m) => m.ref !== draftBank.ref);
    // Withheld questions stay in the bank precisely so they go on blocking an
    // accidental re-add. But a contradiction with one is not the defect a
    // contradiction with a live question is: withdrawing the wrong version and
    // writing the corrected one is the intended repair, and it would produce
    // exactly this. So it is still reported, as a warning rather than a block.
    const live = others.filter((m) => !isWithheld(m));
    findings.push({
      level: group.tier === "contradiction" && live.length > 0 ? "error" : "warning",
      code: `duplicate-${group.tier}`,
      message:
        `${group.tier}: já existe em ${others.map((m) => m.ref).join(", ")}` +
        (live.length === 0 ? " (desativada)." : "."),
      detail: others.map(
        (m) =>
          `${m.file} — resposta certa: ${m.correctText}` +
          (isWithheld(m) ? ` [desativada: ${m.disabled}]` : "")
      ),
    });
  }

  for (const pair of pairs) {
    const other = pair.a.ref === draftBank.ref ? pair.b : pair.a;
    findings.push({
      level: "warning",
      code: `near-${pair.kind}`,
      message:
        pair.kind === "polarity"
          ? `Possível inversão de ${other.ref} (enunciado ${Math.round(pair.stemSimilarity * 100)}% semelhante, polaridade oposta).`
          : `Semelhante a ${other.ref} (enunciado ${Math.round(pair.stemSimilarity * 100)}%, opções ${Math.round(pair.answerSimilarity * 100)}%).`,
      detail: [`${other.question}`, `${other.file} — resposta certa: ${other.correctText}`],
    });
  }

  return { question, findings, duplicates, pairs };
}

export type OrderAnchor =
  | { kind: "after"; id: number }
  | { kind: "before"; id: number }
  | { kind: "end" };

/**
 * Places a new id in the editorial order.
 *
 * The order is by subject, not by id — cat3's 210-213 sit at positions 8, 10,
 * 19 and 31 — and it drives the browse sequence, so appending is a choice
 * rather than the natural default. The caller has to make it explicitly.
 */
export function insertIntoOrder(
  order: readonly number[],
  id: number,
  anchor: OrderAnchor
): number[] {
  if (order.includes(id)) {
    throw new Error(`id ${id} is already in the order`);
  }
  if (anchor.kind === "end") return [...order, id];

  const at = order.indexOf(anchor.id);
  if (at === -1) {
    throw new Error(`anchor id ${anchor.id} is not in the order`);
  }
  const next = [...order];
  next.splice(anchor.kind === "after" ? at + 1 : at, 0, id);
  return next;
}
