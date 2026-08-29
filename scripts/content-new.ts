#!/usr/bin/env bun
/**
 * Adds a question to the bank.
 *
 *   bun run content:new                      # interactive
 *   bun run content:new --from draft.mdx     # a question file, id left out
 *   cat draft.mdx | bun run content:new --from - --cat 3 --yes
 *   bun run content:new --from draft.mdx --dry-run
 *
 * It writes the two files a question owns — `content/questions/cat{n}/{id}.mdx`
 * and one line of `order` in `category.json` — then regenerates that
 * category's artifacts, leaving the tree in the state `content:check` expects.
 *
 * Everything it decides is in `lib/content/author.ts`; this file is I/O,
 * prompting and formatting, the same split as `qbank`.
 *
 * The draft format is the destination format. `--from` takes a question file
 * with the `id` omitted, so there is no second schema to learn, a rejected
 * draft is fixed and re-fed unchanged, and the file that is finally written is
 * the file that was reviewed.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  copyFileSync,
  statSync,
} from "fs";
import { join, resolve, extname } from "path";
import { tmpdir, homedir } from "os";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import {
  loadCategory,
  emitCategory,
  serializeManifest,
  CategoryManifestSchema,
  MANIFEST_FILE,
  type CategoryManifest,
} from "../lib/content/build";
import { serializeQuestionFile, questionFileName } from "../lib/content/source";
import { buildBank, orderEntries, type BankQuestion } from "../lib/content/analysis";
import {
  reviewDraft,
  insertIntoOrder,
  nextId,
  hasErrors,
  EXPECTED_OPTIONS,
  type Draft,
  type Finding,
  type OrderAnchor,
} from "../lib/content/author";
import {
  bold,
  dim,
  red,
  green,
  yellow,
  interactive,
  ask,
  askText,
  askChoice,
  confirm as askConfirm,
  closePrompts,
} from "./prompt";
import { TOPICS, topicShortLabel } from "../lib/config/topics";
import { CATEGORIES, type CategoryId } from "../lib/config/categories";
import type { ContentCategory } from "../lib/content/schema";

// Resolved from the working directory, like the other content scripts; these
// are always invoked via `bun run` from the project root.
const ROOT = process.cwd();
const EXAMS_DIR = join(ROOT, "public", "exams");
const PUBLIC_DIR = join(ROOT, "public");

/* -------------------------------------------------------------------------- */
/* Arguments                                                                   */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const flags = new Map<string, string | true>();
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i] ?? "";
  if (!arg.startsWith("--")) continue;
  const [name, inline] = arg.slice(2).split("=", 2);
  if (!name) continue;
  if (inline !== undefined) {
    flags.set(name, inline);
    continue;
  }
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith("--")) {
    flags.set(name, next);
    i++;
  } else {
    flags.set(name, true);
  }
}
const flag = (name: string): string | undefined => {
  const value = flags.get(name);
  return typeof value === "string" ? value : undefined;
};
const has = (name: string) => flags.has(name);

const dryRun = has("dry-run");
const assumeYes = has("yes");
const force = has("force");

/* -------------------------------------------------------------------------- */
/* Output                                                                      */
/* -------------------------------------------------------------------------- */

