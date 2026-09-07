/**
 * The order questions appear in on /browse/[category].
 *
 * The bank's own order is editorial — questions are grouped by subject, which
 * is what makes browsing a syllabus rather than a list — but it also means the
 * page reads the same way every time, and a candidate ends up recognising a
 * question by where it sits instead of by what it asks. Random order is the
 * opt-in escape from that.
 *
 * The deal is a *rank per question id*, not a shuffled array, because the page
 * filters before it orders: searching and picking a topic both narrow the set,
 * and a fresh shuffle of whatever survived would reorder the page under the
 * reader's cursor on every keystroke. Ranking once and sorting by it means the
 * relative order of the questions that remain never changes.
 *
 * It is dealt once per visit — see the call site in the page — so a reload is
 * the reshuffle, and toggling the order off to find something and on again
 * returns to the page you left.
 */

/** Question id -> its position in the current deal. */
export type QuestionRanks = ReadonlyMap<number, number>;

/** The query parameter that carries the choice, so it survives a shared link. */
export const ORDER_PARAM = 'order';
const RANDOM = 'random';

export function isRandomOrder(param: string | null | undefined): boolean {
  return param === RANDOM;
}

/**
 * A rank for every id, uniformly at random. The rng is injectable so the
 * ordering can be asserted rather than sampled.
 */
export function dealRanks(
  ids: readonly number[],
  rng: () => number = Math.random
): QuestionRanks {
  const shuffled = [...ids];

  // Fisher-Yates, so every ordering is equally likely.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = shuffled[i];
    const b = shuffled[j];
    if (a === undefined || b === undefined) continue;
    shuffled[i] = b;
    shuffled[j] = a;
  }

  return new Map(shuffled.map((id, rank) => [id, rank]));
}

/**
 * The questions in the dealt order, or untouched when there is no deal.
 *
 * An id the deal does not know about keeps its place in the input: a category
 * still loading its own deal renders in bank order for that one frame, which is
 * the order it would have had anyway — never a scrambled half of one deal and
 * half of another.
 */
export function orderQuestions<Q extends { id: number }>(
  questions: readonly Q[],
  ranks: QuestionRanks | null
): Q[] {
  if (!ranks) return [...questions];
  const rankOf = (q: Q) => ranks.get(q.id) ?? Number.MAX_SAFE_INTEGER;
  return [...questions].sort((a, b) => rankOf(a) - rankOf(b));
}

/**
 * The URL for a browse view. Both the topic and the order live in the query
 * string, so either one changing has to carry the other or a toggle silently
 * clears a filter.
 */
export function browseHref(
  categoryId: string,
  { topic, random }: { topic?: string | null; random?: boolean }
): string {
  const query = new URLSearchParams();
  if (topic) query.set('topic', topic);
  if (random) query.set(ORDER_PARAM, RANDOM);
  const suffix = query.toString();
  return suffix ? `/browse/${categoryId}?${suffix}` : `/browse/${categoryId}`;
}
