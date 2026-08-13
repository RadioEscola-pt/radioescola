#!/usr/bin/env bun
/**
 * OCR the official exam PDFs and map the questions they contain back to the
 * question bank, so `sources` / `sourcePages` can be filled in automatically
 * instead of by hand.
 *
 * Why OCR at all: 55 of the 59 PDFs in public/exams/ are scans with no text
 * layer, so `pdftotext` returns nothing for them.
 *
 * Why the threshold step: the scans are very low contrast — on a typical page
 * only ~2% of pixels fall below 128 and ~86% sit between 128 and 191 — which
 * defeats tesseract's internal binarization; it returns an empty page. An
 * explicit threshold before OCR is the difference between nothing and a clean
 * read. `pdftoppm -mono` is not a substitute: it dithers, which shreds text.
 *
 * Pipeline, per page:
 *   pdftoppm -> grayscale + threshold (sharp) -> tesseract -> text
 * then the text is split into numbered question blocks and each is matched
 * against the bank by character-trigram similarity on accent-stripped text.
 * Accents are stripped because English-model OCR mangles them consistently
 * ("Radiocomunicações" -> "RadiocomunicagSes"), so they carry no signal.
 *
 * A question block is matched only against its own category, which the PDF's
 * folder gives us for free.
 *
 * Usage:
 *   bun run data:ocr-exams                 # every PDF, report only
 *   bun run data:ocr-exams cat3            # only PDFs whose key matches "cat3"
 *   bun run data:ocr-exams 2023_08 --dpi 150
 *   bun run data:ocr-exams --apply         # write confident matches to source
 *
 * OCR output is cached under .ocr-cache/ keyed by pdf+page+dpi+threshold+lang,
 * so re-runs are cheap and interrupting is safe. --refresh ignores the cache.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { tmpdir } from "node:os";
import { cpus } from "node:os";
import sharp from "sharp";
import { loadCategory, emitCategory } from "../lib/content/build";
import { serializeQuestionFile, questionFileName } from "../lib/content/source";
import type { ContentCategory, ContentQuestion } from "../lib/content/schema";

const run = promisify(execFile);
const ROOT = process.cwd();
const EXAMS_DIR = join(ROOT, "public", "exams");
const CACHE_DIR = join(ROOT, ".ocr-cache");
const CATEGORIES = ["1", "2", "3"] as const;

// ---------------------------------------------------------------- CLI

type Options = {
  filters: string[];
  dpi: number;
  threshold: number;
  lang: string;
  jobs: number;
  minScore: number;
  /**
   * Stricter bar for writing a page number than for reporting a match.
   * A borderline match once put a question on page 7 because page 7 carried
   * it as an *answer option* of a different question; that scored 0.583, just
   * over the reporting threshold. Reporting a doubtful match is cheap, writing
   * one is not.
   */
  minFillScore: number;
  /** Reject a match whose runner-up is nearly as good. */
  minMargin: number;
  refresh: boolean;
  apply: boolean;
  reportPath: string;
};

