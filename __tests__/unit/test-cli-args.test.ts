/**
 * Argument parsing and validation
 *
 * What these pin down is that bad input is *refused*. The parser used to
 * absorb it: `--tier inventado` reported `0 grupo(s)`, `--cat 5` printed a
 * table of zeros, `--limt` was ignored. Every one of those reads as a clean
 * bank — the answer you were hoping for — so a typo ended the search instead
 * of wasting a run. That is the same class of silent-and-plausible failure the
 * tool exists to find in the content.
 */
import { describe, it, expect } from "vitest";
import {
  parseArgs,
  validateFlags,
  nearest,
  canonicalValue,
  type FlagSpec,
} from "@/lib/cli/args";
import { levenshtein } from "@/lib/content/analysis";

const FLAGS: Record<string, FlagSpec> = {
  json: { describe: "json" },
  regex: { describe: "regex" },
  limit: { describe: "limit", placeholder: "<n>", number: "int" },
  "stem-min": { describe: "stem", placeholder: "<0-1>", number: "ratio" },
  cat: { describe: "cat", placeholder: "<3,2,1>", values: ["1", "2", "3"] },
  tier: {
    describe: "tier",
    placeholder: "<lista>",
    values: ["contradiction", "typo", "exact"],
    aliases: { gralha: "typo", exato: "exact" },
  },
};

const problems = (argv: string[]) => {
  const parsed = parseArgs(argv, (n) => FLAGS[n]);
  return validateFlags(parsed.flags, FLAGS, levenshtein);
};

describe("parseArgs", () => {
  it("takes the first non-option token as the command", () => {
    const parsed = parseArgs(["dupes", "--limit", "5"], (n) => FLAGS[n]);
    expect(parsed.command).toBe("dupes");
    expect(parsed.positional).toEqual([]);
    expect(parsed.flags.get("limit")).toBe("5");
  });

  it("keeps positionals separate from the command", () => {
    const parsed = parseArgs(["show", "cat3#1", "cat3#2"], (n) => FLAGS[n]);
    expect(parsed.command).toBe("show");
    expect(parsed.positional).toEqual(["cat3#1", "cat3#2"]);
  });

  it("does not let a valueless flag swallow the next argument", () => {
    // `search --regex termo` has to keep `termo` as the search term. The
    // greedy parser fed it to `--regex` and then reported no search term.
    const parsed = parseArgs(["search", "--regex", "ICO."], (n) => FLAGS[n]);
    expect(parsed.flags.get("regex")).toBe(true);
    expect(parsed.positional).toEqual(["ICO."]);
  });

  it("accepts --flag=value as well as --flag value", () => {
    expect(parseArgs(["x", "--limit=5"], (n) => FLAGS[n]).flags.get("limit")).toBe("5");
    expect(parseArgs(["x", "--limit", "5"], (n) => FLAGS[n]).flags.get("limit")).toBe("5");
  });

  it("reports no command when the first token is an option", () => {
    expect(parseArgs(["--help"], (n) => FLAGS[n]).command).toBeUndefined();
  });
});

describe("validateFlags", () => {
  it("passes valid input", () => {
    expect(problems(["dupes", "--tier", "typo", "--cat", "3", "--limit", "5"])).toEqual([]);
    expect(problems(["dupes", "--json"])).toEqual([]);
  });

  it("rejects a value outside the accepted set", () => {
    const [p] = problems(["dupes", "--tier", "inventado"]);
    expect(p).toMatchObject({ kind: "unknown-value", name: "tier", value: "inventado" });
  });

  it("rejects an unknown category rather than reporting an empty bank", () => {
    const [p] = problems(["coverage", "--cat", "5"]);
    expect(p).toMatchObject({ kind: "unknown-value", name: "cat", value: "5" });
  });

  it("checks every item of a comma-separated list", () => {
    const found = problems(["dupes", "--tier", "typo,inventado,exact"]);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ value: "inventado" });
  });

  it("accepts a value's alias", () => {
    expect(problems(["dupes", "--tier", "gralha,exato"])).toEqual([]);
  });

  it("rejects an unknown flag name and suggests the real one", () => {
    const [p] = problems(["search", "--limt", "2"]);
    expect(p).toMatchObject({ kind: "unknown-flag", name: "limt", suggestion: "limit" });
  });

  it("rejects a flag given no value", () => {
    const [p] = problems(["dupes", "--tier"]);
    expect(p).toMatchObject({ kind: "missing-value", name: "tier" });
  });

  it("rejects a non-numeric value rather than falling back", () => {
    expect(problems(["search", "--limit", "abc"])[0]).toMatchObject({
      kind: "not-a-number",
      name: "limit",
      integer: true,
    });
    expect(problems(["pairs", "--stem-min", "abc"])[0]).toMatchObject({
      kind: "not-a-number",
      integer: false,
    });
  });

  it("rejects a value given to a valueless flag", () => {
    const [p] = problems(["dupes", "--json=1"]);
    expect(p).toMatchObject({ kind: "unexpected-value", name: "json", value: "1" });
  });

  it("reports every problem, not just the first", () => {
    // Being told about one typo at a time is the interaction this replaces.
    expect(problems(["dupes", "--tier", "inventado", "--cat", "9", "--limt", "2"])).toHaveLength(3);
  });
});

describe("nearest", () => {
  it("suggests a name one edit away", () => {
    expect(nearest("ordr", ["order", "answers", "pairs"], levenshtein)).toBe("order");
    expect(nearest("limt", ["limit", "cat", "json"], levenshtein)).toBe("limit");
  });

  it("suggests nothing for a short value, where everything is one edit away", () => {
    // `--cat 5` must not "mean" 1: it is equally close to 2 and 3.
    expect(nearest("5", ["1", "2", "3"], levenshtein)).toBeNull();
  });

  it("suggests nothing when nothing is close", () => {
    expect(nearest("qwertyuiop", ["order", "pairs"], levenshtein)).toBeNull();
  });
});

describe("canonicalValue", () => {
  it("resolves an alias, case- and space-insensitively", () => {
    const aliases = { gralha: "typo" };
    expect(canonicalValue(" Gralha ", aliases)).toBe("typo");
    expect(canonicalValue("typo", aliases)).toBe("typo");
    expect(canonicalValue("outro", aliases)).toBe("outro");
  });
});
