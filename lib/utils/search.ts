/**
 * Text search over the question bank.
 *
 * Matching folds away diacritics and case. That is not a nicety here: the bank
 * mixes pre-1990 and current orthography, so a reader typing "eletrico" has to
 * find "eléctrico", and one typing "propagacao" has to find "propagação".
 */

/**
 * Folds a string for comparison, and records where each folded character came
 * from in the original.
 *
 * The map is what makes highlighting possible. Stripping combining marks
 * changes a string's length, so a match found in the folded text cannot be
 * sliced out of the original by the same offsets — the map translates back.
 */
export function foldWithMap(input: string): { folded: string; map: number[] } {
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === undefined) continue;
    const stripped = char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    for (let j = 0; j < stripped.length; j++) {
      folded += stripped[j];
      map.push(i);
    }
  }
  return { folded, map };
}

/** Folds a string for comparison, discarding the position map. */
export function fold(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Range of a match in the *original* string, or null when there is none. */
export function findMatch(
  haystack: string,
  needle: string
): { start: number; end: number } | null {
  const term = fold(needle).trim();
  if (term.length === 0) return null;
  const { folded, map } = foldWithMap(haystack);
  const at = folded.indexOf(term);
  if (at === -1) return null;
  const start = map[at];
  const last = map[at + term.length - 1];
  if (start === undefined || last === undefined) return null;
  return { start, end: last + 1 };
}

/**
 * Whether a question matches a search term.
 *
 * Answers count, not just the stem. Searching cat 3 for "antena" finds 13
 * questions and eight of them carry the word only in an option — stem-only
 * matching would lose most of the result set.
 */
export function questionMatches(
  question: { question: string; options: string[] },
  term: string
): boolean {
  const needle = fold(term).trim();
  if (needle.length === 0) return true;
  if (fold(question.question).includes(needle)) return true;
  return question.options.some((option) => fold(option).includes(needle));
}
