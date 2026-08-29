/**
 * Exam replay URL format
 *
 * A finished exam is reconstructed from three query params rather than from
 * server state: `q` the question ids in order, `a` the answers, `t` the time
 * left. Nothing is stored anywhere, so the link survives without a database.
 *
 * `a` is positional against `q` — one character per id, base36 for the chosen
 * option index and `x` for unanswered. That pairing is the whole format, and
 * it used to be written in the dashboard and read in the exam page with no
 * shared definition between them. They drifted: the reader walked `a` against
 * the questions it had managed to *resolve*, so a single id it could not find
 * — a question withdrawn since the link was made — shifted every later answer
 * onto the wrong question and presented the result as the user's own.
 *
 * Hence one module: the two directions are one format and have to move
 * together.
 */

/** Unanswered marker. Base36 digits never collide with it. */
const UNANSWERED = "x";

/** Encodes `a` from the exam's question ids and the answers keyed by id. */
export function encodeReplayAnswers(
  questionIds: readonly number[],
  answers: Readonly<Record<number, number>>
): string {
  return questionIds
    .map((id) => {
      const answer = answers[id];
      return answer === undefined ? UNANSWERED : answer.toString(36);
    })
    .join("");
}

/** Parses `q` into ids, dropping anything that is not a number. */
export function decodeReplayIds(q: string): number[] {
  return q
    .split("-")
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
}

/**
 * Decodes `a` into answers keyed by question id.
 *
 * Indexed against `ids` — every id in the URL, including ones no longer in the
 * bank — because that is what the encoder wrote. `isAvailable` then drops the
 * answers belonging to questions that cannot be shown, rather than letting
 * them slide onto their neighbours.
 */
export function decodeReplayAnswers(
  ids: readonly number[],
  a: string | null,
  isAvailable: (id: number) => boolean
): Record<number, number> {
  const answers: Record<number, number> = {};
  if (a === null) return answers;

  const chars = [...a];
  for (let i = 0; i < Math.min(chars.length, ids.length); i++) {
    const ch = chars[i];
    const id = ids[i];
    if (ch === undefined || ch === UNANSWERED || id === undefined) continue;
    if (!isAvailable(id)) continue;
    const index = Number.parseInt(ch, 36);
    if (!Number.isNaN(index)) answers[id] = index;
  }
  return answers;
}
