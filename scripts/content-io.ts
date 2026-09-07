/**
 * The I/O half of the authoring scripts, shared by `content:new` and
 * `content:edit`.
 *
 * Extracted when `content:edit` arrived and needed every one of these: reading
 * the bank, resolving an image path, the field prompts, and the write path
 * that leaves the tree in the state `content:check` expects. The alternative
 * was a second copy of each, which is how two tools that write the same files
 * start disagreeing about how to write them.
 *
 * The split matches the rest of the repo: what a question *is* and what is
 * *allowed* live in `lib/content/`, pure and tested; this is the terminal and
 * the filesystem. Nothing here decides anything.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, statSync } from "fs";
import { join, resolve, extname } from "path";
import { tmpdir, homedir } from "os";
import { spawnSync } from "node:child_process";
import {
  loadCategory,
  emitCategory,
  serializeManifest,
  CategoryManifestSchema,
  MANIFEST_FILE,
  loadMissingExamsBaseline,
  type CategoryManifest,
} from "../lib/content/build";
import { serializeQuestionFile } from "../lib/content/source";
import type { ContentCategory, ContentQuestion } from "../lib/content/schema";
import { buildBank, type BankQuestion } from "../lib/content/analysis";
import { EXPECTED_OPTIONS, type Draft, type Finding } from "../lib/content/author";
import { CATEGORIES, type CategoryId } from "../lib/config/categories";
import { TOPICS } from "../lib/config/topics";
import { ask, askText, askChoice, closePrompts, bold, dim, red, green, yellow } from "./prompt";

export const ROOT = process.cwd();
export const EXAMS_DIR = join(ROOT, "public", "exams");
export const PUBLIC_DIR = join(ROOT, "public");

/* -------------------------------------------------------------------------- */
/* Output                                                                      */
/* -------------------------------------------------------------------------- */

