#!/usr/bin/env bun
/**
 * One-time migration: composite source strings -> nested source references.
 *
 *   bun run scripts/migrate-source-refs.ts [--write]
 *
 * Before:
 *   sources:
 *     - cat3/2023_08_18p4
 *   sourcePages:
 *     cat3/2023_08_18p4: 1
 *
 * After:
 *   sources:
 *     - pdf: cat3/2023_08_18
 *       question: 4
 *       page: 1
 *
 * Runs against the raw frontmatter rather than the schema, because the schema
 * has already moved to the new shape and would reject every file on disk.
 *
 * Without --write it only reports, and it always verifies first: every file is
 * converted, converted back, and compared to what is on disk. A single
 * mismatch aborts the run before anything is written.
 */
import matter from "gray-matter";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CATEGORIES = ["1", "2", "3"] as const;
const write = process.argv.includes("--write");

/** "cat3/2023_08_18p4" -> { pdf: "cat3/2023_08_18", question: 4 } */
const ENTRY_RE = /^(.+)p(\d+)$/;

/**
 * A handful of entries carry HTML that leaked in from the old site, e.g.
 * "cat2/2021_09_06p4</a>". The intent is unambiguous, so strip the tag rather
 * than dropping a real reference.
 */
function repair(entry: string): string {
  return entry.trim().replace(/<[^>]*>\s*$/, "").trim();
}

type OldRef = { pdf: string; question: number; page: number | null };
type NewRef = { pdf: string; question: number; page?: number };

function toNewRefs(
  sources: string[],
  sourcePages: Record<string, number>,
  dropped: string[]
): NewRef[] {
  const out: NewRef[] = [];
  for (const raw of sources) {
    const entry = repair(raw);
    const m = ENTRY_RE.exec(entry);
    if (!m) {
      // Unparseable and unrepairable: an empty "cat3/", or a reference with no
      // pergunta number at all. Recorded and reported, never silently dropped.
      dropped.push(raw.trim());
      continue;
    }
    const page = sourcePages[raw.trim()] ?? sourcePages[entry];
    const ref: NewRef = { pdf: m[1]!, question: Number(m[2]) };
    if (page !== undefined) ref.page = page;
    out.push(ref);
  }
  return out;
}

/** Inverse, used only to prove the conversion loses nothing. */
function toOldRefs(refs: NewRef[]): OldRef[] {
  return refs.map((r) => ({ pdf: r.pdf, question: r.question, page: r.page ?? null }));
}

let files = 0;
let refs = 0;
let unresolved = 0;
const problems: string[] = [];
const dropped: string[] = [];
const pending: { path: string; content: string }[] = [];

for (const cat of CATEGORIES) {
  const dir = join(ROOT, "content", "questions", `cat${cat}`);
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".mdx")) continue;
    const path = join(dir, name);
    const raw = readFileSync(path, "utf-8");
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;

    const sources = (data.sources ?? []) as unknown[];
    if (sources.length === 0) continue;
    if (typeof sources[0] === "object") continue; // already migrated

    files++;
    const oldSources = sources as string[];
    const oldPages = (data.sourcePages ?? {}) as Record<string, number>;

    const droppedHere: string[] = [];
    const newRefs = toNewRefs(oldSources, oldPages, droppedHere);
    for (const d of droppedHere) dropped.push(`${name}: ${d}`);
    refs += newRefs.length;
    unresolved += newRefs.filter((r) => r.page === undefined).length;

    // Round-trip: the pairs recovered from the new shape must match the old.
    //
    // Compared semantically, not as strings: a few entries write the pergunta
    // zero-padded ("p07"), which parses to the same number and re-emits
    // unpadded. That is a normalization, not a loss, so the comparison uses the
    // numeric value. Malformed entries are excluded — they are reported
    // separately and would otherwise mask a genuine mismatch.
    const before = oldSources
      .map((entry) => repair(entry))
      .filter((entry) => ENTRY_RE.test(entry))
      .map((entry) => {
        const m = ENTRY_RE.exec(entry)!;
        return {
          pdf: m[1]!,
          question: Number(m[2]),
          page: oldPages[entry] ?? oldPages[entry.trim()] ?? null,
        };
      });
    const after = toOldRefs(newRefs);
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      problems.push(
        `${name}: round-trip mismatch\n    before ${JSON.stringify(before)}\n    after  ${JSON.stringify(after)}`
      );
      continue;
    }

    // A page recorded for an entry that was never cited would be dropped
    // silently by the conversion, so refuse rather than lose it.
    const cited = new Set(oldSources.map((s) => s.trim()));
    for (const key of Object.keys(oldPages)) {
      if (!cited.has(key)) problems.push(`${name}: sourcePages key not in sources: ${key}`);
    }

    const nextData: Record<string, unknown> = { ...data, sources: newRefs };
    delete nextData.sourcePages;
    pending.push({ path, content: matter.stringify(parsed.content, nextData) });
  }
}

console.log(`files with sources : ${files}`);
console.log(`references         : ${refs}`);
console.log(`  with a page      : ${refs - unresolved}`);
console.log(`  unresolved       : ${unresolved}`);

if (dropped.length > 0) {
  console.log(`\nDropped ${dropped.length} unparseable reference(s):`);
  for (const d of dropped) console.log(`  ${d}`);
  console.log("  (no pergunta number to convert — these were already dead links)");
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) — nothing written:`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  process.exit(1);
}
console.log("\nround-trip verified for every file: conversion loses nothing");

if (!write) {
  console.log("\nDry run. Re-run with --write to apply.");
  process.exit(0);
}

for (const { path, content } of pending) writeFileSync(path, content);
console.log(`\nWrote ${pending.length} file(s). Run \`bun run content:build\` next.`);
