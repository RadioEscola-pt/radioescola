/**
 * Content build tests: per-question source -> shipped artifacts
 *
 * The migration safety property, in its final form: compiling
 * `content/questions/cat3/` must reproduce both artifacts byte for byte —
 * `public/data/cat3.json` and all 209 files under `content/notes/cat3/`.
 *
 * As long as this passes, the exploded source has lost nothing relative to the
 * hand-maintained JSON, and the generated files can be treated as build output
 * rather than as things to edit.
 */
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { loadCategory, emitCategory, serializeManifest } from "@/lib/content/build";
import { questionFileName, serializeQuestionFile } from "@/lib/content/source";

const ROOT = resolve(__dirname, "../../");
const SOURCE_DIR = join(ROOT, "content/questions/cat3");
const LEGACY_PATH = join(ROOT, "public/data/cat3.json");
const NOTES_DIR = join(ROOT, "content/notes/cat3");

const category = loadCategory(SOURCE_DIR);
const artifacts = emitCategory(category);

describe("cat3 content build", () => {
  it("loads every question in the manifest's editorial order", () => {
    expect(category.questions).toHaveLength(209);
    expect(category.anacomFile).toBe(90);

    // Not id order: 210-213 are interleaved early, which is exactly what the
    // manifest exists to preserve.
    const ids = category.questions.map((q) => q.id);
    expect(ids).not.toEqual([...ids].sort((a, b) => a - b));
    expect(ids.slice(0, 3)).toEqual([1, 4, 5]);
  });

  it("reproduces public/data/cat3.json byte for byte", () => {
    expect(artifacts.legacyJson).toBe(readFileSync(LEGACY_PATH, "utf-8"));
  });

  it("reproduces every committed note file byte for byte", () => {
    const onDisk = readdirSync(NOTES_DIR).filter((f) => f.endsWith(".mdx"));

    const mismatches: string[] = [];
    for (const name of onDisk) {
      const id = Number.parseInt(name.replace(".mdx", ""), 10);
      const emitted = artifacts.notes.get(id);
      if (emitted === undefined) {
        mismatches.push(`${name}: not emitted`);
        continue;
      }
      if (emitted !== readFileSync(join(NOTES_DIR, name), "utf-8")) {
        mismatches.push(`${name}: content differs`);
      }
    }

    expect(mismatches).toEqual([]);
    expect(artifacts.notes.size).toBe(onDisk.length);
  });

  it("keeps every question's explanation attached to the right question", () => {
    // The failure this guards against is an off-by-one in the manifest order
    // silently pairing explanations with the wrong questions.
    for (const q of category.questions) {
      const note = readFileSync(join(NOTES_DIR, `${q.id}.mdx`), "utf-8");
      expect(q.explanation).toBe(note.trim());
    }
  });
});

describe("source directory validation", () => {
  function makeSourceDir(): string {
    const dir = mkdtempSync(join(tmpdir(), "content-test-"));
    const [first, second] = category.questions;
    writeFileSync(join(dir, questionFileName(first!.id)), serializeQuestionFile(first!));
    writeFileSync(join(dir, questionFileName(second!.id)), serializeQuestionFile(second!));
    return dir;
  }

  it("rejects a manifest listing a question with no file", () => {
    const dir = makeSourceDir();
    try {
      writeFileSync(
        join(dir, "category.json"),
        serializeManifest({ id: "3", anacomFile: 90, order: [1, 4, 9999] })
      );
      expect(() => loadCategory(dir)).toThrow(/in order but no file: 9999/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a question file missing from the manifest", () => {
    const dir = makeSourceDir();
    try {
      writeFileSync(
        join(dir, "category.json"),
        serializeManifest({ id: "3", anacomFile: 90, order: [1] })
      );
      expect(() => loadCategory(dir)).toThrow(/file but not in order: 4/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a filename that disagrees with its frontmatter id", () => {
    const dir = makeSourceDir();
    try {
      // Write question 4's content under question 1's filename.
      writeFileSync(
        join(dir, questionFileName(1)),
        serializeQuestionFile(category.questions[1]!)
      );
      writeFileSync(
        join(dir, "category.json"),
        serializeManifest({ id: "3", anacomFile: 90, order: [1, 4] })
      );
      expect(() => loadCategory(dir)).toThrow(/does not match filename id/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
