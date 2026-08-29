#!/usr/bin/env bun
/**
 * Developer tool for inspecting the question bank.
 *
 *   bun run qbank search "propagação"     # find questions by text
 *   bun run qbank show cat3#12            # one question in full
 *   bun run qbank dupes                   # duplicate groups, worst tier first
 *   bun run qbank pairs                   # fuzzy near-duplicates, polarity flips
 *   bun run qbank coverage                # sources, explanations, images
 *   bun run qbank topics                  # taxonomy distribution and outliers
 *   bun run qbank paper cat3/2023_08_18   # what cites a given exam paper
 *   bun run qbank answers                 # answer-construction audit
 *
 * Read-only, and deliberately not wired into CI. Schema validity and artifact
 * staleness are `content:check`'s job; duplicating them here would create a
 * second source of truth that drifts. What this reports instead is the class of
 * problem that cannot be expressed as a per-file rule — two files that are each
 * valid but disagree with each other.
 *
 * It reads `content/questions/**`, never `public/data/*.json`: the JSON is a
 * build artifact, so a finding against it could not name the file to edit and
 * would go stale between `content:build` runs.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import { loadCategory } from "../lib/content/build";
import { isWithheld } from "../lib/content/schema";
import { fold } from "../lib/utils/search";
import {
  buildBank,
  findDuplicateGroups,
  findPairFindings,
  coverage,
  auditTopics,
  auditPapers,
  auditAnswers,
  canonical,
  comparisonKey,
  parseRef,
  DUPLICATE_TIERS,
  type BankQuestion,
  type DuplicateTier,
} from "../lib/content/analysis";
import { topicShortLabel } from "../lib/config/topics";
import type { CategoryId } from "../lib/config/categories";

const BASELINE_FILE = join("content", "qbank-baseline.json");
const CATEGORIES = ["3", "2", "1"] as const;

/* -------------------------------------------------------------------------- */
/* Argument handling                                                           */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const positional: string[] = [];
const flags = new Map<string, string | true>();

for (let i = 0; i < argv.length; i++) {
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
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith("--")) {
    flags.set(name, next);
    i++;
  } else {
    flags.set(name, true);
  }
}

