/**
 * Command-line argument parsing and validation
 *
 * Split out of `scripts/qbank.ts` for the same reason the finders live in
 * `lib/content/analysis.ts`: the rules are worth testing, and the script is
 * I/O and formatting.
 *
 * The problem this exists to solve is that a hand-rolled parser absorbs bad
 * input by default. `--tier inventado` filtered on a value nothing matched and
 * reported `0 grupo(s)`; `--cat 5` produced a coverage table of zeros; a
 * misspelt `--limt` was ignored. All three read as a clean bank — the answer
 * you were hoping for — so a typo did not waste a run, it ended the search.
 *
 * Every accepted option is therefore declared, and anything undeclared is a
 * problem rather than a default. Problems are returned as data, not printed:
 * the caller owns the colours and the wording.
 */

export type FlagSpec = {
  describe: string;
  /** Accepted values. Anything else is a problem. */
  values?: readonly string[];
  /** Extra spellings for those values, e.g. `gralha` = `typo`. */
  aliases?: Record<string, string>;
  /** Shown in help, e.g. `<slug>`. Absent means the flag takes no value. */
  placeholder?: string;
  /** How to read the value, and how to complain when it does not parse. */
  number?: "int" | "ratio";
};

export type CommandSpec = {
  describe: string;
  /** Positional part of the usage line, e.g. `<termo>`. */
  args?: string;
  flags?: Record<string, FlagSpec>;
  example?: string;
};

export type ParsedArgs = {
  /** First token, when it is not an option. Never a flag value. */
  command: string | undefined;
  /** Positional arguments *after* the command. */
  positional: string[];
  /** `true` for a flag given without a value. */
  flags: Map<string, string | true>;
};

/** Resolves a value through its alias table. */
export function canonicalValue(raw: string, aliases: Record<string, string>): string {
  const trimmed = raw.trim();
  return aliases[trimmed.toLowerCase()] ?? trimmed;
}

/**
 * Closest candidate by edit distance, or null when nothing is close enough.
 *
 * Nothing shorter than three characters gets a suggestion: every one-letter
 * value is one edit from every other, so `--cat 5` would "mean" 1, 2 and 3
 * equally and the guess would be noise. Above that, half the length allows a
 * transposition or a dropped letter while keeping `--xyz` from "meaning"
 * `--cat`.
 */
export function nearest(
  input: string,
  candidates: readonly string[],
  distance: (a: string, b: string) => number
): string | null {
  if (input.length < 3) return null;

  let best: { name: string; d: number } | null = null;
  for (const name of candidates) {
    const d = distance(input.toLowerCase(), name.toLowerCase());
    if (best === null || d < best.d) best = { name, d };
  }
  if (best === null) return null;
  return best.d <= Math.floor(input.length / 2) ? best.name : null;
}

/**
 * Splits argv into a command, positionals and flags.
 *
 * `known` decides whether a flag consumes what follows it: a flag declared
 * without a `placeholder` takes no value, so `search --regex termo` keeps
 * `termo` as the search term instead of feeding it to `--regex`. An undeclared
 * flag is assumed to take a value — it is already a problem, and swallowing
 * the next token keeps the complaint about the flag rather than producing a
 * second, confusing one about a stray positional.
 */
export function parseArgs(
  argv: readonly string[],
  known: (flag: string) => FlagSpec | undefined
): ParsedArgs {
  const first = argv[0];
  const command = first !== undefined && !first.startsWith("--") ? first : undefined;

  const positional: string[] = [];
  const flags = new Map<string, string | true>();

  for (let i = command === undefined ? 0 : 1; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const [name, inline] = arg.slice(2).split("=", 2);
    if (!name) continue;
    if (inline !== undefined) {
      flags.set(name, inline);
      continue;
    }

    const spec = known(name);
    const takesValue = spec === undefined || spec.placeholder !== undefined;
    const next = argv[i + 1];
    if (takesValue && next !== undefined && !next.startsWith("--")) {
      flags.set(name, next);
      i++;
    } else {
      flags.set(name, true);
    }
  }

  return { command, positional, flags };
}

export type ArgProblem =
  | { kind: "unknown-flag"; name: string; suggestion: string | null; known: string[] }
  | { kind: "unexpected-value"; name: string; value: string }
  | { kind: "missing-value"; name: string; placeholder: string }
  | { kind: "not-a-number"; name: string; value: string; integer: boolean }
  | {
      kind: "unknown-value";
      name: string;
      value: string;
      suggestion: string | null;
      values: readonly string[];
      aliases: string[];
    };

/**
 * Every way the given flags fail their declarations, in the order given.
 *
 * All of them, not just the first: fixing one typo only to be told about the
 * next is the interaction this is meant to replace.
 */
export function validateFlags(
  flags: ReadonlyMap<string, string | true>,
  known: Readonly<Record<string, FlagSpec>>,
  distance: (a: string, b: string) => number
): ArgProblem[] {
  const problems: ArgProblem[] = [];
  const knownNames = Object.keys(known);

  for (const [name, value] of flags) {
    const spec = known[name];
    if (spec === undefined) {
      problems.push({
        kind: "unknown-flag",
        name,
        suggestion: nearest(name, knownNames, distance),
        known: knownNames,
      });
      continue;
    }

    if (spec.placeholder === undefined) {
      // Declared valueless. Only `--flag=x` can reach this, since the parser
      // will not have consumed a following token for it.
      if (typeof value === "string") {
        problems.push({ kind: "unexpected-value", name, value });
      }
      continue;
    }

    if (value === true) {
      problems.push({ kind: "missing-value", name, placeholder: spec.placeholder });
      continue;
    }

    if (spec.number !== undefined) {
      const parsed =
        spec.number === "int" ? Number.parseInt(value, 10) : Number.parseFloat(value);
      if (Number.isNaN(parsed)) {
        problems.push({
          kind: "not-a-number",
          name,
          value,
          integer: spec.number === "int",
        });
      }
      continue;
    }

    if (spec.values === undefined) continue;

    // Values are comma-separated lists wherever they are a filter, so each
    // item is checked: `--tier gralha,inventado` names one real problem.
    const accepted = new Set(spec.values);
    const aliases = Object.keys(spec.aliases ?? {});
    for (const raw of value.split(",")) {
      const item = raw.trim();
      if (item.length === 0) continue;
      const resolved = spec.aliases === undefined ? item : canonicalValue(item, spec.aliases);
      if (accepted.has(resolved)) continue;
      problems.push({
        kind: "unknown-value",
        name,
        value: item,
        suggestion: nearest(item, [...spec.values, ...aliases], distance),
        values: spec.values,
        aliases,
      });
    }
  }

  return problems;
}
