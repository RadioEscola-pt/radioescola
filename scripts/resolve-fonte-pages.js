#!/usr/bin/env node

/**
 * Interactive tool to record the real PDF page for each "fonte oficial" reference.
 *
 * Background: a fonte entry like "cat3/2023_08_18p33" means *pergunta 33* (question
 * number) of that exam PDF, NOT PDF page 33. This tool walks the pending references,
 * grouped by PDF so you open each exam once, shows the question, opens the PDF, and
 * asks which PDF page the question is on. The answer is written to a `fontePages`
 * map on every question that cites that same reference:
 *
 *   "fonte": ["cat3/2023_08_18p33"],
 *   "fontePages": { "cat3/2023_08_18p33": 5 }
 *
 * It is resumable: already-recorded pages are read back on startup and skipped.
 * Progress is saved to disk after every answer, so quitting (q) never loses work.
 *
 * Usage:
 *   node scripts/resolve-fonte-pages.js            # all pending references
 *   node scripts/resolve-fonte-pages.js cat3       # only PDFs whose key matches "cat3"
 *   node scripts/resolve-fonte-pages.js 2023_08    # filter by any substring of the PDF key
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { spawn, execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const EXAMS_DIR = path.join(ROOT, 'public', 'exams');
const CATEGORIES = ['1', '2', '3'];

// "folder/file...pN" -> { pdf: "folder/file", num: N }
const ENTRY_RE = /^([^/]+)\/(.+?)p(\d+)$/i;

function parseEntry(raw) {
  const entry = String(raw).trim();
  const m = ENTRY_RE.exec(entry);
  if (!m) return null;
  const [, folder, file, num] = m;
  if (!folder || !file || !num) return null;
  return { entry, pdf: `${folder}/${file}`, num: Number(num) };
}

function pdfPath(pdfKey) {
  return path.join(EXAMS_DIR, `${pdfKey}.pdf`);
}

function hasBin(bin) {
  try { execSync(`command -v ${bin}`, { stdio: 'ignore' }); return true; } catch { return false; }
}

/**
 * Pick a PDF viewer and how it reuses windows:
 *   'unique' - viewer replaces the document in its single window (no cleanup needed)
 *   'close'  - open in a fresh process group; close the previous one before the next open
 *   'none'   - cannot manage windows (each open is a new window)
 * Override with FONTE_PDF_VIEWER (use "{file}" as a placeholder, or the path is appended).
 */
function detectViewer() {
  const override = process.env.FONTE_PDF_VIEWER;
  if (override) {
    return {
      name: override,
      reuse: 'close',
      mkArgs: (f) => ['-c', override.includes('{file}') ? override.replaceAll('{file}', `'${f}'`) : `${override} '${f}'`],
      cmd: 'sh',
    };
  }
  if (process.platform === 'darwin') return { name: 'open', cmd: 'open', mkArgs: (f) => [f], reuse: 'none' };
  if (process.platform === 'win32') return { name: 'start', cmd: 'cmd', mkArgs: (f) => ['/c', 'start', '', f], reuse: 'none' };
  if (hasBin('okular')) return { name: 'okular', cmd: 'okular', mkArgs: (f) => ['--unique', f], reuse: 'unique' };
  for (const bin of ['zathura', 'qpdfview', 'xpdf', 'mupdf']) {
    if (hasBin(bin)) return { name: bin, cmd: bin, mkArgs: (f) => [f], reuse: 'close' };
  }
  if (hasBin('evince')) return { name: 'evince', cmd: 'evince', mkArgs: (f) => [f], reuse: 'close' };
  if (hasBin('xdg-open')) return { name: 'xdg-open', cmd: 'xdg-open', mkArgs: (f) => [f], reuse: 'none' };
  return null;
}

const VIEWER = detectViewer();
const REUSE = !process.env.FONTE_PDF_NO_REUSE;
let viewerPid = null; // process-group leader of the last opened viewer

function closePrevViewer() {
  if (viewerPid == null) return;
  try { process.kill(-viewerPid, 'SIGTERM'); }
  catch { try { process.kill(viewerPid, 'SIGTERM'); } catch { /* already gone */ } }
  viewerPid = null;
}

function openPdf(pdfKey) {
  const file = pdfPath(pdfKey);
  if (!VIEWER) { console.log(`  open manually: ${file}`); return; }
  // okular --unique swaps the document in place, so there is nothing to close.
  if (REUSE && VIEWER.reuse === 'close') closePrevViewer();
  try {
    const child = spawn(VIEWER.cmd, VIEWER.mkArgs(file), { detached: true, stdio: 'ignore' });
    if (VIEWER.reuse === 'close') viewerPid = child.pid;
    child.unref();
  } catch {
    console.log(`  (could not open; file is at ${file})`);
  }
}

function loadFiles() {
  return CATEGORIES.map((cat) => {
    const filePath = path.join(DATA_DIR, `cat${cat}.json`);
    return { cat, filePath, data: JSON.parse(fs.readFileSync(filePath, 'utf8')), dirty: false };
  });
}

function questionsOf(file) {
  return Array.isArray(file.data.questions) ? file.data.questions : [];
}

