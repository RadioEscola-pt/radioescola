#!/usr/bin/env bun
/**
 * Compiles per-question source files into the shipped artifacts.
 *
 *   bun run content:build            # write artifacts for migrated categories
 *   bun run content:check            # verify artifacts match, write nothing
 *   bun run content:build --mobile=<dir>   # also write the Flutter app's bundle
 *
 * --mobile points at a checkout of the app (the directory holding its
 * `pubspec.yaml`) and additionally emits `assets/content/` and the images it
 * references there. The app cannot fetch notes or images at runtime, so that
 * bundle inlines both; see `lib/content/mobile.ts`. It composes with --check,
 * which then verifies the app's copy is current instead of writing it.
 *
 * --check is the CI form: it fails if a generated file has been hand-edited or
 * if the source no longer compiles to what is committed, which is what keeps
 * `public/data/cat{n}.json` trustworthy as a build output.
 *
 * Only categories that have a source directory are touched, so cat1 and cat2
 * keep shipping their hand-maintained JSON until they are migrated too.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import {
  loadCategory,
  emitCategory,
  findDanglingPdfs,
  findMissingImages,
  loadMissingExamsBaseline,
  MISSING_EXAMS_FILE,
} from "../lib/content/build";
import { emitMobileCategory, emitMobileExamConfig } from "../lib/content/mobile";
import { EXAM_CONFIG } from "../lib/config/exam";
import type { ContentCategory } from "../lib/content/schema";

const CATEGORIES = ["1", "2", "3"] as const;
const check = process.argv.includes("--check");
const mobileDir = process.argv
  .find((a) => a.startsWith("--mobile="))
  ?.slice("--mobile=".length);

if (mobileDir !== undefined && !existsSync(join(mobileDir, "pubspec.yaml"))) {
  console.error(`--mobile=${mobileDir}: no pubspec.yaml there — point it at the Flutter app`);
  process.exit(1);
}

let changed = 0;
let checked = 0;
let removed = 0;
let bundled = 0;
const problems: string[] = [];
const withheld: { category: string; ids: number[] }[] = [];

function compare(path: string, expected: string) {
  checked++;
  const actual = existsSync(path) ? readFileSync(path, "utf-8") : null;
  if (actual === expected) return;

  if (check) {
    problems.push(
      actual === null ? `${path}: missing` : `${path}: differs from compiled output`
    );
    return;
  }
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, expected);
  changed++;
}

/**
 * The image half of `compare`: same write-or-report discipline, byte-compared
 * rather than text-compared so it is safe for the binaries it copies.
 */
function compareBinary(from: string, to: string) {
  checked++;
  // Callers check existence first so a category can be skipped whole; this is
  // the backstop for a file that vanishes between the two.
  if (!existsSync(from)) {
    problems.push(`${from}: missing from public/`);
    return;
  }
  const expected = readFileSync(from);
  const actual = existsSync(to) ? readFileSync(to) : null;
  if (actual !== null && actual.equals(expected)) return;

  if (check) {
    problems.push(actual === null ? `${to}: missing` : `${to}: differs from public/`);
    return;
  }
  mkdirSync(join(to, ".."), { recursive: true });
  writeFileSync(to, expected);
  bundled++;
}

/**
 * Deletes generated notes that no question claims any more.
 *
 * `compare` only ever writes the files it is given, so withholding or removing
 * a question used to leave its note behind — and `/api/notes` reads straight
 * from disk without consulting the bank, so that stale file stayed publicly
 * readable for a question nothing links to. Sweeping is the other half of
 * generating.
 */
function sweepNotes(dir: string, keep: ReadonlySet<string>) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (!/^\d+\.mdx$/.test(name) || keep.has(name)) continue;
    const path = join(dir, name);
    if (check) {
      problems.push(`${path}: orphaned — no question generates it`);
      continue;
    }
    rmSync(path);
    removed++;
  }
}

const loaded: ContentCategory[] = [];

for (const category of CATEGORIES) {
  const sourceDir = join("content", "questions", `cat${category}`);
  if (!existsSync(sourceDir)) continue;

  const parsed = loadCategory(sourceDir);
  loaded.push(parsed);
  const { appJson, notes, withheld: ids } = emitCategory(parsed);
  if (ids.length > 0) withheld.push({ category, ids });

  compare(join("public", "data", `cat${category}.json`), appJson);
  const notesDir = join("content", "notes", `cat${category}`);
  for (const [id, body] of notes) {
    compare(join(notesDir, `${id}.mdx`), body);
  }
  sweepNotes(notesDir, new Set([...notes.keys()].map((id) => `${id}.mdx`)));

  if (mobileDir !== undefined) {
    const { json, images, noteFailures } = await emitMobileCategory(appJson, notes);
    for (const f of noteFailures) {
      problems.push(
        `content/notes/cat${category}/${f.id}.mdx: will not compile — ${f.reason}`
      );
    }
    // A category is written whole or not at all, so both preconditions are
    // checked before anything lands. Writing the JSON and then failing on an
    // image leaves a bundle that references a file nobody copied, and
    // `--check` would call it current; writing it with a failed note left out
    // ships a question whose explanation has silently vanished.
    const missingImages = images.filter((i) => !existsSync(join("public", i.from)));
    for (const image of missingImages) {
      problems.push(
        `public/${image.from}: referenced by a cat${category} question or note, missing from public/`
      );
    }
    if (noteFailures.length === 0 && missingImages.length === 0) {
      compare(join(mobileDir, "assets", "content", `cat${category}.json`), json);
      for (const image of images) {
        compareBinary(join("public", image.from), join(mobileDir, image.to));
      }
    }
  }
}