function parseArgs(argv: string[]): Options {
  const filters: string[] = [];
  const opts: Options = {
    filters,
    dpi: 300,
    threshold: 140,
    lang: "",
    jobs: Math.max(1, cpus().length - 2),
    minScore: 0.55,
    minFillScore: 0.65,
    minMargin: 0.08,
    refresh: false,
    apply: false,
    reportPath: join(CACHE_DIR, "report.json"),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${arg} needs a value`);
      return v;
    };
    if (arg === "--dpi") opts.dpi = Number(next());
    else if (arg === "--threshold") opts.threshold = Number(next());
    else if (arg === "--lang") opts.lang = next();
    else if (arg === "--jobs") opts.jobs = Math.max(1, Number(next()));
    else if (arg === "--min-score") opts.minScore = Number(next());
    else if (arg === "--min-fill-score") opts.minFillScore = Number(next());
    else if (arg === "--min-margin") opts.minMargin = Number(next());
    else if (arg === "--report") opts.reportPath = next();
    else if (arg === "--refresh") opts.refresh = true;
    else if (arg === "--apply") opts.apply = true;
    else if (arg.startsWith("--")) throw new Error(`unknown flag: ${arg}`);
    else filters.push(arg.toLowerCase());
  }
  return opts;
}

// ---------------------------------------------------------------- tooling

async function hasBin(bin: string): Promise<boolean> {
  try {
    await run("sh", ["-c", `command -v ${bin}`]);
    return true;
  } catch {
    return false;
  }
}

async function tesseractLangs(): Promise<Set<string>> {
  try {
    const { stdout, stderr } = await run("tesseract", ["--list-langs"]);
    return new Set(
      `${stdout}\n${stderr}`
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.includes(" "))
    );
  } catch {
    return new Set();
  }
}

/**
 * Portuguese data makes a real difference on accented words; without it the
 * English model still reads the structure fine, which is why matching strips
 * accents rather than relying on them.
 */
async function pickLanguage(requested: string): Promise<string> {
  const langs = await tesseractLangs();
  if (requested) {
    if (!langs.has(requested)) {
      throw new Error(
        `tesseract language "${requested}" is not installed (have: ${[...langs].join(", ")})`
      );
    }
    return requested;
  }
  if (langs.has("por")) return "por";
  console.warn(
    "! Portuguese tesseract data not found — falling back to 'eng'.\n" +
      "  Accented words will be misread; matching strips accents so this mostly\n" +
      "  still works, but install it for better results:\n" +
      "    Arch:   sudo pacman -S tesseract-data-por\n" +
      "    Debian: sudo apt install tesseract-ocr-por\n"
  );
  return "eng";
}

// ---------------------------------------------------------------- pdfs

type Pdf = { key: string; cat: string; path: string; pages: number };

function listPdfs(filters: string[]): Promise<Pdf[]> {
  const found: Omit<Pdf, "pages">[] = [];
  for (const cat of CATEGORIES) {
    const dir = join(EXAMS_DIR, `cat${cat}`);
    if (!existsSync(dir)) continue;
    for (const name of readdirSorted(dir)) {
      if (!name.toLowerCase().endsWith(".pdf")) continue;
      const key = `cat${cat}/${name.slice(0, -4)}`;
      if (filters.length && !filters.some((f) => key.toLowerCase().includes(f))) continue;
      found.push({ key, cat, path: join(dir, name) });
    }
  }
  return Promise.all(
    found.map(async (p) => ({ ...p, pages: await pageCount(p.path) }))
  );
}

function readdirSorted(dir: string): string[] {
  return readdirSync(dir).sort();
}

async function pageCount(pdfPath: string): Promise<number> {
  try {
    const { stdout } = await run("pdfinfo", [pdfPath]);
    const m = /^Pages:\s+(\d+)$/m.exec(stdout);
    return m ? Number(m[1]) : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------- ocr

function cachePath(pdf: Pdf, page: number, o: Options): string {
  const stamp = `${o.dpi}-${o.threshold}-${o.lang}`;
  return join(CACHE_DIR, pdf.cat, basename(pdf.path, ".pdf"), `${stamp}-p${page}.txt`);
}

async function ocrPage(pdf: Pdf, page: number, o: Options): Promise<string> {
  const cached = cachePath(pdf, page, o);
  if (!o.refresh && existsSync(cached)) return readFileSync(cached, "utf-8");

  const work = join(tmpdir(), `ocr-${process.pid}-${pdf.cat}-${page}-${Math.trunc(performance.now())}`);
  mkdirSync(work, { recursive: true });
  try {
    const prefix = join(work, "page");
    await run("pdftoppm", [
      "-r", String(o.dpi),
      "-f", String(page),
      "-l", String(page),
      "-png",
      pdf.path,
      prefix,
    ]);

    const rendered = readdirSorted(work).find((f) => f.endsWith(".png"));
    if (!rendered) return "";

    // The step that makes these scans readable at all — see file header.
    const binarized = join(work, "bin.png");
    await sharp(join(work, rendered)).grayscale().threshold(o.threshold).png().toFile(binarized);

    const { stdout } = await run("tesseract", [binarized, "stdout", "-l", o.lang, "--psm", "6"]);
    mkdirSync(dirname(cached), { recursive: true });
    writeFileSync(cached, stdout);
    return stdout;
  } catch {
    return "";
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- parsing

export type OcrQuestion = { num: number; text: string };

/**
 * Lines like "1-da IARU", "2· da CEPT", "3. da UIT", "4: da NATO" start the
 * answer list.
 *
 * The separator class has to be generous: the same scan yields "1-da IARU"
 * under the English model and "1: da IARU" under the Portuguese one. Missing a
 * marker is costly — the four answers then get folded into the question text
 * as continuation lines, diluting the match for that question.
 */
const OPTION_RE = /^\s*['‘`|]?\s*[1-9]\s*[-–—·.•:;,)]+\s*\S/;
/**
 * Lines like "17 O Regulamento das ..." start a question.
 *
 * The leading `['‘`|.,-]?` matters: scan speckle regularly lands just left of
 * the number ("'17 O Regulamento", "‘6 Tenho sido"), and without it those
 * questions are silently swallowed into the previous block.
 */
