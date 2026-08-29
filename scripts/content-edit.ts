#!/usr/bin/env bun
/**
 * Changes a question already in the bank.
 *
 *   bun run content:edit cat3#86                 # interactive, one field at a time
 *   bun run content:edit cat3#86 --editor        # the whole file in $EDITOR
 *   bun run content:edit cat3#86 --from fix.mdx  # replace from a file
 *   bun run content:edit --sem-explicacao --cat 2   # walk the queue
 *   bun run content:edit cat3#86 --disable "motivo"
 *
 * `content:new` existed and nothing matched it for changing a question, so an
 * edit meant opening the MDX by hand: no duplicate review, no topic picker, no
 * validation until the next `content:build`. That matters most for the 260
 * questions with no explanation, which is the bank's largest remaining gap and
 * is entirely an editing job.
 *
 * Every write goes through `reviewDraft`, the same review `content:new` runs,
 * with `editing` set so the question is not reported as a duplicate of itself.
 * The rules are in `lib/content/author.ts` and the I/O in `./content-io.ts`;
 * this file is the loop and the prompts.
 *
 * `order` is deliberately untouched. Moving a question is an editorial
 * decision about the browse sequence rather than a change to the question, and
 * `qbank order` is where you go to make it.
 */
import { readFileSync } from "fs";
import matter from "gray-matter";
import {
  reviewDraft,
  diffQuestions,
  hasErrors,
  isWithheldReason,
  type Draft,
  type FieldChange,
} from "../lib/content/author";
import { serializeQuestionFile } from "../lib/content/source";
import { parseRef, bankRef, type BankQuestion } from "../lib/content/analysis";
import type { ContentQuestion } from "../lib/content/schema";
import {
  bold,
  dim,
  red,
  green,
  yellow,
  interactive,
  askText,
  askChoice,
  confirm as askConfirm,
  closePrompts,
} from "./prompt";
import {
  clip,
  printFindings,
  printQuestion,
  loadAll,
  loadManifest,
  pdfLookup,
  imageExists,
  askAnswers,
  askTopic,
  askSources,
  askImage,
  askExplanation,
  writeQuestion,
} from "./content-io";
import { CATEGORIES, type CategoryId } from "../lib/config/categories";

/* -------------------------------------------------------------------------- */
/* Arguments                                                                   */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const positional: string[] = [];
const flags = new Map<string, string | true>();
const VALUELESS = new Set([
  "help",
  "h",
  "dry-run",
  "yes",
  "force",
  "editor",
  "enable",
  "sem-explicacao",
  "sem-fonte",
  "desativadas",
]);

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
  if (!VALUELESS.has(name) && next !== undefined && !next.startsWith("--")) {
    flags.set(name, next);
    i++;
  } else {
    flags.set(name, true);
  }
}
const flag = (name: string): string | undefined => {
  const value = flags.get(name);
  return typeof value === "string" ? value : undefined;
};
const has = (name: string) => flags.has(name);

const dryRun = has("dry-run");
const assumeYes = has("yes");
const force = has("force");
const confirm = (question: string, fallback = false) =>
  askConfirm(question, { fallback, assumeYes });

function die(message: string, ...detail: string[]): never {
  console.error(`\n${red("✗")} ${message}`);
  for (const d of detail) console.error(`  ${d}`);
  closePrompts();
  process.exit(1);
}