function flag(name: string): string | undefined {
  const value = flags.get(name);
  return typeof value === "string" ? value : undefined;
}
function has(name: string): boolean {
  return flags.has(name);
}
function num(name: string, fallback: number): number {
  const raw = flag(name);
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
function ratio(name: string): number | undefined {
  const raw = flag(name);
  if (raw === undefined) return undefined;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const asJson = has("json");
const limit = num("limit", 30);

/* -------------------------------------------------------------------------- */
/* Output                                                                      */
/* -------------------------------------------------------------------------- */

const ESC = "\u001b";
const colour = process.stdout.isTTY === true && !asJson;
const paint = (code: string, text: string) =>
  colour ? `${ESC}[${code}m${text}${ESC}[0m` : text;
const bold = (t: string) => paint("1", t);
const dim = (t: string) => paint("2", t);
const red = (t: string) => paint("31", t);
const green = (t: string) => paint("32", t);
const yellow = (t: string) => paint("33", t);
const cyan = (t: string) => paint("36", t);

const ANSI = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
const stripAnsi = (s: string) => s.replace(ANSI, "");
const pad = (s: string, width: number) => s + " ".repeat(Math.max(0, width - stripAnsi(s).length));

const out: string[] = [];
const say = (line = "") => out.push(line);
function flush(payload?: unknown) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(payload ?? null, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${out.join("\n")}\n`);
}

/** Truncates for a one-line summary, on a word boundary where it can. */
function clip(text: string, width: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= width) return flat;
  const cut = flat.slice(0, width - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > width * 0.6 ? cut.slice(0, space) : cut}…`;
}

/* -------------------------------------------------------------------------- */
/* File locations                                                              */
/* -------------------------------------------------------------------------- */

const fileCache = new Map<string, string[]>();

/**
 * Line number a piece of text sits on, so results are clickable.
 *
 * Matched on the folded text because a stem in the report has been through
 * normalisation while the file still holds the accented original.
 *
 * Shortening prefixes rather than one lookup: `matter.stringify` writes a long
 * stem as a folded scalar, so the question wraps across lines and no single
 * line contains all of it. The first line of the fold does contain the start.
 */
function locate(file: string, needle: string): number | null {
  if (!existsSync(file)) return null;
  let lines = fileCache.get(file);
  if (!lines) {
    lines = readFileSync(file, "utf-8").split("\n");
    fileCache.set(file, lines);
  }

  const full = fold(needle).trim();
  if (full.length === 0) return null;
  for (const width of [full.length, 48, 24]) {
    const target = full.slice(0, width);
    if (target.length < 8 && width !== full.length) continue;
    for (let i = 0; i < lines.length; i++) {
      if (fold(lines[i] ?? "").includes(target)) return i + 1;
    }
  }
  return null;
}

function where(q: BankQuestion, needle?: string): string {
  const line = locate(q.file, needle ?? q.question);
  return line === null ? q.file : `${q.file}:${line}`;
}

/* -------------------------------------------------------------------------- */
/* Baseline                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Findings a human has already looked at and accepted.
 *
 * Same ratchet as `content/missing-exams.json`, and for the same reason: a
 * report of sixty-odd duplicate groups is read once and then ignored forever.
 * With a baseline, `--new` shows only what has appeared since, which is the
 * form that stays useful.
 */
function loadBaseline(): Set<string> {
  if (!existsSync(BASELINE_FILE)) return new Set();
  const raw: unknown = JSON.parse(readFileSync(BASELINE_FILE, "utf-8"));
  const keys = (raw as { keys?: unknown }).keys;
  return new Set(Array.isArray(keys) ? keys.filter((k): k is string => typeof k === "string") : []);
}

function writeBaseline(keys: readonly string[]): void {
  const body = {
    note:
      "Findings from `bun run qbank` that a human has reviewed and accepted. A ratchet, not a permission slip: `--new` hides these, so only findings that appeared since show up. Shrink it when you fix something rather than letting it grow.",
    keys: [...keys].sort(),
  };
  writeFileSync(BASELINE_FILE, `${JSON.stringify(body, null, 2)}\n`);
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function load(): BankQuestion[] {
  const categories = CATEGORIES.map((c) => join("content", "questions", `cat${c}`))
    .filter((dir) => existsSync(dir))
    .map((dir) => loadCategory(dir));
  const bank = buildBank(categories);

  const only = flag("cat");
  if (only === undefined) return bank;
  const wanted = new Set(only.split(",").map((c) => c.replace(/^cat/, "").trim()));
  return bank.filter((q) => wanted.has(q.category));
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The disagreement kinds, for reading.
 *
 * The values themselves stay English: they are the `--json` payload and the
 * type in `lib/content/analysis.ts`, so only the rendering is translated.
 */
/**
 * `--tier contradição` and `--tier contradiction` both select the same groups.
 *
 * The report says `contradição` now, and a filter that cannot be typed from
 * what is on screen is a filter nobody reaches for. The English values stay
 * canonical — they are what `--json`, the baseline keys and `docs/qbank.md`
 * carry — so this only widens what is accepted.
 */
const TIER_ALIASES: Record<string, string> = {
  contradição: "contradiction",
  contradicao: "contradiction",
  gralha: "typo",
  divergente: "divergent",
  "respostas-partilhadas": "shared-answers",
  exato: "exact",
};
const KIND_ALIASES: Record<string, string> = {
  polaridade: "polarity",
  "enunciado-parecido": "near-stem",
};
const canonicalValue = (raw: string, aliases: Record<string, string>): string => {
  const trimmed = raw.trim();
  return aliases[trimmed.toLowerCase()] ?? trimmed;
};

const ISSUE_LABELS: Record<string, string> = {
  topic: "matéria",
  explanation: "explicação",
  sources: "fontes",
  image: "imagem",
  cosmetic: "cosmético",
};
const issueLabel = (kind: string) => ISSUE_LABELS[kind] ?? kind;

function tierLabel(tier: DuplicateTier): string {
  if (tier === "contradiction") return red(bold("contradição"));
  if (tier === "typo") return yellow("gralha");
  if (tier === "divergent") return yellow("divergente");
  if (tier === "shared-answers") return cyan("respostas partilhadas");
  return dim("exato");
}

function renderQuestion(q: BankQuestion, needle?: string): void {
  const topic = q.topic === null ? dim("sem matéria") : cyan(topicShortLabel(q.topic, "pt") ?? q.topic);
  // A withheld question is still compared against everything else — that is the
  // point of keeping it in the bank — so it has to be obvious at a glance that
  // what you are reading is not what the site is serving.
  const mark = isWithheld(q) ? `  ${red(bold("desativada"))}` : "";
  say(`${bold(q.ref)}  ${topic}${mark}  ${dim(where(q, needle))}`);
  if (isWithheld(q)) say(`  ${red(`desativada: ${q.disabled}`)}`);
  say(`  ${q.question}`);
  for (const a of q.answers) {
    say(`   ${a.correct ? green("✓") : dim("·")} ${clip(a.text, 100)}`);
  }
  const marks: string[] = [];
  marks.push(
    q.sources.length > 0
      ? q.sources
          .map((s) => `${s.pdf} pergunta ${s.question}${s.page === null ? "" : ` p.${s.page}`}`)
          .join("; ")
      : "sem fonte"
  );
  if (q.explanation === null) marks.push("sem explicação");
  if (q.image !== null) marks.push(`imagem ${q.image}`);
  say(`  ${dim(marks.join("  |  "))}`);
}

/* -------------------------------------------------------------------------- */
/* Commands                                                                    */
/* -------------------------------------------------------------------------- */

function cmdSearch(): void {
  const term = positional[1] ?? "";
  if (term.trim().length === 0) {
    say("uso: qbank search <termo> [--field stem|options|explanation] [--regex] [--cat 3]");
    return flush([]);
  }

  const field = flag("field") ?? "all";
  const pattern = has("regex") ? new RegExp(term, "iu") : null;
  const needle = canonical(term);
  const hit = (text: string) =>
    pattern !== null ? pattern.test(text) : canonical(text).includes(needle);

  const bank = load().filter((q) => {
    const inStem = hit(q.question);
    const inOptions = q.answers.some((a) => hit(a.text));
    const inExplanation = q.explanation !== null && hit(q.explanation);
    if (field === "stem") return inStem;
    if (field === "options") return inOptions;
    if (field === "explanation") return inExplanation;
    return inStem || inOptions || inExplanation;
  });

  if (asJson) {
    return flush(
      bank.map((q) => ({
        ref: q.ref,
        file: q.file,
        question: q.question,
        topic: q.topic,
        disabled: q.disabled,
      }))
    );
  }

  say(
    `${bold(String(bank.length))} pergunta(s) com ${cyan(term)}` +
      `${field === "all" ? "" : ` em ${field}`}`
  );
  say();
  for (const q of bank.slice(0, limit)) {
    renderQuestion(q, term);
    say();
  }
  if (bank.length > limit) say(dim(`…e mais ${bank.length - limit} (--limit ${bank.length})`));
  flush();
}

function cmdShow(): void {
  const bank = load();
  const refs = positional.slice(1);
  if (refs.length === 0) {
    say("uso: qbank show cat3#12 [cat2#255 …]");
    return flush([]);
  }

  const found: BankQuestion[] = [];
  for (const raw of refs) {
    const parsed = parseRef(raw);
    const q = parsed && bank.find((b) => b.category === parsed.category && b.id === parsed.id);
    if (!q) {
      say(red(`não existe a pergunta ${raw}`));
      continue;
    }
    found.push(q);
  }

  if (asJson) return flush(found);

  // A question is best understood next to its duplicates, so they come along.
  const groups = findDuplicateGroups(bank);
  for (const q of found) {
    renderQuestion(q);
    if (q.explanation !== null) {
      say();
      say(dim(clip(q.explanation, 400)));
    }
    for (const g of groups.filter((group) => group.members.some((m) => m.ref === q.ref))) {
      const others = g.members.filter((m) => m.ref !== q.ref).map((m) => m.ref);
      say();
      say(`  ${tierLabel(g.tier)} com ${others.join(", ")}`);
      for (const issue of g.issues) say(`    ${yellow(issueLabel(issue.kind))}: ${issue.detail}`);
    }
    say();
  }
  flush();
}

function cmdDupes(): void {
  const bank = load();

  if (has("update-baseline")) {
    const keys = [
      ...findDuplicateGroups(bank).map((g) => g.key),
      ...findPairFindings(bank).map((p) => p.key),
    ];
    writeBaseline(keys);
    say(`${green("registados")} ${keys.length} achado(s) em ${BASELINE_FILE}`);
    return flush({ baselined: keys.length });
  }

  let groups = findDuplicateGroups(bank);

  const wanted = flag("tier");
  if (wanted !== undefined) {
    const set = new Set(wanted.split(",").map((t) => canonicalValue(t, TIER_ALIASES)));
    groups = groups.filter((g) => set.has(g.tier));
  }
  if (has("new")) {
    const baseline = loadBaseline();
    groups = groups.filter((g) => !baseline.has(g.key));
  }

  if (asJson) {
    return flush(
      groups.map((g) => ({
        tier: g.tier,
        key: g.key,
        crossCategory: g.crossCategory,
        issues: g.issues,
        members: g.members.map((m) => ({ ref: m.ref, file: m.file, topic: m.topic })),
      }))
    );
  }

  const counts = new Map<DuplicateTier, number>();
  for (const g of groups) counts.set(g.tier, (counts.get(g.tier) ?? 0) + 1);
  say(
    `${bold(String(groups.length))} grupo(s): ` +
      DUPLICATE_TIERS.filter((t) => counts.has(t))
        .map((t) => `${counts.get(t)} ${tierLabel(t)}`)
        .join(", ")
  );
  say();

  for (const g of groups.slice(0, limit)) {
    const scope = g.crossCategory ? dim("entre categorias") : yellow("na mesma categoria");
    say(`${tierLabel(g.tier)}  ${g.members.map((m) => bold(m.ref)).join(" ≡ ")}  ${scope}`);
    const first = g.members[0];
    if (first) say(`  ${clip(first.question, 110)}`);

    // For anything but an exact match, show what actually differs — the point
    // of the report is the disagreement, not the fact of the pairing.
    if (g.tier !== "exact") {
      // Options every member shares are noise here; a typo is by definition in
      // the one option that does not line up, which is rarely the correct one.
      const shared = g.members
        .map((m) => new Set(m.answers.map((a) => comparisonKey(a.text))))
        .reduce((acc, set) => new Set([...acc].filter((t) => set.has(t))));

      for (const m of g.members) {
        if (g.tier === "shared-answers") {
          say(`    ${dim(pad(m.ref, 9))} ${clip(m.question, 88)}`);
          continue;
        }
        const odd = m.answers.filter((a) => !shared.has(comparisonKey(a.text)));
        const shown = odd.length > 0 ? odd : m.answers.filter((a) => a.correct);
        for (const [i, a] of shown.entries()) {
          const label = i === 0 ? pad(m.ref, 9) : " ".repeat(9);
          say(`    ${dim(label)} ${a.correct ? green("✓") : dim("·")} ${clip(a.text, 86)}`);
        }
      }
    }
    for (const issue of g.issues) say(`    ${yellow(issueLabel(issue.kind))}: ${issue.detail}`);
    say(dim(`    ${g.members.map((m) => where(m)).join("  ")}`));
    say();
  }
  if (groups.length > limit) {
    say(dim(`…e mais ${groups.length - limit} (--limit ${groups.length})`));
  }
  flush();
}

function cmdPairs(): void {
  const bank = load();
  let findings = findPairFindings(bank, {
    stemMin: ratio("stem-min"),
    answerMin: ratio("answer-min"),
  });

  // A pair whose members already share a stem or an option set is a duplicate
  // group, and `dupes` says more about it than this does. Reporting it twice
  // is how a report earns a reputation for repeating itself.
  if (!has("all")) {
    const grouped = new Set<string>();
    for (const g of findDuplicateGroups(bank)) {
      for (const x of g.members) {
        for (const y of g.members) if (x.ref < y.ref) grouped.add(`${x.ref},${y.ref}`);
      }
    }
    findings = findings.filter((f) => !grouped.has(`${f.a.ref},${f.b.ref}`));
  }

  const kind = flag("kind");
  if (kind !== undefined) {
    const want = canonicalValue(kind, KIND_ALIASES);
    findings = findings.filter((f) => f.kind === want);
  }
  if (has("new")) {
    const baseline = loadBaseline();
    findings = findings.filter((f) => !baseline.has(f.key));
  }

  if (asJson) {
    return flush(
      findings.map((f) => ({
        kind: f.kind,
        key: f.key,
        stemSimilarity: Number(f.stemSimilarity.toFixed(3)),
        answerSimilarity: Number(f.answerSimilarity.toFixed(3)),
        a: { ref: f.a.ref, file: f.a.file, question: f.a.question },
        b: { ref: f.b.ref, file: f.b.file, question: f.b.question },
      }))
    );
  }

  const flips = findings.filter((f) => f.kind === "polarity").length;
  say(
    `${bold(String(findings.length))} par(es): ${flips} ${red("de polaridade invertida")}, ` +
      `${findings.length - flips} ${yellow("de enunciado parecido")}`
  );
  say(
    dim(
      "Polaridade invertida são duas perguntas quase iguais a pedir respostas opostas — confirmar, nunca fundir."
    )
  );
  say();

  for (const f of findings.slice(0, limit)) {
    const label = f.kind === "polarity" ? red(bold("polaridade")) : yellow("enunciado parecido");
    say(
      `${label}  ${bold(f.a.ref)} ↔ ${bold(f.b.ref)}  ` +
        dim(`enunciado ${f.stemSimilarity.toFixed(2)} · respostas ${f.answerSimilarity.toFixed(2)}`)
    );
    say(`    ${dim(pad(f.a.ref, 9))} ${clip(f.a.question, 92)}`);
    say(`    ${dim(pad(f.b.ref, 9))} ${clip(f.b.question, 92)}`);
    say(dim(`    ${where(f.a)}  ${where(f.b)}`));
    say();
  }
  if (findings.length > limit) {
    say(dim(`…e mais ${findings.length - limit} (--limit ${findings.length})`));
  }
  flush();
}

/** Every image file under public/images, so orphans can be spotted. */
function imagesOnDisk(): string[] {
  const root = join("public", "images");
  if (!existsSync(root)) return [];
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else found.push(path.replace(/^public\//, ""));
    }
  };
  walk(root);
  return found;
}

function cmdCoverage(): void {
  const bank = load();
  const rows = coverage(bank);

  const referenced = new Set<string>();
  for (const q of bank) {
    if (q.image !== null) referenced.add(q.image.replace(/^\//, ""));
    for (const m of (q.explanation ?? "").matchAll(/<img[^>]+src=['"]([^'"]+)['"]/gi)) {
      referenced.add((m[1] ?? "").replace(/^\//, ""));
    }
  }
  // Category covers are referenced from lib/config/categories.ts rather than
  // from a question, so they are not orphans however this report counts them.
  const orphans = imagesOnDisk().filter(
    (f) => !referenced.has(f) && !/\/cover\.[a-z0-9]+$/.test(f)
  );

  if (asJson) return flush({ rows, orphanImages: orphans });

  const pct = (n: number, total: number) =>
    total === 0 ? "—" : `${Math.round((n / total) * 100)}%`;
  const head = ["", "total", "desativadas", "com fonte", "refs", "com página", "explicadas", "imagens", "matéria"];
  const table = rows.map((r) => [
    r.label,
    String(r.total),
    r.withheld === 0 ? dim("—") : red(String(r.withheld)),
    `${r.withSources} ${dim(pct(r.withSources, r.total))}`,
    String(r.sourceRefs),
    `${r.refsWithPage} ${dim(pct(r.refsWithPage, r.sourceRefs))}`,
    `${r.withExplanation} ${dim(pct(r.withExplanation, r.total))}`,
    String(r.withImage),
    `${r.withTopic} ${dim(pct(r.withTopic, r.total))}`,
  ]);

  const widths = head.map((h, i) =>
    Math.max(h.length, ...table.map((row) => stripAnsi(row[i] ?? "").length))
  );
  say(bold(head.map((h, i) => pad(h, widths[i] ?? 0)).join("  ")));
  for (const row of table) say(row.map((cell, i) => pad(cell, widths[i] ?? 0)).join("  "));

  if (orphans.length > 0) {
    say();
    say(`${yellow(String(orphans.length))} imagem(ns) em disco que nenhuma pergunta refere:`);
    for (const o of orphans.slice(0, limit)) say(`  public/${o}`);
    if (orphans.length > limit) say(dim(`  …e mais ${orphans.length - limit}`));
  }
  flush();
}

function cmdTopics(): void {
  const bank = load();
  const audit = auditTopics(bank);

  if (asJson) {
    return flush({
      distribution: audit.distribution,
      untagged: audit.untagged.map((q) => q.ref),
      invalid: audit.invalid.map((q) => ({ ref: q.ref, topic: q.topic })),
      aboveEntryLevel: audit.aboveEntryLevel.map((q) => ({ ref: q.ref, topic: q.topic })),
    });
  }

  const head = ["matéria", "cat3", "cat2", "cat1", "total"];
  const table = audit.distribution.map((d) => [
    d.slug,
    ...(["3", "2", "1"] as CategoryId[]).map((c) => String(d.counts[c])),
    String(d.total),
  ]);
  const widths = head.map((h, i) =>
    Math.max(h.length, ...table.map((row) => (row[i] ?? "").length))
  );
  say(bold(head.map((h, i) => pad(h, widths[i] ?? 0)).join("  ")));
  for (const row of table) say(row.map((cell, i) => pad(cell, widths[i] ?? 0)).join("  "));

  if (audit.invalid.length > 0) {
    say();
    say(
      red(`${audit.invalid.length} pergunta(s) com uma matéria que não é um slug de lib/config/topics.ts:`)
    );
    for (const q of audit.invalid) say(`  ${q.ref} = ${q.topic}  ${dim(where(q))}`);
  }
  if (audit.untagged.length > 0) {
    say();
    say(
      `${yellow(String(audit.untagged.length))} pergunta(s) sem matéria: ` +
        audit.untagged.slice(0, 20).map((q) => q.ref).join(", ")
    );
  }
  if (audit.aboveEntryLevel.length > 0) {
    say();
    say(
      `${audit.aboveEntryLevel.length} pergunta(s) de categoria 3 num capítulo que o Anexo 1 ` +
        "marca como começando acima do nível de entrada:"
    );
    say(
      dim("  Indicativo — as provas reais de cat 3 de 2023 examinam-nas. Ver examinedFrom em lib/config/topics.ts.")
    );
    for (const q of audit.aboveEntryLevel.slice(0, limit)) {
      say(`  ${pad(q.ref, 9)} ${dim(pad(q.topic ?? "", 16))} ${clip(q.question, 70)}`);
    }
  }
  flush();
}

function cmdPaper(): void {
  const bank = load();
  const papers = auditPapers(bank);
  const wanted = positional[1];

  if (wanted === undefined) {
    if (asJson) {
      return flush(
        papers.map((p) => ({
          pdf: p.pdf,
          cited: p.cited.length,
          resolved: p.cited.filter((c) => c.page !== null).length,
          gaps: p.gaps.length,
          collisions: p.collisions.length,
          onDisk: existsSync(join("public", "exams", `${p.pdf}.pdf`)),
        }))
      );
    }
    say(bold(`${papers.length} prova(s) citada(s) pelo banco`));
    say();
    for (const p of papers) {
      const disk = existsSync(join("public", "exams", `${p.pdf}.pdf`));
      const resolved = p.cited.filter((c) => c.page !== null).length;
      say(
        `${bold(pad(p.pdf, 24))} ${String(p.cited.length).padStart(3)} citadas  ` +
          `${dim(`${resolved} com página`)}  ` +
          `${p.gaps.length > 0 ? yellow(`${p.gaps.length} por reclamar`) : green("completa")}` +
          `${p.collisions.length > 0 ? red(`  ${p.collisions.length} colisões`) : ""}` +
          `${disk ? "" : red("  PDF ausente")}`
      );
    }
    return flush();
  }

  const paper = papers.find((p) => p.pdf === wanted || p.pdf.endsWith(`/${wanted}`));
  if (!paper) {
    say(red(`nenhuma pergunta cita ${wanted}`));
    return flush(null);
  }
  if (asJson) return flush(paper);

  say(`${bold(paper.pdf)}  ${paper.cited.length} pergunta(s) citada(s)`);
  say();
  for (const c of paper.cited) {
    const q = bank.find((b) => b.ref === c.ref);
    say(
      `  ${String(c.question).padStart(3)}  ` +
        `${c.page === null ? dim("p. —") : `p.${String(c.page).padStart(2)}`}  ` +
        `${bold(pad(c.ref, 9))} ${clip(q?.question ?? "", 78)}`
    );
  }
  if (paper.gaps.length > 0) {
    say();
    say(`${yellow("perguntas por reclamar")}: ${paper.gaps.join(", ")}`);
    say(dim("  Ou ainda não estão no banco, ou estão nele sem referência à fonte."));
  }
  for (const c of paper.collisions) {
    say();
    say(red(`pergunta ${c.question} reclamada por ${c.refs.join(", ")} — no máximo uma pode estar certa`));
  }
  flush();
}

function cmdAnswers(): void {
  const bank = load();
  const audit = auditAnswers(bank);

  if (asJson) {
    return flush({
      ...audit,
      optionCount: Object.fromEntries(audit.optionCount),
    });
  }

  const total = audit.total;
  say(bold("posição da resposta certa"));
  audit.correctIndexCounts.forEach((count, i) => {
    const share = Math.round((count / total) * 100);
    say(
      `  ${String.fromCharCode(97 + i)}  ${String(count).padStart(4)}  ` +
        `${String(share).padStart(2)}%  ${dim("█".repeat(Math.round(share / 2)))}`
    );
  });
  say(
    dim(
      `  O uniforme seria ${Math.round(100 / audit.correctIndexCounts.length)}%; um pico significa que o banco se adivinha.`
    )
  );

  say();
  const longestShare = Math.round((audit.longestIsCorrect / total) * 100);
  const chance = Math.round(100 / (audit.correctIndexCounts.length || 4));
  say(
    `${bold("a opção mais longa é a certa")}  ${audit.longestIsCorrect}/${total} (${longestShare}%)  ` +
      dim(`o acaso ronda os ${chance}%`)
  );

  say();
  say(bold("opções por pergunta"));
  for (const [count, n] of [...audit.optionCount.entries()].sort((a, b) => a[0] - b[0])) {
    say(`  ${count} opções  ${n}`);
  }

  if (audit.duplicateOptions.length > 0) {
    say();
    say(red(`${audit.duplicateOptions.length} pergunta(s) com duas opções iguais:`));
    for (const d of audit.duplicateOptions.slice(0, limit)) {
      say(`  ${bold(d.ref)}  ${clip(d.text, 70)}  ${dim(d.file)}`);
    }
  }
  if (audit.misplacedCatchAll.length > 0) {
    say();
    say(`${yellow(String(audit.misplacedCatchAll.length))} opção(ões) de fecho fora da última posição:`);
    for (const m of audit.misplacedCatchAll.slice(0, limit)) {
      say(`  ${bold(m.ref)}  posição ${m.index + 1} de ${m.count}  ${dim(m.file)}`);
    }
  }
  flush();
}

function usage(): void {
  say(bold("qbank — inspeção do banco de questões"));
  say();
  say("  search <termo>   procura perguntas por texto  [--field stem|options|explanation] [--regex]");
  say("  show <ref…>      uma pergunta por inteiro, com os seus duplicados");
  say("  dupes            grupos de duplicados, o pior primeiro  [--tier] [--new] [--update-baseline]");
  say("  pairs            quase-duplicados e inversões de polaridade  [--kind] [--new]");
  say("  coverage         fontes, explicações, imagens, órfãs");
  say("  topics           distribuição da taxonomia e casos fora do nível");
  say("  paper [pdf]      o que cita uma prova, e o que ficou por reclamar");
  say("  answers          auditoria à construção das respostas");
  say();
  say(dim("  globais: --cat 3,2   --limit N   --json"));
  flush(null);
}

const command = positional[0] ?? "help";
const commands: Record<string, () => void> = {
  search: cmdSearch,
  show: cmdShow,
  dupes: cmdDupes,
  duplicates: cmdDupes,
  pairs: cmdPairs,
  coverage: cmdCoverage,
  topics: cmdTopics,
  paper: cmdPaper,
  papers: cmdPaper,
  answers: cmdAnswers,
};

const run = commands[command];
if (run) run();
else usage();
