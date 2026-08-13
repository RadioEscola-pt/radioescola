#!/usr/bin/env bun
/**
 * Interactive tool to record the real PDF page for each "fonte oficial" reference.
 *
 * Background: a source entry like "cat3/2023_08_18p33" means *pergunta 33* (the
 * question number) of that exam PDF, NOT PDF page 33. This tool walks the pending
 * references, grouped by PDF so you open each exam once, shows the question, opens
 * the PDF, and asks which PDF page the question is on. The answer is written to the
 * `sourcePages` map of every question citing that same reference:
 *
 *   sources:
 *     - cat3/2023_08_18p33
 *   sourcePages:
 *     cat3/2023_08_18p33: 5
 *
 * Writes to `content/questions/**` — the source of truth — and regenerates the
 * affected `public/data/cat{n}.json` afterwards. It used to edit that JSON
 * directly, which is now a build artifact; doing so would fail `content:check`.
 *
 * It is resumable: already-recorded pages are read back on startup and skipped.
 * Progress is saved after every answer, so quitting (q) never loses work.
 *
 * Usage:
 *   bun run data:fonte-pages            # all pending references
 *   bun run data:fonte-pages cat3       # only PDFs whose key matches "cat3"
 *   bun run data:fonte-pages 2023_08    # filter by any substring of the PDF key
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn, execSync } from "node:child_process";
import { loadCategory, emitCategory } from "../lib/content/build";
import { serializeQuestionFile, questionFileName } from "../lib/content/source";
import type { ContentQuestion, ContentCategory } from "../lib/content/schema";

// Resolved from the working directory, like the other content scripts; these
// are always invoked via `bun run` from the project root.
const ROOT = process.cwd();
const EXAMS_DIR = path.join(ROOT, "public", "exams");
const CATEGORIES = ["1", "2", "3"] as const;

// "folder/file...pN" -> { pdf: "folder/file", num: N }
const ENTRY_RE = /^([^/]+)\/(.+?)p(\d+)$/i;

type Entry = { entry: string; pdf: string; num: number };

function parseEntry(raw: unknown): Entry | null {
  const entry = String(raw).trim();
  const m = ENTRY_RE.exec(entry);
  if (!m) return null;
  const [, folder, file, num] = m;
  if (!folder || !file || !num) return null;
  return { entry, pdf: `${folder}/${file}`, num: Number(num) };
}

function pdfPath(pdfKey: string) {
  return path.join(EXAMS_DIR, `${pdfKey}.pdf`);
}

function hasBin(bin: string) {
  try {
    execSync(`command -v ${bin}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

type Viewer = {
  name: string;
  cmd: string;
  mkArgs: (file: string) => string[];
  reuse: "unique" | "close" | "none";
};

/**
 * Pick a PDF viewer and how it reuses windows:
 *   'unique' - viewer replaces the document in its single window (no cleanup needed)
 *   'close'  - open in a fresh process group; close the previous one before the next open
 *   'none'   - cannot manage windows (each open is a new window)
 * Override with FONTE_PDF_VIEWER (use "{file}" as a placeholder, or the path is appended).
 */
function detectViewer(): Viewer | null {
  const override = process.env.FONTE_PDF_VIEWER;
  if (override) {
    return {
      name: override,
      reuse: "close",
      mkArgs: (f) => [
        "-c",
        override.includes("{file}")
          ? override.replaceAll("{file}", `'${f}'`)
          : `${override} '${f}'`,
      ],
      cmd: "sh",
    };
  }
  if (process.platform === "darwin")
    return { name: "open", cmd: "open", mkArgs: (f) => [f], reuse: "none" };
  if (process.platform === "win32")
    return { name: "start", cmd: "cmd", mkArgs: (f) => ["/c", "start", "", f], reuse: "none" };
  if (hasBin("okular"))
    return { name: "okular", cmd: "okular", mkArgs: (f) => ["--unique", f], reuse: "unique" };
  for (const bin of ["zathura", "qpdfview", "xpdf", "mupdf"]) {
    if (hasBin(bin)) return { name: bin, cmd: bin, mkArgs: (f) => [f], reuse: "close" };
  }
  if (hasBin("evince"))
    return { name: "evince", cmd: "evince", mkArgs: (f) => [f], reuse: "close" };
  if (hasBin("xdg-open"))
    return { name: "xdg-open", cmd: "xdg-open", mkArgs: (f) => [f], reuse: "none" };
  return null;
}

