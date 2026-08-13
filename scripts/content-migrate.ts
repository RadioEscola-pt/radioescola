#!/usr/bin/env bun
/**
 * One-time migration: legacy artifacts -> per-question source files
 *
 *   bun run scripts/content-migrate.ts <category>
 *
 * Reads `public/data/cat{n}.json` plus `content/notes/cat{n}/`, and writes
 * `content/questions/cat{n}/` — one file per question, plus the category
 * manifest holding the ANACOMFILE number and the editorial question order.
 *
 * This is deliberately not idempotent-by-default: it refuses to overwrite an
 * existing source directory, because re-running it after authoring has begun
 * would silently discard hand-written explanations. Pass --force when
 * re-running the migration itself is the intent.
 *
 * Nothing here is trusted on faith — `content-build.ts --check` verifies that
 * compiling the output reproduces the artifacts byte for byte.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fromLegacy } from "../lib/content/legacy";
import { serializeQuestionFile, questionFileName } from "../lib/content/source";
import { serializeManifest, MANIFEST_FILE } from "../lib/content/build";
import type { LegacyCategory } from "../lib/content/legacy";

const category = process.argv[2];
const force = process.argv.includes("--force");

if (!category || !["1", "2", "3"].includes(category)) {
  console.error("usage: bun run scripts/content-migrate.ts <1|2|3> [--force]");
  process.exit(1);
}

const legacyPath = join("public", "data", `cat${category}.json`);
const notesDir = join("content", "notes", `cat${category}`);
const sourceDir = join("content", "questions", `cat${category}`);

if (existsSync(sourceDir) && readdirSync(sourceDir).length > 0 && !force) {
  console.error(
    `${sourceDir} already exists and is not empty.\n` +
      `Re-running would overwrite authored explanations. Pass --force if that is intended.`
  );
  process.exit(1);
}

const legacy = JSON.parse(readFileSync(legacyPath, "utf-8")) as LegacyCategory;
const parsed = fromLegacy(legacy, category);

// Explanations live in the notes tree, not in the JSON, so they are merged in
// here — the whole point of the migration is that they stop being separate.
const questions = parsed.questions.map((q) => {
  const notePath = join(notesDir, `${q.id}.mdx`);
  if (!existsSync(notePath)) return q;
  const body = readFileSync(notePath, "utf-8").trim();
  return { ...q, explanation: body.length > 0 ? body : null };
});

mkdirSync(sourceDir, { recursive: true });

for (const q of questions) {
  writeFileSync(join(sourceDir, questionFileName(q.id)), serializeQuestionFile(q));
}

writeFileSync(
  join(sourceDir, MANIFEST_FILE),
  serializeManifest({
    id: category as "1" | "2" | "3",
    anacomFile: parsed.anacomFile,
    // Legacy array order is editorial and drives the browse sequence.
    order: parsed.questions.map((q) => q.id),
  })
);

const withExplanations = questions.filter((q) => q.explanation !== null).length;
console.log(
  `wrote ${questions.length} question files to ${sourceDir} ` +
    `(${withExplanations} with an explanation body)`
);