if (mobileDir !== undefined && checked > 0) {
  compare(
    join(mobileDir, "assets", "content", "exam_config.json"),
    emitMobileExamConfig(EXAM_CONFIG)
  );
}

if (checked === 0) {
  console.log("no migrated categories found — nothing to build");
  process.exit(0);
}

const missingImages = findMissingImages(loaded, "public");
if (missingImages.length > 0) {
  console.error(`\n${missingImages.length} referenced image(s) missing from public/:`);
  for (const m of missingImages) {
    console.error(`  ${m.image}  (question${m.questions.length === 1 ? "" : "s"} ${m.questions.join(", ")})`);
  }
  console.error("\nAdd the file, or remove the reference.");
  process.exit(1);
}

// Every `sources` entry must point at a real PDF. Known-absent papers are
// baselined so this cannot break the build on pre-existing data, but anything
// new fails immediately.
const baseline = loadMissingExamsBaseline(process.cwd());
const dangling = findDanglingPdfs(loaded, join("public", "exams"), baseline);
const unknown = dangling.filter((d) => !d.known);
const stale = [...baseline].filter((pdf) => !dangling.some((d) => d.pdf === pdf));

if (unknown.length > 0) {
  console.error(`\nReferences point at ${unknown.length} exam PDF(s) that are not on disk:`);
  for (const d of unknown) {
    const hint = d.alsoIn.length
      ? `  <- exists under ${d.alsoIn.join(", ")}, so the folder prefix is probably wrong`
      : "  <- not present under any category";
    console.error(`  ${d.pdf}  (${d.refs} reference${d.refs === 1 ? "" : "s"})${hint}`);
  }
  console.error(
    `\nFix the references, add the PDF, or add the entry to ${MISSING_EXAMS_FILE} if it is genuinely unavailable.`
  );
  process.exit(1);
}

if (stale.length > 0) {
  console.log(`\n${stale.length} baseline entr(y/ies) in ${MISSING_EXAMS_FILE} no longer needed:`);
  for (const pdf of stale) console.log(`  ${pdf}`);
  console.log("  Remove them to keep the baseline honest.");
}

if (dangling.length > 0) {
  const refs = dangling.reduce((sum, d) => sum + d.refs, 0);
  console.log(
    `\n${refs} reference(s) point at ${dangling.length} known-absent PDF(s) — see ${MISSING_EXAMS_FILE}`
  );
  const fixable = dangling.filter((d) => d.alsoIn.length > 0);
  if (fixable.length > 0) {
    console.log(
      `  ${fixable.length} of them exist under a different category folder, so the prefix is probably just wrong:`
    );
    for (const d of fixable.slice(0, 5)) {
      console.log(`    ${d.pdf} -> ${d.alsoIn.join(", ")} (${d.refs} refs)`);
    }
    if (fixable.length > 5) console.log(`    ...and ${fixable.length - 5} more`);
  }
}

if (withheld.length > 0) {
  const total = withheld.reduce((sum, w) => sum + w.ids.length, 0);
  console.log(`\n${total} question(s) withheld by \`disabled\` — in the bank, not in the artifacts:`);
  for (const w of withheld) console.log(`  cat${w.category}: ${w.ids.join(", ")}`);
}

// Fatal in both modes. A problem raised while writing is not a stale artifact
// that regenerating will fix — it is content that would not compile, or a file
// that is not on disk — and carrying on would write a bundle missing exactly
// the thing that failed, with a success message on top of it.
if (problems.length > 0) {
  const writing = !check && problems.some((p) => !p.includes("differs") && !p.includes("missing"));
  console.error(
    check
      ? `content check failed (${problems.length} of ${checked} files):`
      : `content build failed (${problems.length} problem(s)):`
  );
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  if (problems.length > 20) console.error(`  ...and ${problems.length - 20} more`);
  if (check) {
    console.error(
      `\nRun \`bun run content:build${mobileDir !== undefined ? ` --mobile=${mobileDir}` : ""}\` to regenerate.`
    );
  } else if (writing) {
    console.error("\nFix the source above; nothing was written for the failing entries.");
  }
  process.exit(1);
}

if (check) {
  console.log(`content check passed — ${checked} artifacts match their source`);
} else {
  console.log(
    `content build complete — ${changed} of ${checked} artifacts written` +
      (removed > 0 ? `, ${removed} orphaned note(s) removed` : "") +
      (bundled > 0 ? `, ${bundled} image(s) copied to the app` : "")
  );
}