const QUESTION_RE = /^\s*['‘`|.,\-]{0,2}\s*(\d{1,3})[.)\s]\s*(\S.*)$/;
const NOISE_RE = /^[^A-Za-zÀ-ÿ]*$/;

/**
 * Splits an OCR'd page into numbered question blocks.
 *
 * Continuation lines are folded into the question until the answer list
 * starts, because a question that wraps across lines otherwise matches on
 * only its first line and scores poorly.
 */
export function parsePage(text: string): OcrQuestion[] {
  const out: OcrQuestion[] = [];
  let current: OcrQuestion | null = null;
  let inOptions = false;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line || NOISE_RE.test(line)) continue;

    if (OPTION_RE.test(line)) {
      inOptions = true;
      continue;
    }

    const m = QUESTION_RE.exec(line);
    // A question header is a number followed by real words, not "17 X" noise.
    if (m && m[2] && m[2].replace(/[^A-Za-zÀ-ÿ]/g, "").length >= 8) {
      const num = Number(m[1]);
      if (num >= 1 && num <= 200) {
        if (current) out.push(current);
        current = { num, text: m[2] };
        inOptions = false;
        continue;
      }
    }

    if (current && !inOptions) current.text += ` ${line}`;
  }
  if (current) out.push(current);

  return out.filter((q) => q.text.replace(/[^A-Za-zÀ-ÿ]/g, "").length >= 15);
}

// ---------------------------------------------------------------- matching

/** Lowercase, strip accents and punctuation. OCR gets diacritics wrong. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trigrams(s: string): Map<string, number> {
  const padded = ` ${s} `;
  const out = new Map<string, number>();
  for (let i = 0; i < padded.length - 2; i++) {
    const g = padded.slice(i, i + 3);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

/** Dice coefficient over character trigrams: tolerant of OCR character noise. */
export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const ga = trigrams(a);
  const gb = trigrams(b);
  let shared = 0;
  let total = 0;
  for (const n of ga.values()) total += n;
  for (const [g, n] of gb) {
    total += n;
    shared += Math.min(n, ga.get(g) ?? 0);
  }
  return total === 0 ? 0 : (2 * shared) / total;
}

type Candidate = { question: ContentQuestion; normalized: string };

type Match = {
  pdf: string;
  page: number;
  num: number;
  ocrText: string;
  questionId: number | null;
  score: number;
  runnerUpScore: number;
  /** Whether the reference already exists in the source files. */
  alreadyLinked: boolean;
};