function usage(): never {
  console.log(bold("content:edit — alterar uma pergunta do banco"));
  console.log();
  console.log("  bun run content:edit cat3#86                interativo, campo a campo");
  console.log("  bun run content:edit cat3#86 --editor       o ficheiro inteiro no $EDITOR");
  console.log("  bun run content:edit cat3#86 --from fix.mdx substitui a partir de um ficheiro");
  console.log("  bun run content:edit --sem-explicacao --cat 2   percorre a fila");
  console.log();
  console.log(dim("  --disable <motivo>  retira a pergunta do site sem a apagar"));
  console.log(dim("  --enable            volta a publicá-la"));
  console.log(dim("  --sem-explicacao    seleciona as perguntas sem explicação"));
  console.log(dim("  --sem-fonte         seleciona as perguntas que não citam prova"));
  console.log(dim("  --desativadas       seleciona as perguntas desativadas"));
  console.log(dim("  --cat 3             restringe a seleção a uma categoria"));
  console.log(dim("  --limit 10          quantas perguntas da fila percorrer"));
  console.log(dim("  --dry-run           mostra o que escreveria, sem escrever nada"));
  console.log(dim("  --yes               não pergunta (obrigatório quando stdin é um pipe)"));
  console.log(dim("  --force             escreve apesar dos avisos"));
  console.log();
  console.log(dim("  A posição no order não se muda aqui — ver `bun run qbank order`."));
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Choosing what to edit                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The questions this run will walk.
 *
 * Either named outright, or selected by what they are missing — which is the
 * point of the queue flags: `coverage` counts the gaps and this is what turns
 * a count into a list you can work through.
 */
function selection(bank: readonly BankQuestion[]): BankQuestion[] {
  const catFlag = flag("cat");
  const wanted =
    catFlag === undefined
      ? null
      : new Set(catFlag.split(",").map((c) => c.replace(/^cat/, "").trim()));
  if (wanted !== null) {
    for (const c of wanted) {
      if (!CATEGORIES.includes(c as CategoryId)) {
        die(`categoria ${c} desconhecida`, `Categorias: ${CATEGORIES.join(", ")}`);
      }
    }
  }

  if (positional.length > 0) {
    return positional.map((raw) => {
      const ref = parseRef(raw);
      if (ref === null) die(`${raw} não é uma referência`, "Formato: cat3#86");
      const found = bank.find((q) => q.ref === bankRef(ref.category, ref.id));
      if (found === undefined) die(`não existe a pergunta ${raw}`);
      return found;
    });
  }

  const filters: ((q: BankQuestion) => boolean)[] = [];
  if (has("sem-explicacao")) filters.push((q) => q.explanation === null);
  if (has("sem-fonte")) filters.push((q) => q.sources.length === 0);
  if (has("desativadas")) filters.push((q) => q.disabled !== null);
  if (filters.length === 0) {
    die(
      "nada selecionado",
      "Passe uma referência (cat3#86) ou um filtro (--sem-explicacao, --sem-fonte, --desativadas)."
    );
  }

  const queue = bank.filter(
    (q) => (wanted === null || wanted.has(q.category)) && filters.every((f) => f(q))
  );
  const limit = Number.parseInt(flag("limit") ?? "", 10);
  return Number.isNaN(limit) ? queue : queue.slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Building the edited question                                                */
/* -------------------------------------------------------------------------- */

/** The current question as a draft, so only what is edited has to be replaced. */
function draftOf(q: BankQuestion): Draft {
  return {
    category: q.category,
    id: q.id,
    question: q.question,
    answers: q.answers.map((a) => (a.correct ? { text: a.text, correct: true } : { text: a.text })),
    disabled: q.disabled,
    topic: q.topic,
    sources: q.sources,
    image: q.image,
    tutorial: q.tutorial,
    calc: q.calc,
    explanation: q.explanation,
  };
}

type Field =
  | "question"
  | "answers"
  | "topic"
  | "explanation"
  | "sources"
  | "image"
  | "disabled"
  | "done";

/**
 * A menu rather than a fixed sequence.
 *
 * Almost every edit touches one field. Walking all of them to fix a typo in
 * the stem — which is what `content:new`'s flow would do — is the interaction
 * that makes people edit the MDX by hand instead.
 */
async function askField(draft: Draft): Promise<Field> {
  // Hints are dimmed by `askChoice`, so nothing here dims them again: nested
  // codes end the dim at the first reset and the rest of the line jumps back
  // to full brightness mid-hint.
  const summary = (text: string | null | undefined, empty = "vazio") =>
    text == null || text.length === 0 ? empty : clip(text, 58);
  const label = (text: string) => text.padEnd(13);

  const chosen = await askChoice<Field>("O que alterar?", [
    { value: "question", label: label("enunciado"), hint: summary(draft.question) },
    {
      value: "answers",
      label: label("opções"),
      hint: `${draft.answers.length} opções, certa: ${
        (draft.answers.findIndex((a) => a.correct) ?? -1) + 1
      }`,
    },
    { value: "topic", label: label("matéria"), hint: summary(draft.topic, "sem matéria") },
    {
      value: "explanation",
      label: label("explicação"),
      hint:
        draft.explanation == null ? "sem explicação" : `${draft.explanation.length} caracteres`,
    },
    {
      value: "sources",
      label: label("fontes"),
      hint: draft.sources?.length ? `${draft.sources.length} referência(s)` : "sem fonte",
    },
    { value: "image", label: label("imagem"), hint: summary(draft.image, "sem imagem") },
    {
      value: "disabled",
      label: label("desativação"),
      hint: draft.disabled == null ? "publicada" : `desativada: ${clip(draft.disabled, 40)}`,
    },
    { value: "done", label: bold(label("terminar")), hint: "rever e gravar" },
  ]);
  return chosen ?? "done";
}

async function editField(field: Field, draft: Draft): Promise<Draft> {
  switch (field) {
    case "question": {
      console.log(`\n${dim("atual:")} ${draft.question}`);
      return { ...draft, question: await askText(bold("Enunciado")) };
    }
    case "answers":
      return { ...draft, answers: await askAnswers(draft.answers) };
    case "topic": {
      const topic = await askTopic(draft.topic);
      return { ...draft, topic: topic ?? draft.topic ?? null };
    }
    case "explanation": {
      console.log(`\n${bold("Explicação")} ${dim("— o corpo MDX. Pode ficar vazia.")}`);
      console.log(dim(`  ${clip(draft.question, 100)}`));
      return { ...draft, explanation: await askExplanation(draft.explanation ?? "") };
    }
    case "sources": {
      if (draft.sources !== undefined && draft.sources.length > 0) {
        console.log(`\n${dim("atuais (serão substituídas):")}`);
        for (const s of draft.sources) {
          console.log(
            dim(`  ${s.pdf} pergunta ${s.question}${s.page == null ? "" : ` p.${s.page}`}`)
          );
        }
      }
      return { ...draft, sources: await askSources() };
    }
    case "image":
      return { ...draft, image: await askImage() };
    case "disabled": {
      if (draft.disabled != null) {
        console.log(`\n${dim("desativada:")} ${draft.disabled}`);
        return (await confirm("Voltar a publicar?"))
          ? { ...draft, disabled: null }
          : draft;
      }
      const reason = await askText(
        `\n${bold("Motivo para desativar")} ${dim("(Enter para deixar publicada)")}`,
        { required: false }
      );
      return reason.length > 0 ? { ...draft, disabled: reason } : draft;
    }
    case "done":
      return draft;
  }
}

/** A whole question through $EDITOR, in the file format it is stored in. */
async function editInEditor(current: ContentQuestion): Promise<Draft> {
  const edited = await askExplanation(serializeQuestionFile(current));
  if (edited === null) die("ficheiro vazio — nada alterado");
  return draftFromSource(edited, current.id, current);
}

/**
 * Reads a question file back into a draft.
 *
 * Fields are listed rather than spread, so a key the schema does not know
 * reaches `QuestionSchema` and is refused by name instead of being carried
 * silently into the write.
 */
function draftFromSource(raw: string, id: number, current: BankQuestion | ContentQuestion): Draft {
  const { data, content } = matter(raw);
  const fields = data as Record<string, unknown>;
  const body = content.trim();
  const category = ("category" in fields
    ? String(fields.category).replace(/^cat/, "")
    : (current as BankQuestion).category ?? null) as CategoryId;

  return {
    category,
    id: typeof fields.id === "number" ? fields.id : id,
    question: fields.question as string,
    answers: fields.answers as Draft["answers"],
    disabled: (fields.disabled ?? null) as string | null,
    topic: (fields.topic ?? null) as string | null,
    sources: fields.sources as Draft["sources"],
    image: (fields.image ?? null) as string | null,
    tutorial: (fields.tutorial ?? null) as string | null,
    calc: (fields.calc ?? null) as string | null,
    explanation: body.length > 0 ? body : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Reporting                                                                   */
/* -------------------------------------------------------------------------- */

function printDiff(changes: readonly FieldChange[]): void {
  const width = Math.max(...changes.map((c) => c.label.length));
  for (const c of changes) {
    const label = c.critical === true ? red(bold(c.label.padEnd(width))) : bold(c.label.padEnd(width));
    console.log(`  ${label}  ${dim(clip(c.before, 88))}`);
    console.log(`  ${" ".repeat(width)}  ${green("→")} ${clip(c.after, 86)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* One question                                                                */
/* -------------------------------------------------------------------------- */

/** True when something was written. */
async function editOne(target: BankQuestion, bank: readonly BankQuestion[]): Promise<boolean> {
  console.log(`\n${bold(target.ref)}  ${dim(target.file)}`);
  printQuestion(target);

  let draft = draftOf(target);

  const disableReason = flag("disable");
  if (disableReason !== undefined) {
    if (!isWithheldReason(disableReason)) {
      die("--disable precisa de um motivo em texto", 'Ex.: --disable "retirada pela ANACOM"');
    }
    draft = { ...draft, disabled: disableReason };
  } else if (has("enable")) {
    draft = { ...draft, disabled: null };
  } else if (has("editor")) {
    draft = await editInEditor(target);
  } else {
    const from = flag("from");
    if (from !== undefined) {
      draft = draftFromSource(
        from === "-" ? readFileSync(0, "utf-8") : readFileSync(from, "utf-8"),
        target.id,
        target
      );
    } else if (interactive) {
      for (;;) {
        const field = await askField(draft);
        if (field === "done") break;
        draft = await editField(field, draft);
      }
    } else {
      die(
        "stdin não é um terminal e não foi passado --from, --editor, --disable nem --enable",
        'bun run content:edit cat3#86 --disable "motivo" --yes'
      );
    }
  }

  const manifest = loadManifest(target.category);
  const review = reviewDraft(draft, {
    category: target.category,
    anacomFile: manifest.anacomFile,
    bank,
    order: manifest.order,
    // The id is in `order` and the question is in `bank`; both are expected
    // for an edit, and `reviewDraft` inverts those two rules from this.
    editing: target.id,
    pdfLookup,
    imageExists,
  });

  const question = review.question;
  if (question === null) {
    printFindings(review.findings);
    die("não escrito — corrija os erros acima");
  }

  const changes = diffQuestions(target, question);
  if (changes.length === 0) {
    console.log(dim("\n  nada alterado"));
    return false;
  }

  console.log(`\n${bold("Alterações")}`);
  printDiff(changes);
  printFindings(review.findings);

  if (hasErrors(review.findings)) die("não escrito — corrija os erros acima");

  // A changed correct answer, or a question withdrawn from the site, is
  // confirmed on its own rather than folded into the warnings prompt: it is
  // the edit that changes what every reader sees, and the diff row above is
  // red for the same reason.
  //
  // It honours --yes like every other prompt. Making it unskippable would
  // break `content:edit --disable "motivo" --yes`, which is the documented
  // way to withdraw a question from a script; the safety here is that the
  // change is stated plainly before it happens, not that a human is trapped
  // into answering. Without --yes and without a terminal it still fails shut.
  const critical = changes.find((c) => c.critical === true);
  if (critical !== undefined && !force) {
    console.log(`\n${yellow("!")} ${bold(critical.label)} muda.`);
    if (!(await confirm("  Confirma?"))) {
      console.log(dim("  cancelado"));
      return false;
    }
  }

  if (review.findings.length > 0 && !force) {
    if (!(await confirm(`\n${review.findings.length} aviso(s). Continuar?`))) {
      console.log(dim("  cancelado"));
      return false;
    }
  }

  if (dryRun) {
    console.log(`\n${bold("--dry-run")} ${dim("— nada foi escrito")}`);
    console.log(`\n${dim(`${target.file}:`)}`);
    console.log(serializeQuestionFile(question).replace(/^/gm, "  ").trimEnd());
    return false;
  }

  // `order` is passed through unchanged: an edit never moves a question.
  const written = writeQuestion(target.category, question, manifest.order);
  console.log(`\n${green("✓")} ${target.ref}`);
  for (const f of written) console.log(`  ${f}`);
  return true;
}

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  if (has("help") || has("h")) usage();

  const { bank } = loadAll();
  const targets = selection(bank);

  if (targets.length === 0) {
    console.log(dim("nada a fazer — a seleção não devolveu perguntas"));
    return;
  }
  if (targets.length > 1) {
    console.log(
      `${bold(String(targets.length))} pergunta(s) selecionada(s)${
        flag("limit") === undefined ? dim("  (--limit N para menos)") : ""
      }`
    );
  }

  let written = 0;
  for (const [i, target] of targets.entries()) {
    if (targets.length > 1) console.log(dim(`\n${"─".repeat(72)}\n${i + 1} de ${targets.length}`));

    // Reloaded per question so each edit is reviewed against what the previous
    // one wrote, not against the bank as it was when the run started.
    const current = i === 0 ? bank : loadAll().bank;
    const fresh = current.find((q) => q.ref === target.ref) ?? target;
    if (await editOne(fresh, current)) written++;

    if (targets.length > 1 && i < targets.length - 1 && interactive && !assumeYes) {
      if (!(await askConfirm("\nContinuar para a próxima?", { fallback: true }))) break;
    }
  }

  if (targets.length > 1) {
    console.log(`\n${green("✓")} ${written} de ${targets.length} alterada(s)`);
  }
  if (written > 0) {
    console.log(dim("\n  bun run content:check    # confirma que os artefactos batem certo"));
  }
  closePrompts();
}

main()
  .then(() => closePrompts())
  .catch((error: unknown) => {
    die(error instanceof Error ? error.message : String(error));
  });
