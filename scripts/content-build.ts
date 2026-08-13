#!/usr/bin/env bun
/**
 * Compiles per-question source files into the shipped artifacts.
 *
 *   bun run content:build            # write artifacts for migrated categories
 *   bun run content:check            # verify artifacts match, write nothing
 *
 * --check is the CI form: it fails if a generated file has been hand-edited or
 * if the source no longer compiles to what is committed, which is what keeps
 * `public/data/cat{n}.json` trustworthy as a build output.
 *
 * Only categories that have a source directory are touched, so cat1 and cat2
 * keep shipping their hand-maintained JSON until they are migrated too.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  loadCategory,
  emitCategory,
  findDanglingPdfs,
  findMissingImages,
  loadMissingExamsBaseline,
  MISSING_EXAMS_FILE,
} from "../lib/content/build";
import type { ContentCategory } from "../lib/content/schema";

const CATEGORIES = ["1", "2", "3"] as const;
const check = process.argv.includes("--check");

let changed = 0;
let checked = 0;
const problems: string[] = [];

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

const loaded: ContentCategory[] = [];

for (const category of CATEGORIES) {
  const sourceDir = join("content", "questions", `cat${category}`);
  if (!existsSync(sourceDir)) continue;

  const parsed = loadCategory(sourceDir);
  loaded.push(parsed);
  const { appJson, notes } = emitCategory(parsed);

  compare(join("public", "data", `cat${category}.json`), appJson);
  for (const [id, body] of notes) {
    compare(join("content", "notes", `cat${category}`, `${id}.mdx`), body);
  }
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

if (check) {
  if (problems.length > 0) {
    console.error(`content check failed (${problems.length} of ${checked} files):`);
    for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
    if (problems.length > 20) console.error(`  ...and ${problems.length - 20} more`);
    console.error("\nRun `bun run content:build` to regenerate.");
    process.exit(1);
  }
  console.log(`content check passed — ${checked} artifacts match their source`);
} else {
  console.log(`content build complete — ${changed} of ${checked} artifacts written`);
}