/** Truncates for a one-line summary, on a word boundary where it can. */
export function clip(text: string, width: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= width) return flat;
  const cut = flat.slice(0, width - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > width * 0.6 ? cut.slice(0, space) : cut}…`;
}

export function printFindings(findings: readonly Finding[]): void {
  if (findings.length === 0) {
    console.log(`\n${green("✓")} sem problemas`);
    return;
  }
  console.log();
  for (const f of findings) {
    console.log(`${f.level === "error" ? red("✗") : yellow("!")} ${f.message}  ${dim(f.code)}`);
    for (const d of f.detail ?? []) console.log(`    ${dim(d)}`);
  }
}

/** One question rendered the way both tools show it before writing. */
export function printQuestion(q: ContentQuestion): void {
  console.log(`  ${q.question}`);
  for (const a of q.answers) {
    console.log(`   ${a.correct ? green("✓") : dim("·")} ${clip(a.text, 100)}`);
  }
  const marks = [
    q.topic ?? "sem matéria",
    q.sources.length > 0
      ? q.sources
          .map((s) => `${s.pdf} pergunta ${s.question}${s.page === null ? "" : ` p.${s.page}`}`)
          .join("; ")
      : "sem fonte",
    q.explanation === null ? "sem explicação" : `explicação, ${q.explanation.length} caracteres`,
    ...(q.disabled === null ? [] : [`desativada: ${q.disabled}`]),
  ];
  console.log(`  ${dim(marks.join("  |  "))}`);
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

export function sourceDirOf(category: CategoryId): string {
  return join(ROOT, "content", "questions", `cat${category}`);
}

export function loadAll(): { categories: ContentCategory[]; bank: BankQuestion[] } {
  const categories = CATEGORIES.filter((c) => existsSync(sourceDirOf(c))).map((c) =>
    loadCategory(sourceDirOf(c))
  );
  return { categories, bank: buildBank(categories) };
}

export function loadManifest(category: CategoryId): CategoryManifest {
  return CategoryManifestSchema.parse(
    JSON.parse(readFileSync(join(sourceDirOf(category), MANIFEST_FILE), "utf-8"))
  );
}

/**
 * The baseline of known-absent papers, read once.
 *
 * Read through `loadMissingExamsBaseline` rather than parsed here, so the
 * authoring tools and `content:check` cannot drift into disagreeing about
 * which papers are tolerated.
 */
let missingExams: Set<string> | null = null;
const isBaselined = (pdf: string): boolean =>
  (missingExams ??= loadMissingExamsBaseline(ROOT)).has(pdf);

/** Existence of an exam PDF, with the wrong-prefix hint `findDanglingPdfs` gives. */
export function pdfLookup(pdf: string): { exists: boolean; baselined: boolean; alsoIn: string[] } {
  if (existsSync(join(EXAMS_DIR, `${pdf}.pdf`))) {
    return { exists: true, baselined: false, alsoIn: [] };
  }
  const stem = pdf.slice(pdf.indexOf("/") + 1);
  const alsoIn = CATEGORIES.filter(
    (c) => `cat${c}` !== pdf.split("/")[0] && existsSync(join(EXAMS_DIR, `cat${c}`, `${stem}.pdf`))
  ).map((c) => `cat${c}`);
  return { exists: false, baselined: isBaselined(pdf), alsoIn };
}

export const imageExists = (rel: string) => existsSync(join(PUBLIC_DIR, rel));

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

export const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

/**
 * What the author typed, resolved to one of the two things it can be.
 *
 * A figure already under `public/images/` is referenced where it lies — the
 * same drawing is sometimes cited by more than one question. Anything else is
 * a file somewhere on disk, to be copied in at write time.
 */
export type ImageInput =
  | { kind: "public"; rel: string }
  | { kind: "file"; from: string; ext: string }
  | { kind: "missing" }
  | { kind: "unsupported"; ext: string };

export function classifyImage(input: string): ImageInput {
  const rel = input.replace(/^\//, "");
  if (rel.startsWith("images/") && imageExists(rel)) return { kind: "public", rel };

  const from = resolve(input.startsWith("~/") ? join(homedir(), input.slice(2)) : input);
  if (!existsSync(from) || !statSync(from).isFile()) return { kind: "missing" };
  const ext = extname(from).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return { kind: "unsupported", ext };
  return { kind: "file", from, ext };
}

/**
 * Named for the question rather than for the file it came from.
 *
 * `Screenshot 2026-08-27 at 14.03.11.png` is not a name to carry into the
 * repo, and a descriptive one taken from the source risks colliding with a
 * figure another question already references — which would silently replace
 * that question's drawing.
 */
export const imageDestination = (category: CategoryId, id: number, ext: string) =>
  `images/cat${category}/q${id}${ext}`;

/* -------------------------------------------------------------------------- */
/* Field prompts                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Prose through $EDITOR, seeded with whatever is already there.
 *
 * Prose at a readline prompt is miserable, and this is the field that gives a
 * question its value. The interface is closed first: the editor takes over the
 * terminal, and two readers on one stdin fight over the keystrokes.
 */
export async function askExplanation(initial = ""): Promise<string | null> {
  const editor = process.env.VISUAL ?? process.env.EDITOR;
  if (editor === undefined || editor.trim().length === 0) {
    if (initial.length > 0) {
      console.log(dim("  explicação atual:"));
      console.log(dim(clip(initial, 300).replace(/^/gm, "  | ")));
      console.log(dim("  $EDITOR não definido — reescreva-a, terminando com uma linha só com ."));
      console.log(dim("  (uma linha só com = mantém a atual)"));
    } else {
      console.log(
        dim("  $EDITOR não definido — escreva a explicação, terminando com uma linha só com .")
      );
    }
    const lines: string[] = [];
    for (;;) {
      const line = await ask(dim("| "));
      if (line.trim() === "=") return initial.length > 0 ? initial : null;
      if (line.trim() === ".") break;
      lines.push(line);
    }
    const typed = lines.join("\n").trim();
    return typed.length > 0 ? typed : null;
  }

  const tmp = join(tmpdir(), `content-${process.pid}.mdx`);
  writeFileSync(tmp, initial);
  closePrompts();
  const result = spawnSync(editor, [tmp], { stdio: "inherit", shell: true });
  if (result.error) {
    unlinkSync(tmp);
    throw new Error(`não foi possível abrir ${editor}: ${result.error.message}`);
  }
  const body = readFileSync(tmp, "utf-8").trim();
  unlinkSync(tmp);
  return body.length > 0 ? body : null;
}

export async function askAnswers(current?: Draft["answers"]): Promise<Draft["answers"]> {
  console.log(`\n${bold("Opções")} ${dim(`(${EXPECTED_OPTIONS}; Enter numa vazia termina)`)}`);
  if (current !== undefined) {
    console.log(dim("  Enter mantém a opção atual, mostrada por baixo do número"));
  }
  const texts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const existing = current?.[i]?.text;
    if (existing !== undefined) console.log(dim(`  ${i + 1}. ${clip(existing, 92)}`));
    const text = await askText(`  ${i + 1}`, { required: current === undefined && i < 2 });
    if (text.length === 0) {
      if (existing === undefined) break;
      texts.push(existing);
      continue;
    }
    texts.push(text);
  }

  const previous = current?.findIndex((a) => a.correct) ?? -1;
  const correct = await askChoice<number>(
    "Qual é a correta?",
    texts.map((t, i) => ({
      value: i,
      label: clip(t, 90),
      ...(i === previous ? { hint: "atual" } : {}),
    }))
  );
  return texts.map((text, i) => (i === correct ? { text, correct: true } : { text }));
}

/**
 * The taxonomy as a picker.
 *
 * `topic` is free text in the schema, and a misspelled slug is the one mistake
 * in these files that nothing reports: the label silently stops rendering and
 * the browse filter silently stops matching. Choosing from the list makes it
 * unrepresentable rather than merely detectable.
 */
export async function askTopic(current?: string | null): Promise<string | null> {
  return askChoice<string>(
    "Matéria",
    TOPICS.map((t) => ({
      value: t.slug,
      label: t.slug.padEnd(16),
      hint: `${t.shortPt} — a partir de cat${t.examinedFrom}${t.slug === current ? "  (atual)" : ""}`,
    })),
    { allowNone: true, noneLabel: current == null ? "Enter para nenhum" : "Enter para manter a atual" }
  );
}

/**
 * The two numbers are asked as two sentences.
 *
 * `question` is the pergunta number printed in the paper and `page` is the PDF
 * page; the papers carry about four questions per page, so they are unrelated,
 * and typing one into both fields is the easiest mistake here to make.
 */
export async function askSources(): Promise<Draft["sources"]> {
  const sources: NonNullable<Draft["sources"]> = [];
  for (;;) {
    console.log(
      `\n${bold("Prova oficial")} ${dim(
        sources.length === 0 ? "(Enter para saltar)" : "(Enter para terminar)"
      )}`
    );
    const pdf = await askText("  Ficheiro sob public/exams (ex.: cat3/2023_08_18)", {
      required: false,
    });
    if (pdf.length === 0) return sources;

    const { exists, baselined, alsoIn } = pdfLookup(pdf);
    console.log(
      exists
        ? `  ${green("✓")} ${dim("existe em public/exams")}`
        : `  ${yellow("!")} ${dim(
            alsoIn.length > 0
              ? `não existe aqui, mas existe em ${alsoIn.join(", ")}`
              : baselined
                ? "não existe em public/exams, mas está baselinado"
                : "não existe em public/exams"
          )}`
    );

    const question = Number.parseInt(await askText("  Número da pergunta impresso na prova"), 10);
    const pageRaw = await askText("  Página do PDF em que está impressa (Enter se desconhecida)", {
      required: false,
    });

    sources.push({
      pdf,
      question,
      page: pageRaw.length > 0 ? Number.parseInt(pageRaw, 10) : null,
    });
  }
}

/**
 * Validated as it is typed, not at the end.
 *
 * The path is the one field here the author can get wrong without noticing —
 * a typo yields a question that renders a broken image — and finding out after
 * everything else has been entered is the wrong moment.
 */
export async function askImage(): Promise<string | null> {
  for (;;) {
    const input = await askText(
      `\n${bold("Imagem")} ${dim("caminho do ficheiro, ou images/cat3/x.png já em public/ (Enter se nenhuma)")}`,
      { required: false }
    );
    if (input.length === 0) return null;

    const classified = classifyImage(input);
    if (classified.kind === "public") {
      console.log(`  ${green("✓")} ${dim("já está em public/, referenciada onde está")}`);
      return input;
    }
    if (classified.kind === "file") {
      console.log(`  ${green("✓")} ${dim(`${classified.from} — copiada ao escrever`)}`);
      return input;
    }
    console.log(
      `  ${red("✗")} ${dim(
        classified.kind === "unsupported"
          ? `${classified.ext} não é um formato de imagem (${[...IMAGE_EXTENSIONS].join(", ")})`
          : "não existe, nem sob public/ nem como ficheiro"
      )}`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Writing                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Writes a question and regenerates its category's artifacts.
 *
 * `order` is passed rather than derived: adding a question inserts into it,
 * editing one leaves it alone, and neither tool should have to know how the
 * other does it.
 *
 * The category is reloaded from disk rather than reusing what is in memory, so
 * a round-trip surprise — anything the serializer drops — surfaces here rather
 * than in the next `content:check`.
 */
export function writeQuestion(
  category: CategoryId,
  question: ContentQuestion,
  order: readonly number[]
): string[] {
  const sourceDir = sourceDirOf(category);
  const manifest = loadManifest(category);
  const questionFile = join(sourceDir, `${String(question.id).padStart(4, "0")}.mdx`);

  writeFileSync(questionFile, serializeQuestionFile(question));
  writeFileSync(
    join(sourceDir, MANIFEST_FILE),
    serializeManifest({ ...manifest, order: [...order] })
  );

  const { appJson, notes } = emitCategory(loadCategory(sourceDir), EXAMS_DIR);
  const dataFile = join(ROOT, "public", "data", `cat${category}.json`);
  writeFileSync(dataFile, appJson);

  const written = [questionFile, join(sourceDir, MANIFEST_FILE), dataFile];

  const noteFile = join(ROOT, "content", "notes", `cat${category}`, `${question.id}.mdx`);
  const note = notes.get(question.id);
  if (note !== undefined) {
    mkdirSync(join(noteFile, ".."), { recursive: true });
    writeFileSync(noteFile, note);
    written.push(noteFile);
  } else if (existsSync(noteFile)) {
    // The explanation was removed, or the question was withheld. Leaving the
    // note behind would keep it served: `/api/notes` reads from disk without
    // consulting the bank.
    unlinkSync(noteFile);
    written.push(`${noteFile} (removido)`);
  }

  return written.map((f) => f.replace(`${ROOT}/`, ""));
}
