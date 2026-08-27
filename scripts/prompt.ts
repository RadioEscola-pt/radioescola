/**
 * Terminal prompting, shared by the scripts that ask before they act.
 *
 * Extracted from `content:new` when `banco` needed the same numbered menus.
 * Nothing here knows about questions or categories — it is the terminal half
 * of those scripts, kept in one place so a menu looks the same wherever it is
 * shown and the readline interface is only ever opened once per process.
 */
import readline from "node:readline";

/* -------------------------------------------------------------------------- */
/* Colour                                                                      */
/* -------------------------------------------------------------------------- */

const ESC = "\u001b";
const colour = process.stdout.isTTY === true;

export const paint = (code: string, text: string) =>
  colour ? `${ESC}[${code}m${text}${ESC}[0m` : text;
export const bold = (t: string) => paint("1", t);
export const dim = (t: string) => paint("2", t);
export const red = (t: string) => paint("31", t);
export const green = (t: string) => paint("32", t);
export const yellow = (t: string) => paint("33", t);
export const cyan = (t: string) => paint("36", t);

/* -------------------------------------------------------------------------- */
/* Prompting                                                                   */
/* -------------------------------------------------------------------------- */

/** False when stdin is a pipe, which is what makes `--yes` obligatory there. */
export const interactive = process.stdin.isTTY === true;

let rl: readline.Interface | null = null;

function prompts(): readline.Interface {
  if (rl === null) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}

/**
 * Closed rather than paused, and re-opened on the next question.
 *
 * A subprocess that takes over the terminal — $EDITOR, or another script run
 * from a menu — must not share stdin with a live readline interface: two
 * readers on one stdin fight over the keystrokes.
 */
export function closePrompts(): void {
  rl?.close();
  rl = null;
}

export const ask = (question: string): Promise<string> =>
  new Promise((resolve) => prompts().question(question, resolve));

export async function askText(label: string, { required = true } = {}): Promise<string> {
  for (;;) {
    const answer = (await ask(`${label} ${dim("›")} `)).trim();
    if (answer.length > 0 || !required) return answer;
    console.log(dim("  (obrigatório)"));
  }
}

/**
 * A numbered list rather than an arrow-key menu: raw mode would have to be
 * handed back and forth with $EDITOR, and a number is one keystroke either way.
 */
export async function askChoice<T>(
  label: string,
  options: readonly { value: T; label: string; hint?: string }[],
  { allowNone = false, noneLabel = "Enter para nenhum" } = {}
): Promise<T | null> {
  console.log(`\n${bold(label)}`);
  options.forEach((o, i) => {
    console.log(`  ${String(i + 1).padStart(2)}  ${o.label}${o.hint ? `  ${dim(o.hint)}` : ""}`);
  });
  if (allowNone) console.log(dim(`   —  ${noneLabel}`));

  for (;;) {
    const raw = (await ask(`${dim("nº ›")} `)).trim();
    if (raw.length === 0 && allowNone) return null;
    const chosen = options[Number.parseInt(raw, 10) - 1];
    if (chosen) return chosen.value;
    console.log(dim(`  1-${options.length}${allowNone ? " ou Enter" : ""}`));
  }
}

export async function confirm(
  question: string,
  { fallback = false, assumeYes = false } = {}
): Promise<boolean> {
  if (assumeYes) return true;
  if (!interactive) return fallback;
  const answer = (await ask(`${question} ${dim("[s/N]")} `)).trim().toLowerCase();
  return answer === "s" || answer === "sim" || answer === "y" || answer === "yes";
}
