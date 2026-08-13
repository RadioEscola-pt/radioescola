/**
 * Content build tests: per-question source -> shipped artifacts
 *
 * The migration safety property: compiling `content/questions/cat{n}/` must
 * reproduce both artifacts byte for byte — `public/data/cat{n}.json` and the
 * files under `content/notes/cat{n}/`.
 *
 * As long as this passes, the exploded source has lost nothing relative to the
 * hand-maintained JSON, and the generated files can be treated as build output
 * rather than as things to edit.
 *
 * Runs over every migrated category, so a category is covered the moment its
 * source directory exists.
 */
import { describe, it, expect } from "vitest";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import {
  loadCategory,
  emitCategory,
  serializeManifest,
  CategoryManifestSchema,
  MANIFEST_FILE,
} from "@/lib/content/build";
import { questionFileName, serializeQuestionFile } from "@/lib/content/source";

const ROOT = resolve(__dirname, "../../");

const MIGRATED = (["1", "2", "3"] as const).filter((c) =>
  existsSync(join(ROOT, `content/questions/cat${c}`))
);

it("has at least one migrated category to check", () => {
  expect(MIGRATED.length).toBeGreaterThan(0);
});

describe.each(MIGRATED)("cat%s content build", (categoryId) => {
  const sourceDir = join(ROOT, `content/questions/cat${categoryId}`);
  const legacyPath = join(ROOT, `public/data/cat${categoryId}.json`);
  const notesDir = join(ROOT, `content/notes/cat${categoryId}`);

  const manifest = CategoryManifestSchema.parse(
    JSON.parse(readFileSync(join(sourceDir, MANIFEST_FILE), "utf-8"))
  );
  const category = loadCategory(sourceDir);
  const artifacts = emitCategory(category);

  it("loads every question in the manifest's editorial order", () => {
    expect(category.questions.map((q) => q.id)).toEqual(manifest.order);
    expect(category.anacomFile).toBe(manifest.anacomFile);
  });

  it("reproduces the shipped JSON byte for byte", () => {
    expect(artifacts.legacyJson).toBe(readFileSync(legacyPath, "utf-8"));
  });

  it("reproduces every committed note file byte for byte", () => {
    const onDisk = readdirSync(notesDir).filter((f) => f.endsWith(".mdx"));

    const mismatches: string[] = [];
    for (const name of onDisk) {
      const id = Number.parseInt(name.replace(".mdx", ""), 10);
      const emitted = artifacts.notes.get(id);
      if (emitted === undefined) {
        mismatches.push(`${name}: not emitted`);
        continue;
      }
      if (emitted !== readFileSync(join(notesDir, name), "utf-8")) {
        mismatches.push(`${name}: content differs`);
      }
    }

    expect(mismatches).toEqual([]);
    // No extra note files either: emitting one for a question that has none on
    // disk would mean an explanation appeared from nowhere.
    expect(artifacts.notes.size).toBe(onDisk.length);
  });

  it("keeps every explanation attached to the right question", () => {
    // The failure this guards against is an off-by-one in the manifest order
    // silently pairing explanations with the wrong questions.
    for (const q of category.questions) {
      const notePath = join(notesDir, `${q.id}.mdx`);
      if (existsSync(notePath)) {
        expect(q.explanation).toBe(readFileSync(notePath, "utf-8").trim());
      } else {
        // cat1 and cat2 have questions with no explanation at all.
        expect(q.explanation).toBeNull();
      }
    }
  });
});

describe("source directory validation", () => {
  const reference = loadCategory(join(ROOT, "content/questions/cat3"));

  function makeSourceDir(): string {
    const dir = mkdtempSync(join(tmpdir(), "content-test-"));
    const [first, second] = reference.questions;
    writeFileSync(join(dir, questionFileName(first!.id)), serializeQuestionFile(first!));
    writeFileSync(join(dir, questionFileName(second!.id)), serializeQuestionFile(second!));
    return dir;
  }

  it("rejects a manifest listing a question with no file", () => {
    const dir = makeSourceDir();
    try {
      writeFileSync(
        join(dir, MANIFEST_FILE),
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
        join(dir, MANIFEST_FILE),
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
        serializeQuestionFile(reference.questions[1]!)
      );
      writeFileSync(
        join(dir, MANIFEST_FILE),
        serializeManifest({ id: "3", anacomFile: 90, order: [1, 4] })
      );
      expect(() => loadCategory(dir)).toThrow(/does not match filename id/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