/** Truncates for a one-line summary, on a word boundary where it can. */
function clip(text: string, width: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= width) return flat;
  const cut = flat.slice(0, width - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > width * 0.6 ? cut.slice(0, space) : cut}…`;
}

function die(message: string, ...detail: string[]): never {
  console.error(`\n${red("✗")} ${message}`);
  for (const d of detail) console.error(`  ${d}`);
  closePrompts();
  process.exit(1);
}

function usage(): never {
  console.log(bold("content:new — acrescentar uma pergunta ao banco"));
  console.log();
  console.log("  bun run content:new                     interativo");
  console.log("  bun run content:new --from draft.mdx    a partir de um ficheiro (- para stdin)");
  console.log();
  console.log(dim("  --cat 3        categoria (perguntada se faltar)"));
  console.log(dim("  --after 107    posição no order; também --before 108 ou --end"));
  console.log(dim("  --image fig.png  imagem a copiar para public/images/cat{n}/"));
  console.log(dim("  --dry-run      mostra o que escreveria, sem escrever nada"));
  console.log(dim("  --yes          não pergunta (obrigatório quando stdin é um pipe)"));
  console.log(dim("  --force        escreve apesar dos avisos"));
  console.log();
  console.log(dim("  O ficheiro de --from é um ficheiro de pergunta com o `id` omitido."));
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Prompting                                                                   */
/* -------------------------------------------------------------------------- */

/** `assumeYes` is this script's flag, so every call site passes it. */
const confirm = (question: string, fallback = false) =>
  askConfirm(question, { fallback, assumeYes });

/**
 * The explanation body, through $EDITOR.
 *
 * Prose at a readline prompt is miserable, and this is the field that gives a
 * question its value. The interface is closed first: the editor takes over the
 * terminal, and two readers on one stdin fight over the keystrokes.
 */
async function askExplanation(): Promise<string | null> {
  const editor = process.env.VISUAL ?? process.env.EDITOR;
  if (editor === undefined || editor.trim().length === 0) {
    console.log(dim("  $EDITOR não definido — escreva a explicação, terminando com uma linha só com ."));
    const lines: string[] = [];
    for (;;) {
      const line = await ask(dim("| "));
      if (line.trim() === ".") break;
      lines.push(line);
    }
    const typed = lines.join("\n").trim();
    return typed.length > 0 ? typed : null;
  }

  const tmp = join(tmpdir(), `content-new-${process.pid}.mdx`);
  writeFileSync(tmp, "");
  closePrompts();
  const result = spawnSync(editor, [tmp], { stdio: "inherit", shell: true });
  if (result.error) {
    unlinkSync(tmp);
    die(`não foi possível abrir ${editor}`, result.error.message);
  }
  const body = readFileSync(tmp, "utf-8").trim();
  unlinkSync(tmp);
  return body.length > 0 ? body : null;
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function sourceDirOf(category: CategoryId): string {
  return join(ROOT, "content", "questions", `cat${category}`);
}

function loadAll(): { categories: ContentCategory[]; bank: BankQuestion[] } {
  const categories = CATEGORIES.filter((c) => existsSync(sourceDirOf(c))).map((c) =>
    loadCategory(sourceDirOf(c))
  );
  return { categories, bank: buildBank(categories) };
}

function loadManifest(category: CategoryId): CategoryManifest {
  return CategoryManifestSchema.parse(
    JSON.parse(readFileSync(join(sourceDirOf(category), MANIFEST_FILE), "utf-8"))
  );
}

/** Existence of an exam PDF, with the wrong-prefix hint `findDanglingPdfs` gives. */
function pdfLookup(pdf: string): { exists: boolean; alsoIn: string[] } {
  if (existsSync(join(EXAMS_DIR, `${pdf}.pdf`))) return { exists: true, alsoIn: [] };
  const stem = pdf.slice(pdf.indexOf("/") + 1);
  const alsoIn = CATEGORIES.filter(
    (c) => `cat${c}` !== pdf.split("/")[0] && existsSync(join(EXAMS_DIR, `cat${c}`, `${stem}.pdf`))
  ).map((c) => `cat${c}`);
  return { exists: false, alsoIn };
}

const imageExists = (rel: string) => existsSync(join(PUBLIC_DIR, rel));

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

/**
 * What the author typed, resolved to one of the two things it can be.
 *
 * A figure already under `public/images/` is referenced where it lies — the
 * same drawing is sometimes cited by more than one question. Anything else is
 * a file somewhere on disk, to be copied in at write time.
 */
type ImageInput =
  | { kind: "public"; rel: string }
  | { kind: "file"; from: string; ext: string }
  | { kind: "missing" }
  | { kind: "unsupported"; ext: string };

function classifyImage(input: string): ImageInput {
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
 * that question's drawing. The id is new, so this name cannot be taken.
 */
const imageDestination = (category: CategoryId, id: number, ext: string) =>
  `images/cat${category}/q${id}${ext}`;

/* -------------------------------------------------------------------------- */
/* Drafts from a file                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Reads a draft in the destination file format.
 *
 * Nothing is coerced here beyond the category: an unexpected shape has to
 * reach the schema so the error names the field, rather than being quietly
 * reinterpreted into something that parses.
 */
function draftFromFile(raw: string, category: CategoryId | null): Draft {
  const { data, content } = matter(raw);
  const fields = data as Record<string, unknown>;

  // Coerced rather than type-checked: `category: 3` is a YAML number and
  // `category: "3"` a string, and the difference is not one an author should
  // have to know about.
  const declared =
    fields.category === undefined || fields.category === null
      ? null
      : String(fields.category).replace(/^cat/, "");
  const resolved = category ?? declared;
  if (resolved === null || !CATEGORIES.includes(resolved as CategoryId)) {
    die(
      "categoria em falta ou desconhecida",
      "Passe --cat 3, ou acrescente `category: 3` ao frontmatter do rascunho."
    );
  }

  const body = content.trim();
  return {
    category: resolved as CategoryId,
    id: typeof fields.id === "number" ? fields.id : undefined,
    question: fields.question as string,
    answers: fields.answers as Draft["answers"],
    disabled: (fields.disabled ?? null) as string | null,
    topic: (fields.topic ?? null) as string | null,
    sources: fields.sources as Draft["sources"],
    image: (fields.image ?? null) as string | null,
    tutorial: (fields.tutorial ?? null) as string | null,
    calc: (fields.calc ?? null) as string | null,
    explanation: body.length > 0 ? body : null,
  };
}

function readDraftSource(from: string): string {
  if (from === "-") return readFileSync(0, "utf-8");
  if (!existsSync(from)) die(`${from} não existe`);
  return readFileSync(from, "utf-8");
}

/* -------------------------------------------------------------------------- */
/* Interactive draft                                                           */
/* -------------------------------------------------------------------------- */

async function askCategory(): Promise<CategoryId> {
  // Listed ascending, deliberately against the 3→2→1 order used everywhere
  // else in the app. `askChoice` numbers its options by position, so listing
  // CATEGORIES as-is made "1" select cat3 and "3" select cat1 — a prompt whose
  // numbers are all wrong in a way that reads as right. Here the number typed
  // is the category chosen; the beginner-first order stays a UI concern.
  const ascending = [...CATEGORIES].sort((a, b) => Number(a) - Number(b));
  const chosen = await askChoice<CategoryId>(
    "Categoria",
    ascending.map((c) => ({ value: c, label: `Categoria ${c}` }))
  );
  return chosen ?? "3";
}

async function askAnswers(): Promise<Draft["answers"]> {
  console.log(`\n${bold("Opções")} ${dim(`(${EXPECTED_OPTIONS}; Enter numa vazia termina)`)}`);
  const texts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const text = await askText(`  ${i + 1}`, { required: i < 2 });
    if (text.length === 0) break;
    texts.push(text);
  }

  const correct = await askChoice<number>(
    "Qual é a correta?",
    texts.map((t, i) => ({ value: i, label: clip(t, 90) }))
  );
  return texts.map((text, i) => (i === correct ? { text, correct: true } : { text }));
}

/**
 * The taxonomy as a picker.
 *
 * `topic` is free text in the schema, and a misspelled slug is the one mistake
 * in this file that nothing reports: the label silently stops rendering and
 * the browse filter silently stops matching. Choosing from the list makes it
 * unrepresentable rather than merely detectable.
 */
async function askTopic(): Promise<string | null> {
  return askChoice<string>(
    "Matéria",
    TOPICS.map((t) => ({
      value: t.slug,
      label: t.slug.padEnd(16),
      hint: `${t.shortPt} — a partir de cat${t.examinedFrom}`,
    })),
    { allowNone: true }
  );
}

/**
 * The two numbers are asked as two sentences.
 *
 * `question` is the pergunta number printed in the paper and `page` is the PDF
 * page; the papers carry about four questions per page, so they are unrelated,
 * and typing one into both fields is the easiest mistake here to make.
 */
async function askSources(): Promise<Draft["sources"]> {
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

    const { exists, alsoIn } = pdfLookup(pdf);
    console.log(
      exists
        ? `  ${green("✓")} ${dim("existe em public/exams")}`
        : `  ${yellow("!")} ${dim(
            alsoIn.length > 0
              ? `não existe aqui, mas existe em ${alsoIn.join(", ")}`
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
 * the enunciado, the options and the explanation have all been entered is the
 * wrong moment.
 */
async function askImage(): Promise<string | null> {
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

async function askDraft(): Promise<Draft> {
  const catFlag = flag("cat");
  const category =
    catFlag === undefined ? await askCategory() : (catFlag.replace(/^cat/, "") as CategoryId);
  if (!CATEGORIES.includes(category)) {
    die(`categoria ${category} desconhecida`, `Categorias: ${CATEGORIES.join(", ")}`);
  }

  const { order } = loadManifest(category);
  console.log(
    `\n${dim(
      `cat${category}: ${order.length} perguntas, id mais alto ${Math.max(...order)}, novo id`
    )} ${bold(String(nextId(order)))}`
  );

  console.log();
  const question = await askText(bold("Enunciado"));
  const answers = await askAnswers();
  const topic = await askTopic();
  const sources = await askSources();

  const image = flag("image") ?? (await askImage());

  console.log(`\n${bold("Explicação")} ${dim("— o corpo MDX. Pode ficar vazia.")}`);
  console.log(dim(`  ${clip(question, 100)}`));
  const explanation = await askExplanation();

  return {
    category,
    question,
    answers,
    topic,
    sources,
    image,
    explanation,
  };
}

/* -------------------------------------------------------------------------- */
/* Reporting                                                                   */
/* -------------------------------------------------------------------------- */

function printSummary(draft: Draft, id: number, review: ReturnType<typeof reviewDraft>): void {
  const file = join("content", "questions", `cat${draft.category}`, questionFileName(id));
  console.log(`\n${bold(`cat${draft.category}#${id}`)}  ${dim(file)}`);

  const q = review.question;
  if (q === null) return;

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
  ];
  console.log(`  ${dim(marks.join("  |  "))}`);
}

function printFindings(findings: readonly Finding[]): void {
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

/* -------------------------------------------------------------------------- */
/* Order placement                                                             */
/* -------------------------------------------------------------------------- */

const anchorId = (raw: string) => Number.parseInt(raw.replace(/^.*#/, ""), 10);

function anchorFromFlags(): OrderAnchor | null {
  if (has("end")) return { kind: "end" };
  const after = flag("after");
  if (after !== undefined) return { kind: "after", id: anchorId(after) };
  const before = flag("before");
  if (before !== undefined) return { kind: "before", id: anchorId(before) };
  return null;
}

/**
 * Where the question goes in the browse sequence.
 *
 * Left to a human on purpose: the order is by subject — cat3's 210-213 sit at
 * positions 8, 10, 19 and 31 — so the right slot is beside the questions about
 * the same thing, and no rule here can find it. What the tool can do is show
 * that neighbourhood instead of quietly appending.
 */
async function askAnchor(category: ContentCategory, topic: string | null): Promise<OrderAnchor> {
  // Positions come from `orderEntries`, the same function `qbank order` uses,
  // so the neighbourhood shown here and the one shown there cannot disagree.
  const entries = orderEntries(buildBank([category]));
  const sameTopic = topic === null ? [] : entries.filter((e) => e.question.topic === topic);
  const shown = sameTopic.length > 0 ? sameTopic.slice(-12) : entries.slice(-8);

  console.log(`\n${bold("Posição no order")} ${dim("— é editorial, não numérica")}`);
  console.log(
    dim(
      sameTopic.length > 0
        ? `  ${sameTopic.length} perguntas de ${topicShortLabel(topic ?? "", "pt") ?? topic}, as últimas ${shown.length}:`
        : "  fim do order:"
    )
  );
  for (const e of shown) {
    const position = dim(`pos ${String(e.position).padStart(3)}`);
    console.log(`  ${position}  ${bold(`#${e.question.id}`)}  ${clip(e.question.question, 76)}`);
  }

  for (;;) {
    const raw = (
      await ask(`\nInserir depois de que id? ${dim("(Enter = no fim do order)")} ${dim("›")} `)
    ).trim();
    if (raw.length === 0) return { kind: "end" };
    const id = anchorId(raw);
    if (category.questions.some((q) => q.id === id)) return { kind: "after", id };
    console.log(dim(`  ${id} não está no order de cat${category.id}`));
  }
}

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  if (has("help") || has("h")) usage();

  const from = flag("from");
  if (from === undefined && !interactive) {
    die(
      "stdin não é um terminal e não foi passado --from",
      "bun run content:new --from draft.mdx --cat 3 --yes"
    );
  }

  const catFlag = flag("cat");
  const draft =
    from === undefined
      ? await askDraft()
      : draftFromFile(
          readDraftSource(from),
          catFlag === undefined ? null : (catFlag.replace(/^cat/, "") as CategoryId)
        );

  const sourceDir = sourceDirOf(draft.category);
  if (!existsSync(sourceDir)) die(`${sourceDir} não existe`);

  const manifest = loadManifest(draft.category);
  const { categories, bank } = loadAll();
  const category = categories.find((c) => c.id === draft.category);
  if (category === undefined) die(`cat${draft.category} não carregou`);

  const id = draft.id ?? nextId(manifest.order);

  // Resolved here rather than at the prompt because the destination name is
  // built from the id, and copied later still: a --dry-run, a blocking error
  // or an abandoned warning must not leave a file behind in public/.
  const rawImage = flag("image") ?? draft.image ?? null;
  let image: string | null = null;
  let imageCopy: { from: string; to: string } | null = null;
  if (rawImage !== null && rawImage.length > 0) {
    const classified = classifyImage(rawImage);
    switch (classified.kind) {
      case "public":
        image = classified.rel;
        break;
      case "file": {
        image = imageDestination(draft.category, id, classified.ext);
        const to = join(PUBLIC_DIR, image);
        // The id is new, so this can only be a leftover — and overwriting it
        // would replace a figure that something else may already reference.
        if (existsSync(to)) die(`${image} já existe`, "Remova-o ou mude-lhe o nome.");
        imageCopy = { from: classified.from, to };
        break;
      }
      case "unsupported":
        die(
          `${rawImage}: ${classified.ext} não é um formato de imagem`,
          `Formatos: ${[...IMAGE_EXTENSIONS].join(", ")}`
        );
      // falls through to die; listed so the switch stays exhaustive
      case "missing":
        die(
          `${rawImage} não existe`,
          "Passe o caminho de um ficheiro, ou um images/… já sob public/."
        );
    }
  }

  const review = reviewDraft(
    { ...draft, id, image },
    {
      category: draft.category,
      anacomFile: manifest.anacomFile,
      // The draft is not in the bank yet, so there is nothing to exclude — and
      // it is compared against all three categories, since the duplicate that
      // matters most is the one already examined at another level.
      bank,
      order: manifest.order,
      pdfLookup,
      // The copy has not happened yet, so the destination has to count as
      // present or the review reports the image it is about to write as
      // missing.
      imageExists: (rel: string) => imageExists(rel) || (imageCopy !== null && rel === image),
    }
  );

  printSummary(draft, id, review);
  printFindings(review.findings);

  const question = review.question;
  if (question === null || hasErrors(review.findings)) {
    console.error(`\n${red("✗")} não escrito — corrija os erros acima.`);
    closePrompts();
    process.exit(1);
  }

  if (review.findings.length > 0 && !force) {
    if (!(await confirm(`\n${review.findings.length} aviso(s). Continuar?`))) {
      console.log(
        dim(
          interactive || assumeYes
            ? "cancelado"
            : "avisos por confirmar — reveja-os e repita com --yes, ou --force"
        )
      );
      closePrompts();
      process.exit(1);
    }
  }

  const anchor =
    anchorFromFlags() ?? (interactive ? await askAnchor(category, question.topic) : { kind: "end" });
  const order = insertIntoOrder(manifest.order, id, anchor);
  const position = order.indexOf(id) + 1;

  const questionFile = join(sourceDir, questionFileName(id));
  const body = serializeQuestionFile(question);

  if (dryRun) {
    console.log(`\n${bold("--dry-run")} ${dim("— nada foi escrito")}`);
    console.log(`\n${dim(`${questionFile.replace(`${ROOT}/`, "")}:`)}`);
    console.log(body.replace(/^/gm, "  ").trimEnd());
    console.log(
      `\n${dim(
        `category.json: order posição ${position} de ${order.length}, depois de ${
          order[position - 2] ?? "—"
        }`
      )}`
    );
    if (imageCopy !== null) {
      console.log(dim(`${imageCopy.from}  →  public/${image}`));
    }
    closePrompts();
    return;
  }

  writeFileSync(questionFile, body);
  writeFileSync(join(sourceDir, MANIFEST_FILE), serializeManifest({ ...manifest, order }));
  if (imageCopy !== null) {
    mkdirSync(join(imageCopy.to, ".."), { recursive: true });
    copyFileSync(imageCopy.from, imageCopy.to);
  }

  // Reloaded rather than reused: this parses back what was just written, so a
  // round-trip surprise surfaces here instead of in the next `content:check`.
  const { appJson, notes } = emitCategory(loadCategory(sourceDir), EXAMS_DIR);
  const dataFile = join(ROOT, "public", "data", `cat${draft.category}.json`);
  writeFileSync(dataFile, appJson);

  const written = [
    questionFile,
    join(sourceDir, MANIFEST_FILE),
    dataFile,
    ...(imageCopy === null ? [] : [imageCopy.to]),
  ];
  const note = notes.get(id);
  if (note !== undefined) {
    const noteFile = join(ROOT, "content", "notes", `cat${draft.category}`, `${id}.mdx`);
    mkdirSync(join(noteFile, ".."), { recursive: true });
    writeFileSync(noteFile, note);
    written.push(noteFile);
  }

  console.log(
    `\n${green("✓")} cat${draft.category}#${id}, posição ${position} de ${order.length}`
  );
  for (const f of written) console.log(`  ${f.replace(`${ROOT}/`, "")}`);
  console.log(dim("\n  bun run content:check    # confirma que os artefactos batem certo"));
  closePrompts();
}

main()
  .then(() => closePrompts())
  .catch((error: unknown) => {
    die(error instanceof Error ? error.message : String(error));
  });