const VIEWER = detectViewer();
const REUSE = !process.env.FONTE_PDF_NO_REUSE;
let viewerPid: number | null = null; // process-group leader of the last opened viewer

function closePrevViewer() {
  if (viewerPid == null) return;
  try {
    process.kill(-viewerPid, "SIGTERM");
  } catch {
    try {
      process.kill(viewerPid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  viewerPid = null;
}

function openPdf(pdfKey: string) {
  const file = pdfPath(pdfKey);
  if (!VIEWER) {
    console.log(`  open manually: ${file}`);
    return;
  }
  // okular --unique swaps the document in place, so there is nothing to close.
  if (REUSE && VIEWER.reuse === "close") closePrevViewer();
  try {
    const child = spawn(VIEWER.cmd, VIEWER.mkArgs(file), { detached: true, stdio: "ignore" });
    if (VIEWER.reuse === "close") viewerPid = child.pid ?? null;
    child.unref();
  } catch {
    console.log(`  (could not open; file is at ${file})`);
  }
}

type CategoryFile = {
  cat: string;
  sourceDir: string;
  category: ContentCategory;
  /** Ids of questions whose source file needs rewriting. */
  dirty: Set<number>;
};

function loadFiles(): CategoryFile[] {
  return CATEGORIES.filter((cat) =>
    fs.existsSync(path.join(ROOT, "content", "questions", `cat${cat}`))
  ).map((cat) => {
    const sourceDir = path.join(ROOT, "content", "questions", `cat${cat}`);
    return { cat, sourceDir, category: loadCategory(sourceDir), dirty: new Set<number>() };
  });
}

function main() {
  const filters = process.argv.slice(2).map((s) => s.toLowerCase());
  const files = loadFiles();

  if (files.length === 0) {
    console.log("No migrated categories found under content/questions/.");
    return;
  }

  // Aggregate already-resolved pages (resume support).
  const resolved = new Map<string, number>();
  for (const file of files) {
    for (const q of file.category.questions) {
      for (const [entry, page] of Object.entries(q.sourcePages)) {
        if (Number.isInteger(page)) resolved.set(entry, page);
      }
    }
  }

  // Build the pending worklist, grouped by PDF.
  const byPdf = new Map<string, Map<number, string>>();
  const malformed = new Set<string>();
  const missingPdf = new Set<string>();
  for (const file of files) {
    for (const q of file.category.questions) {
      for (const raw of q.sources) {
        const info = parseEntry(raw);
        if (!info) {
          malformed.add(String(raw).trim());
          continue;
        }
        if (!fs.existsSync(pdfPath(info.pdf))) {
          missingPdf.add(info.pdf);
          continue;
        }
        if (resolved.has(info.entry)) continue;
        if (filters.length && !filters.some((f) => info.pdf.toLowerCase().includes(f))) continue;
        let group = byPdf.get(info.pdf);
        if (!group) {
          group = new Map();
          byPdf.set(info.pdf, group);
        }
        group.set(info.num, info.entry);
      }
    }
  }

  const pdfKeys = [...byPdf.keys()].sort();
  const totalPending = pdfKeys.reduce((sum, k) => sum + (byPdf.get(k)?.size ?? 0), 0);

  console.log(`\nResolved so far: ${resolved.size}`);
  console.log(`Pending references: ${totalPending} across ${pdfKeys.length} PDF(s)`);
  if (malformed.size)
    console.log(
      `Skipped ${malformed.size} malformed entr${malformed.size === 1 ? "y" : "ies"} (fix by hand): ${[...malformed].join(", ")}`
    );
  if (missingPdf.size)
    console.log(
      `Skipped references to ${missingPdf.size} missing PDF(s): ${[...missingPdf].join(", ")}`
    );
  if (totalPending === 0) {
    console.log("\nNothing to do. ✓\n");
    return;
  }

  if (!VIEWER) {
    console.log("\nNo PDF viewer detected; paths will be printed to open manually.");
  } else if (VIEWER.reuse === "unique") {
    console.log(`\nViewer: ${VIEWER.name} (--unique: reuses one window).`);
  } else if (REUSE && VIEWER.reuse === "close") {
    console.log(`\nViewer: ${VIEWER.name} (previous window is closed before opening the next).`);
  } else {
    console.log(
      `\nViewer: ${VIEWER.name} (each PDF opens a new window). Install okular, or set FONTE_PDF_VIEWER, for single-window reuse.`
    );
  }
  console.log(
    "Commands at each prompt: <number>=page, Enter=reuse last page, s=skip, o=re-open PDF, q=save & quit\n"
  );

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt: string) => new Promise<string>((res) => rl.question(prompt, res));

  function findContext(entry: string) {
    for (const file of files) {
      for (const q of file.category.questions) {
        if (q.sources.some((x) => x.trim() === entry)) {
          return { cat: file.cat, id: q.id, question: q.question };
        }
      }
    }
    return null;
  }

  function applyResolved(entry: string, page: number) {
    resolved.set(entry, page);
    for (const file of files) {
      for (const q of file.category.questions) {
        if (!q.sources.some((x) => x.trim() === entry)) continue;
        if (q.sourcePages[entry] !== page) {
          q.sourcePages[entry] = page;
          file.dirty.add(q.id);
        }
      }
    }
  }

  /**
   * Writes changed question files, then regenerates that category's artifact so
   * `content:check` stays green without a separate build step.
   */
  function save() {
    for (const file of files) {
      if (file.dirty.size === 0) continue;

      const byId = new Map<number, ContentQuestion>(
        file.category.questions.map((q) => [q.id, q])
      );
      for (const id of file.dirty) {
        const q = byId.get(id);
        if (!q) continue;
        fs.writeFileSync(
          path.join(file.sourceDir, questionFileName(id)),
          serializeQuestionFile(q)
        );
      }

      const { appJson } = emitCategory(file.category);
      fs.writeFileSync(path.join(ROOT, "public", "data", `cat${file.cat}.json`), appJson);
      file.dirty.clear();
    }
  }

  let done = 0;
  let lastPage: number | null = null;

  async function run() {
    for (const pdf of pdfKeys) {
      const group = byPdf.get(pdf)!;
      const nums = [...group.keys()].sort((a, b) => a - b);
      console.log(
        `\n── ${pdf}.pdf  (${nums.length} pending: pergunta ${nums[0]}–${nums[nums.length - 1]}) ──`
      );
      openPdf(pdf);

      for (const num of nums) {
        const entry = group.get(num)!;
        const ctx = findContext(entry);
        done += 1;
        console.log(
          `\n[${done}/${totalPending}] ${pdf} · pergunta ${num}${ctx ? `  (cat${ctx.cat}, id ${ctx.id})` : ""}`
        );
        if (ctx?.question) console.log(`  Q: ${ctx.question}`);

        while (true) {
          const hint = lastPage != null ? ` [Enter=${lastPage}]` : "";
          const ans = (await ask(`  PDF page for pergunta ${num}${hint}: `)).trim().toLowerCase();

          if (ans === "q") {
            save();
            console.log(`\nSaved. ${resolved.size} resolved. Re-run to continue.\n`);
            rl.close();
            return;
          }
          if (ans === "s") {
            console.log("  skipped");
            break;
          }
          if (ans === "o") {
            openPdf(pdf);
            continue;
          }
          if (ans === "") {
            if (lastPage == null) {
              console.log("  no previous page to reuse");
              continue;
            }
            applyResolved(entry, lastPage);
            save();
            console.log(`  → page ${lastPage} (saved)`);
            break;
          }
          const n = Number.parseInt(ans, 10);
          if (Number.isInteger(n) && n > 0 && String(n) === ans) {
            lastPage = n;
            applyResolved(entry, n);
            save();
            console.log(`  → page ${n} (saved)`);
            break;
          }
          console.log("  enter a positive integer, or s / o / q");
        }
      }
    }
    save();
    console.log(`\nAll pending references resolved. ${resolved.size} total. ✓\n`);
    rl.close();
  }

  run().catch((err) => {
    console.error(err);
    save();
    rl.close();
    process.exit(1);
  });
}

main();