function main() {
  const filters = process.argv.slice(2).map((s) => s.toLowerCase());
  const files = loadFiles();

  // Aggregate already-resolved pages (resume support).
  const resolved = new Map(); // entry -> page
  for (const file of files) {
    for (const q of questionsOf(file)) {
      if (q && q.fontePages && typeof q.fontePages === 'object') {
        for (const [entry, page] of Object.entries(q.fontePages)) {
          if (Number.isInteger(page)) resolved.set(entry, page);
        }
      }
    }
  }

  // Build the pending worklist, grouped by PDF.
  const byPdf = new Map(); // pdfKey -> Map<num, entry>
  const malformed = new Set();
  const missingPdf = new Set();
  for (const file of files) {
    for (const q of questionsOf(file)) {
      if (!q || !Array.isArray(q.fonte)) continue;
      for (const raw of q.fonte) {
        if (typeof raw !== 'string' || !raw.trim()) continue;
        const info = parseEntry(raw);
        if (!info) { malformed.add(raw.trim()); continue; }
        if (!fs.existsSync(pdfPath(info.pdf))) { missingPdf.add(info.pdf); continue; }
        if (resolved.has(info.entry)) continue;
        if (filters.length && !filters.some((f) => info.pdf.toLowerCase().includes(f))) continue;
        let group = byPdf.get(info.pdf);
        if (!group) { group = new Map(); byPdf.set(info.pdf, group); }
        group.set(info.num, info.entry);
      }
    }
  }

  const pdfKeys = [...byPdf.keys()].sort();
  const totalPending = pdfKeys.reduce((sum, k) => sum + byPdf.get(k).size, 0);

  console.log(`\nResolved so far: ${resolved.size}`);
  console.log(`Pending references: ${totalPending} across ${pdfKeys.length} PDF(s)`);
  if (malformed.size) console.log(`Skipped ${malformed.size} malformed entr${malformed.size === 1 ? 'y' : 'ies'} (fix by hand): ${[...malformed].join(', ')}`);
  if (missingPdf.size) console.log(`Skipped references to ${missingPdf.size} missing PDF(s): ${[...missingPdf].join(', ')}`);
  if (totalPending === 0) { console.log('\nNothing to do. ✓\n'); return; }

  if (!VIEWER) {
    console.log('\nNo PDF viewer detected; paths will be printed to open manually.');
  } else if (VIEWER.reuse === 'unique') {
    console.log(`\nViewer: ${VIEWER.name} (--unique: reuses one window).`);
  } else if (REUSE && VIEWER.reuse === 'close') {
    console.log(`\nViewer: ${VIEWER.name} (previous window is closed before opening the next).`);
  } else {
    console.log(`\nViewer: ${VIEWER.name} (each PDF opens a new window). Install okular, or set FONTE_PDF_VIEWER, for single-window reuse.`);
  }
  console.log('Commands at each prompt: <number>=page, Enter=reuse last page, s=skip, o=re-open PDF, q=save & quit\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt) => new Promise((res) => rl.question(prompt, res));

  function findContext(entry) {
    for (const file of files) {
      for (const q of questionsOf(file)) {
        if (q && Array.isArray(q.fonte) && q.fonte.some((x) => typeof x === 'string' && x.trim() === entry)) {
          return { cat: file.cat, uniqueID: q.uniqueID, question: q.question, answers: q.answers };
        }
      }
    }
    return null;
  }

  function applyResolved(entry, page) {
    resolved.set(entry, page);
    for (const file of files) {
      let changed = false;
      for (const q of questionsOf(file)) {
        if (!q || !Array.isArray(q.fonte)) continue;
        if (q.fonte.some((x) => typeof x === 'string' && x.trim() === entry)) {
          if (!q.fontePages || typeof q.fontePages !== 'object') q.fontePages = {};
          if (q.fontePages[entry] !== page) { q.fontePages[entry] = page; changed = true; }
        }
      }
      if (changed) file.dirty = true;
    }
  }

  function save() {
    for (const file of files) {
      if (!file.dirty) continue;
      fs.writeFileSync(file.filePath, `${JSON.stringify(file.data, null, 2)}\n`);
      file.dirty = false;
    }
  }

  let done = 0;
  let lastPage = null;

  async function run() {
    for (const pdf of pdfKeys) {
      const group = byPdf.get(pdf);
      const nums = [...group.keys()].sort((a, b) => a - b);
      console.log(`\n── ${pdf}.pdf  (${nums.length} pending: pergunta ${nums[0]}–${nums[nums.length - 1]}) ──`);
      openPdf(pdf);

      for (const num of nums) {
        const entry = group.get(num);
        const ctx = findContext(entry);
        done += 1;
        console.log(`\n[${done}/${totalPending}] ${pdf} · pergunta ${num}${ctx ? `  (cat${ctx.cat}, id ${ctx.uniqueID})` : ''}`);
        if (ctx && ctx.question) console.log(`  Q: ${ctx.question}`);

        while (true) {
          const hint = lastPage != null ? ` [Enter=${lastPage}]` : '';
          const ans = (await ask(`  PDF page for pergunta ${num}${hint}: `)).trim().toLowerCase();

          if (ans === 'q') { save(); console.log(`\nSaved. ${resolved.size} resolved. Re-run to continue.\n`); rl.close(); return; }
          if (ans === 's') { console.log('  skipped'); break; }
          if (ans === 'o') { openPdf(pdf); continue; }
          if (ans === '') {
            if (lastPage == null) { console.log('  no previous page to reuse'); continue; }
            applyResolved(entry, lastPage); save();
            console.log(`  → page ${lastPage} (saved)`);
            break;
          }
          const n = Number.parseInt(ans, 10);
          if (Number.isInteger(n) && n > 0 && String(n) === ans) {
            lastPage = n; applyResolved(entry, n); save();
            console.log(`  → page ${n} (saved)`);
            break;
          }
          console.log('  enter a positive integer, or s / o / q');
        }
      }
    }
    save();
    console.log(`\nAll pending references resolved. ${resolved.size} total. ✓\n`);
    rl.close();
  }

  run().catch((err) => { console.error(err); save(); rl.close(); process.exit(1); });
}

main();