function bestMatch(ocrText: string, candidates: Candidate[]): { q: ContentQuestion | null; score: number; runnerUp: number } {
  const needle = normalize(ocrText);
  let best: ContentQuestion | null = null;
  let bestScore = 0;
  let runnerUp = 0;

  for (const c of candidates) {
    const score = similarity(needle, c.normalized);
    if (score > bestScore) {
      runnerUp = bestScore;
      bestScore = score;
      best = c.question;
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }
  return { q: best, score: bestScore, runnerUp };
}

export type PageFill = {
  entry: string;
  questionId: number;
  page: number;
  score: number;
  /** Set when the question already has a page recorded that disagrees. */
  existingPage: number | null;
};

/**
 * The safe half of the job: fill `sourcePages` for references a human already
 * declared.
 *
 * This never reads a question number off the scan — it locates the question by
 * text, and the reference it belongs to is already in the source file. Digit
 * misreads ("39" -> "35", "36" -> "‘6") are the tool's main failure mode, so
 * avoiding that step entirely makes this materially more trustworthy than
 * proposing brand-new references.
 *
 * Ambiguous cases are skipped, not guessed: a question citing the same PDF
 * twice gives no way to tell which reference this page satisfies.
 */
export function planPageFills(
  matched: Match[],
  categories: Map<string, ContentCategory>,
  minFillScore: number
): { fills: PageFill[]; ambiguous: PageFill[]; disagreements: PageFill[] } {
  const fills: PageFill[] = [];
  const ambiguous: PageFill[] = [];
  const disagreements: PageFill[] = [];

  for (const m of matched) {
    if (m.questionId === null || m.score < minFillScore) continue;
    const cat = m.pdf.slice(3, 4);
    const question = categories.get(cat)?.questions.find((q) => q.id === m.questionId);
    if (!question) continue;

    const forThisPdf = question.sources.filter((s) => s.startsWith(`${m.pdf}p`));
    if (forThisPdf.length === 0) continue;

    const entry = forThisPdf[0]!;
    const existingPage = question.sourcePages[entry] ?? null;
    const fill: PageFill = { entry, questionId: question.id, page: m.page, score: m.score, existingPage };

    if (forThisPdf.length > 1) ambiguous.push(fill);
    else if (existingPage === null) fills.push(fill);
    else if (existingPage !== m.page) disagreements.push(fill);
  }

  return { fills, ambiguous, disagreements };
}

type Conflict = {
  entry: string;
  entries: string[];
  claims: { page: number; questionId: number; score: number }[];
};

/**
 * A reference like "cat3/2023_08_18p17" must identify exactly one question.
 * When two pages both claim it, something is wrong — either the scan pages are
 * out of order, or a question number was misread — and guessing between them
 * would write a bad link. These are reported and never applied.
 */
function findConflicts(matched: Match[]): Conflict[] {
  const byEntry = new Map<string, Match[]>();
  for (const m of matched) {
    const entry = `${m.pdf}p${m.num}`;
    const list = byEntry.get(entry);
    if (list) list.push(m);
    else byEntry.set(entry, [m]);
  }

  const out: Conflict[] = [];
  for (const [entry, claims] of byEntry) {
    const distinct = new Set(claims.map((c) => c.questionId));
    if (distinct.size > 1) {
      out.push({
        entry,
        entries: [entry],
        claims: claims.map((c) => ({
          page: c.page,
          questionId: c.questionId!,
          score: c.score,
        })),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- pool

async function pool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------- main

async function main() {
  const o = parseArgs(process.argv.slice(2));

  for (const bin of ["pdftoppm", "pdfinfo", "tesseract"]) {
    if (!(await hasBin(bin))) {
      console.error(`Required tool not found: ${bin}\n  Arch: sudo pacman -S poppler tesseract`);
      process.exit(1);
    }
  }
  o.lang = await pickLanguage(o.lang);

  const categories = new Map<string, ContentCategory>();
  const candidates = new Map<string, Candidate[]>();
  for (const cat of CATEGORIES) {
    const dir = join(ROOT, "content", "questions", `cat${cat}`);
    if (!existsSync(dir)) continue;
    const parsed = loadCategory(dir);
    categories.set(cat, parsed);
    candidates.set(
      cat,
      parsed.questions.map((q) => ({ question: q, normalized: normalize(q.question) }))
    );
  }

  const pdfs = (await listPdfs(o.filters)).filter((p) => p.pages > 0);
  const totalPages = pdfs.reduce((s, p) => s + p.pages, 0);
  if (pdfs.length === 0) {
    console.log("No matching PDFs found.");
    return;
  }

  console.log(
    `\nOCR: ${pdfs.length} PDF(s), ${totalPages} pages, lang=${o.lang}, ` +
      `dpi=${o.dpi}, threshold=${o.threshold}, jobs=${o.jobs}`
  );

  const matches: Match[] = [];
  let pagesDone = 0;

  for (const pdf of pdfs) {
    const cat = candidates.get(pdf.cat) ?? [];
    const existing = categories.get(pdf.cat);

    const pageNums = Array.from({ length: pdf.pages }, (_, i) => i + 1);
    const perPage = await pool(pageNums, o.jobs, async (page) => {
      const text = await ocrPage(pdf, page, o);
      pagesDone++;
      if (pagesDone % 25 === 0) {
        process.stdout.write(`  ...${pagesDone}/${totalPages} pages\r`);
      }
      return { page, questions: parsePage(text) };
    });

    for (const { page, questions } of perPage) {
      for (const oq of questions) {
        const { q, score, runnerUp } = bestMatch(oq.text, cat);
        const entry = `${pdf.key}p${oq.num}`;
        const alreadyLinked =
          !!existing &&
          !!q &&
          existing.questions.some((x) => x.id === q.id && x.sources.includes(entry));
        matches.push({
          pdf: pdf.key,
          page,
          num: oq.num,
          ocrText: oq.text.slice(0, 160),
          questionId: score >= o.minScore && score - runnerUp >= o.minMargin ? (q?.id ?? null) : null,
          score: Number(score.toFixed(3)),
          runnerUpScore: Number(runnerUp.toFixed(3)),
          alreadyLinked,
        });
      }
    }
  }

  process.stdout.write(" ".repeat(40) + "\r");

  const matched = matches.filter((m) => m.questionId !== null);
  const unmatched = matches.filter((m) => m.questionId === null);
  const conflicts = findConflicts(matched);
  const conflicted = new Set(conflicts.flatMap((c) => c.entries));
  const fresh = matched.filter(
    (m) => !m.alreadyLinked && !conflicted.has(`${m.pdf}p${m.num}`)
  );

  console.log(`\nQuestion blocks read : ${matches.length}`);
  console.log(`  matched confidently: ${matched.length}`);
  console.log(`  already linked     : ${matched.filter((m) => m.alreadyLinked).length}`);
  console.log(`  new links available: ${fresh.length}`);
  console.log(`  conflicting        : ${conflicted.size}`);
  console.log(`  unmatched          : ${unmatched.length}`);

  if (conflicts.length > 0) {
    console.log(
      `\n! ${conflicts.length} reference(s) claimed by more than one question — excluded from --apply.`
    );
    console.log(
      "  These scans are not always in question order, and OCR sometimes reads a\n" +
        "  leading letter as a digit ('A melhor...' -> '4 melhor...'), so a number\n" +
        "  can be wrong even when the question text matches well. Resolve by hand.\n"
    );
    for (const c of conflicts.slice(0, 8)) {
      console.log(`  ${c.entry}:`);
      for (const claim of c.claims) {
        console.log(`     pdf page ${claim.page} -> question ${claim.questionId} (score ${claim.score})`);
      }
    }
  }

  const { fills, ambiguous, disagreements } = planPageFills(matched, categories, o.minFillScore);

  console.log(`\nPage numbers for already-declared references (score >= ${o.minFillScore}):`);
  console.log(`  fillable now       : ${fills.length}`);
  console.log(`  already recorded   : ${matched.length - fills.length - ambiguous.length - disagreements.length}`);
  console.log(`  ambiguous (skipped): ${ambiguous.length}`);
  console.log(`  disagree with file : ${disagreements.length}`);

  if (disagreements.length > 0) {
    console.log("\n  Recorded page differs from where the question was found:");
    for (const d of disagreements.slice(0, 8)) {
      console.log(`    ${d.entry}: file says ${d.existingPage}, OCR found page ${d.page} (score ${d.score})`);
    }
  }

  mkdirSync(dirname(o.reportPath), { recursive: true });
  writeFileSync(
    o.reportPath,
    `${JSON.stringify({ options: o, matches, pageFills: fills, ambiguous, disagreements, conflicts }, null, 2)}\n`
  );
  console.log(`\nReport written to ${o.reportPath}`);

  if (!o.apply) {
    if (fills.length > 0) {
      console.log("\nSample page fills (re-run with --apply to write them):");
      for (const f of fills.slice(0, 8)) {
        console.log(`  ${f.entry} -> pdf page ${f.page}  (question ${f.questionId}, score ${f.score})`);
      }
    }
    if (fresh.length > 0) {
      console.log(
        `\n${fresh.length} brand-new reference(s) were also proposed. These depend on reading the`
      );
      console.log(
        "question number off the scan, which is the least reliable part — see the report's"
      );
      console.log("`matches` array and confirm by hand before trusting them.");
    }
    return;
  }

  applyPageFills(fills, categories);
}

/**
 * Writes page numbers for already-declared references into the source files.
 *
 * Only `sourcePages` is touched — `--apply` never invents a new `sources`
 * entry, because that would require trusting an OCR'd question number.
 */
function applyPageFills(fills: PageFill[], categories: Map<string, ContentCategory>) {
  const dirtyByCat = new Map<string, Set<number>>();

  for (const f of fills) {
    const cat = f.entry.slice(3, 4);
    const category = categories.get(cat);
    if (!category) continue;
    const question = category.questions.find((q) => q.id === f.questionId);
    if (!question) continue;

    if (question.sourcePages[f.entry] === f.page) continue;
    question.sourcePages[f.entry] = f.page;

    let set = dirtyByCat.get(cat);
    if (!set) {
      set = new Set();
      dirtyByCat.set(cat, set);
    }
    set.add(question.id);
  }

  let written = 0;
  for (const [cat, ids] of dirtyByCat) {
    const category = categories.get(cat)!;
    const sourceDir = join(ROOT, "content", "questions", `cat${cat}`);
    for (const id of ids) {
      const q = category.questions.find((x) => x.id === id);
      if (!q) continue;
      writeFileSync(join(sourceDir, questionFileName(id)), serializeQuestionFile(q));
      written++;
    }
    const { appJson } = emitCategory(category);
    writeFileSync(join(ROOT, "public", "data", `cat${cat}.json`), appJson);
  }

  console.log(`\nApplied: ${written} question file(s) updated, artifacts regenerated.`);
  console.log("Review with `git diff` and run `bun run content:check`.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
