#!/usr/bin/env bun
/**
 * Build the HTML review page for one exam paper: every pergunta the bank claims
 * from that paper, beside the scan of the page it sits on.
 *
 * Why: `qbank paper` tells you *that* pergunta 27 is cat3#70, but confirming it
 * means opening the PDF at the right page and the MDX in an editor, forty times
 * over. The check that matters — does the scan's stem and its marked answer
 * match the bank's? — is visual, so it wants the two side by side.
 *
 * What the page shows is the *bank*, never the OCR text. A review exists to
 * distrust the machine, and comparing a scan against a transcription the same
 * machine produced would only confirm the transcription. OCR is used for one
 * thing: deciding which links it found by itself (and so are already
 * corroborated) and which a person asserted, which are the ones worth an eye.
 *
 * Usage:
 *   bun run data:exam-review cat3/2026_08_30       # -> docs/revisao/cat3/2026_08_30.html
 *   bun run data:exam-review 2026_08_30 --out /tmp/rev.html
 *   bun run data:exam-review cat3/2023_08_18 --notes notas.json
 *
 * Needs `poppler` (pdfinfo, pdftoppm), the same dependency `data:ocr-exams` has.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { loadCategory } from "../lib/content/build";
import { buildBank } from "../lib/content/analysis";
import { buildReviewModel, renderReviewPage, matchKey } from "../lib/content/review-page";
import { CATEGORIES, type CategoryId } from "../lib/config/categories";

const run = promisify(execFile);
const ROOT = process.cwd();
const EXAMS_DIR = join(ROOT, "public", "exams");
const CACHE_DIR = join(ROOT, ".ocr-cache");

type Options = {
  filter: string;
  out: string | null;
  reportPath: string;
  notesPath: string | null;
  width: number;
  quality: number;
  fragment: boolean;
};

/**
 * The page is written to disk to be opened from disk, so it ships as a whole
 * document. `renderReviewPage` returns only the page itself — a host that
 * supplies its own skeleton wants `--fragment`.
 */
function wrapDocument(body: string, title: string): string {
  return `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
<title>${title}</title>
</head>
<body>
${body}
</body>
</html>
`;
}

function usage(): never {
  console.log("data:exam-review — página de conferência de uma prova");
  console.log();
  console.log("  bun run data:exam-review cat3/2026_08_30");
  console.log("  bun run data:exam-review 2026_08_30 --out /tmp/rev.html");
  console.log();
  console.log("  --out <ficheiro>    onde escrever (por omissão docs/revisao/<cat>/<prova>.html)");
  console.log("  --report <ficheiro> relatório do data:ocr-exams (por omissão .ocr-cache/report.json)");
  console.log("  --notes <ficheiro>  JSON {\"27\": \"porquê esta\"} com notas por pergunta");
  console.log("  --width <px>        largura das imagens embutidas (por omissão 1150)");
  console.log("  --quality <1-100>   qualidade JPEG (por omissão 72)");
  console.log("  --fragment          sem <html>/<head>, para embutir noutra página");
  process.exit(0);
}

function parseArgs(argv: string[]): Options {
  const o: Options = {
    filter: "",
    out: null,
    reportPath: join(CACHE_DIR, "report.json"),
    notesPath: null,
    width: 1150,
    quality: 72,
    fragment: false,
  };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const next = () => {
      const v = argv[++i];
      if (v === undefined) die(`${arg} precisa de um valor`);
      return v;
    };
    if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--out") o.out = next();
    else if (arg === "--report") o.reportPath = next();
    else if (arg === "--notes") o.notesPath = next();
    else if (arg === "--width") o.width = numeric(arg, next());
    else if (arg === "--quality") o.quality = numeric(arg, next());
    else if (arg === "--fragment") o.fragment = true;
    else if (arg.startsWith("--")) die(`opção desconhecida: ${arg}`);
    else rest.push(arg);
  }
  if (rest.length === 0) die("Falta a prova.", "Ex.: bun run data:exam-review cat3/2026_08_30");
  if (rest.length > 1) die("Só se pode conferir uma prova de cada vez.", `Recebi: ${rest.join(", ")}`);
  o.filter = rest[0]!;
  return o;
}

function numeric(flag: string, raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) die(`${flag} precisa de um número: recebi "${raw}"`);
  return n;
}

function die(message: string, ...detail: string[]): never {
  console.error(`\n✗ ${message}`);
  for (const d of detail) console.error(`  ${d}`);
  process.exit(1);
}

/** The one PDF whose key contains `filter`, or an error naming the candidates. */
function resolvePdf(filter: string): { key: string; cat: CategoryId; path: string } {
  const found: { key: string; cat: CategoryId; path: string }[] = [];
  for (const cat of CATEGORIES) {
    const dir = join(EXAMS_DIR, `cat${cat}`);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.toLowerCase().endsWith(".pdf")) continue;
      const key = `cat${cat}/${name.slice(0, -4)}`;
      if (key.toLowerCase().includes(filter.toLowerCase())) {
        found.push({ key, cat, path: join(dir, name) });
      }
    }
  }
  if (found.length === 0) die(`Nenhuma prova em public/exams/ com "${filter}" no nome.`);
  if (found.length > 1) {
    die(`"${filter}" corresponde a ${found.length} provas.`, ...found.map((f) => `  ${f.key}`));
  }
  return found[0]!;
}

