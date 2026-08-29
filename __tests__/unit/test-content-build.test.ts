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
import { isWithheld } from "@/lib/content/schema";

const ROOT = resolve(__dirname, "../../");

const MIGRATED = (["1", "2", "3"] as const).filter((c) =>
  existsSync(join(ROOT, `content/questions/cat${c}`))
);

it("has at least one migrated category to check", () => {
  expect(MIGRATED.length).toBeGreaterThan(0);
});

describe.each(MIGRATED)("cat%s content build", (categoryId) => {
  const sourceDir = join(ROOT, `content/questions/cat${categoryId}`);
  const artifactPath = join(ROOT, `public/data/cat${categoryId}.json`);
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
    expect(artifacts.appJson).toBe(readFileSync(artifactPath, "utf-8"));
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
      } else if (isWithheld(q)) {
        // A withheld question keeps its explanation in source — it is not
        // deleted, only withdrawn — but emits no note, because /api/notes
        // reads straight from disk and would otherwise still serve it.
        expect(artifacts.notes.has(q.id)).toBe(false);
      } else {
        // cat1 and cat2 have questions with no explanation at all.
        expect(q.explanation).toBeNull();
      }
    }
  });

  it("withholds disabled questions from the shipped JSON but not from the bank", () => {
    const shipped = new Set(
      (JSON.parse(artifacts.appJson) as { questions: { id: number }[] }).questions.map((q) => q.id)
    );
    for (const q of category.questions) {
      // `order` keeps the id either way: that is what reserves it against
      // `nextId` and preserves the editorial position for a later return.
      expect(manifest.order).toContain(q.id);
      expect(shipped.has(q.id)).toBe(!isWithheld(q));
    }
    expect(artifacts.withheld).toEqual(category.questions.filter(isWithheld).map((q) => q.id));
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

  it("withholds a disabled question while keeping it loaded and in order", () => {
    // The whole mechanism on a two-question category, independent of whatever
    // the real bank currently has withheld.
    const dir = makeSourceDir();
    try {
      const [first, second] = reference.questions;
      writeFileSync(
        join(dir, questionFileName(second!.id)),
        serializeQuestionFile({ ...second!, disabled: "retirada pela ANACOM" })
      );
      writeFileSync(
        join(dir, MANIFEST_FILE),
        serializeManifest({ id: "3", anacomFile: 90, order: [first!.id, second!.id] })
      );

      const category = loadCategory(dir);
      // Still loaded: qbank and the authoring review must go on seeing it, so
      // a withdrawn question keeps blocking an accidental re-add.
      expect(category.questions.map((q) => q.id)).toEqual([first!.id, second!.id]);
      expect(category.questions[1]!.disabled).toBe("retirada pela ANACOM");

      const { appJson, notes, withheld } = emitCategory(category);
      expect(withheld).toEqual([second!.id]);
      const shipped = JSON.parse(appJson) as { questions: { id: number }[] };
      expect(shipped.questions.map((q) => q.id)).toEqual([first!.id]);
      expect(notes.has(second!.id)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("round-trips a withheld question through the file format", () => {
    // Serialization used to list fields explicitly, so a new field that was
    // not added here would be silently dropped on the next rewrite.
    const q = { ...reference.questions[0]!, disabled: "retirada pela ANACOM" };
    const dir = makeSourceDir();
    try {
      writeFileSync(join(dir, questionFileName(q.id)), serializeQuestionFile(q));
      writeFileSync(
        join(dir, MANIFEST_FILE),
        serializeManifest({
          id: "3",
          anacomFile: 90,
          order: [q.id, reference.questions[1]!.id],
        })
      );
      expect(loadCategory(dir).questions[0]).toEqual(q);
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
