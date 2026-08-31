/**
 * Shuffling the answer options of an exam question.
 *
 * The official papers put the correct answer in a visible pattern — over the
 * cat3 bank it is not evenly spread across the four positions — so a candidate
 * who practises on the bank can learn the position instead of the answer.
 * Shuffling removes that crutch.
 *
 * What is *recorded* stays in the bank's own order. The shuffle is a property
 * of one sitting, not of the answer the candidate gave: translating back on the
 * way out means progress, statistics and the dashboard's replay links keep
 * working with no idea this feature exists. The alternative — storing shuffled
 * indices — would have made every replay link show the answers against the
 * wrong options, silently, which is the exact failure `lib/exam/replay.ts`
 * exists to prevent.
 */

/** Shuffled position -> index the option had in the bank. */
export type OptionPermutation = number[];

type Shufflable = { id: number; options: string[]; correctIndex: number };

export type ShuffleResult<Q> = {
  questions: Q[];
  /** Keyed by question id; absent for a question left in its original order. */
  permutations: Record<number, OptionPermutation>;
};

/**
 * A new question with its options reordered, plus the permutation needed to
 * read the answer back. The input is not mutated — the loaded bank is shared
 * between every consumer on the page.
 */
export function shuffleQuestionOptions<Q extends Shufflable>(
  question: Q,
  rng: () => number = Math.random
): { question: Q; permutation: OptionPermutation } {
  const permutation = question.options.map((_, i) => i);

  // Fisher-Yates over the positions, so every ordering is equally likely.
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = permutation[i];
    const b = permutation[j];
    if (a === undefined || b === undefined) continue;
    permutation[i] = b;
    permutation[j] = a;
  }

  const options = permutation.map((original) => question.options[original] ?? '');
  const correctIndex = permutation.indexOf(question.correctIndex);

  return {
    question: { ...question, options, correctIndex },
    permutation,
  };
}

export function shuffleAllOptions<Q extends Shufflable>(
  questions: readonly Q[],
  rng: () => number = Math.random
): ShuffleResult<Q> {
  const out: Q[] = [];
  const permutations: Record<number, OptionPermutation> = {};

  for (const question of questions) {
    const shuffled = shuffleQuestionOptions(question, rng);
    out.push(shuffled.question);
    permutations[question.id] = shuffled.permutation;
  }

  return { questions: out, permutations };
}

/**
 * Answers given against shuffled options, expressed in the bank's own order.
 *
 * A question with no permutation is passed through untouched, which is what
 * makes this safe to call unconditionally — an unshuffled exam maps to itself.
 */
export function toCanonicalAnswers(
  answers: Readonly<Record<number, number>>,
  permutations: Readonly<Record<number, OptionPermutation>>
): Record<number, number> {
  const out: Record<number, number> = {};

  for (const [key, chosen] of Object.entries(answers)) {
    const id = Number(key);
    const permutation = permutations[id];
    const original = permutation?.[chosen];
    out[id] = original ?? chosen;
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* The candidate's preference                                                  */
/* -------------------------------------------------------------------------- */

export const SHUFFLE_OPTIONS_KEY = 'hamradio:exam-shuffle-options';

/** Off unless the candidate turned it on; storage being unreadable means off. */
export function readShuffleOptionsPreference(): boolean {
  try {
    return window.localStorage.getItem(SHUFFLE_OPTIONS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeShuffleOptionsPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(SHUFFLE_OPTIONS_KEY, enabled ? 'true' : 'false');
  } catch {
    // A private window with storage blocked still gets the exam it asked for;
    // it just will not be remembered.
  }
}