async function pageCount(pdfPath: string): Promise<number> {
  const { stdout } = await run("pdfinfo", [pdfPath]);
  const m = /^Pages:\s+(\d+)$/m.exec(stdout);
  return m ? Number(m[1]) : 0;
}

/**
 * Rasterise just the pages the review needs, as JPEG data URIs.
 *
 * JPEG rather than PNG because these are photographs of paper: a scan of a
 * greyscale page compresses to roughly a fifth of the PNG, and the page carries
 * every image inline so that the reviewer can keep it after the repo is gone.
 */
async function rasterise(
  pdfPath: string,
  pages: readonly number[],
  o: Options
): Promise<Record<number, string>> {
  const out: Record<number, string> = {};
  const dir = join(tmpdir(), `exam-review-${process.pid}`);
  mkdirSync(dir, { recursive: true });
  try {
    for (const page of pages) {
      const prefix = join(dir, `p${page}`);
      await run("pdftoppm", [
        "-jpeg",
        "-jpegopt", `quality=${o.quality}`,
        "-scale-to", String(o.width),
        "-f", String(page),
        "-l", String(page),
        pdfPath,
        prefix,
      ]);
      const file = readdirSync(dir).find((n) => n.startsWith(`p${page}-`) || n === `p${page}.jpg`);
      if (!file) {
        console.warn(`  aviso: pdftoppm não produziu a página ${page}`);
        continue;
      }
      const b64 = readFileSync(join(dir, file)).toString("base64");
      out[page] = `data:image/jpeg;base64,${b64}`;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return out;
}

/**
 * Which (pergunta, question id) pairs OCR matched on its own.
 *
 * A missing or stale report is not an error — it just means nothing is
 * corroborated, and every card says so. Silently claiming otherwise would be
 * the one failure this page cannot afford.
 */
function ocrMatches(reportPath: string, pdf: string): { set: Set<string>; read: boolean } {
  if (!existsSync(reportPath)) return { set: new Set(), read: false };
  try {
    const report = JSON.parse(readFileSync(reportPath, "utf-8")) as {
      options?: { minFillScore?: number };
      matches?: { pdf: string; num: number; questionId: number | null; score: number }[];
    };
    const floor = report.options?.minFillScore ?? 0.65;
    const set = new Set<string>();
    for (const m of report.matches ?? []) {
      if (m.pdf !== pdf || m.questionId === null || m.score < floor) continue;
      set.add(matchKey(m.num, m.questionId));
    }
    return { set, read: true };
  } catch {
    return { set: new Set(), read: false };
  }
}

function readNotes(path: string | null): Record<number, string> {
  if (path === null) return {};
  const raw = JSON.parse(readFileSync(path, "utf-8")) as Record<string, string>;
  const notes: Record<number, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = Number.parseInt(k, 10);
    if (Number.isFinite(n) && typeof v === "string") notes[n] = v;
  }
  return notes;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const pdf = resolvePdf(o.filter);

  const category = loadCategory(join(ROOT, "content", "questions", `cat${pdf.cat}`));
  const bank = buildBank([category]);
  const { set: ocrMatched, read: reportRead } = ocrMatches(o.reportPath, pdf.key);

  const model = buildReviewModel({
    pdf: pdf.key,
    bank,
    ocrMatched,
    notes: readNotes(o.notesPath),
  });

  const total = await pageCount(pdf.path);
  const needed = [...new Set(model.questions.map((q) => q.page).filter((p): p is number => p !== null))].sort(
    (a, b) => a - b
  );

  console.log(`\n${pdf.key} — ${model.counts.cited} pergunta(s) citada(s), ${total} página(s)`);
  console.log(`  confirmadas por OCR : ${model.counts.ocr}${reportRead ? "" : "  (sem relatório: nada corroborado)"}`);
  console.log(`  correspondidas à mão: ${model.counts.manual}`);
  if (model.counts.gaps > 0) console.log(`  por reclamar        : ${model.counts.gaps}`);
  if (model.counts.unpaged > 0) {
    console.log(`  sem página          : ${model.counts.unpaged}  (corra data:ocr-exams --apply)`);
  }

  console.log(`\n  a converter ${needed.length} página(s)…`);
  const images = await rasterise(pdf.path, needed, o);

  const page = renderReviewPage(model, {
    images,
    pageCount: total,
    generatedAt: new Date().toISOString().slice(0, 10),
  });
  const title = `Prova cat${model.category} · ${pdf.key.split("/")[1]?.replace(/_/g, "-") ?? pdf.key}`;
  const html = o.fragment ? page : wrapDocument(page, title);

  const out = o.out ?? join(ROOT, "docs", "revisao", `${pdf.key}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);

  const mb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(1);
  console.log(`\n  escrito ${out.replace(`${ROOT}/`, "")}  (${mb} MB)`);
  console.log("  abra-o no browser; o que estiver marcado «à mão» é o que precisa do seu olho.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
