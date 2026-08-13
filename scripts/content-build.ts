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
import { loadCategory, emitCategory } from "../lib/content/build";

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

for (const category of CATEGORIES) {
  const sourceDir = join("content", "questions", `cat${category}`);
  if (!existsSync(sourceDir)) continue;

  const parsed = loadCategory(sourceDir);
  const { legacyJson, notes } = emitCategory(parsed);

  compare(join("public", "data", `cat${category}.json`), legacyJson);
  for (const [id, body] of notes) {
    compare(join("content", "notes", `cat${category}`, `${id}.mdx`), body);
  }
}

if (checked === 0) {
  console.log("no migrated categories found — nothing to build");
  process.exit(0);
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
