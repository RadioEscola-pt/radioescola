import { buildCategory, type RawQuestion } from './data';
import type { Question } from './types';
import { CATEGORIES, type CategoryId } from './config/categories';

/**
 * Look one question up by reference, for previews.
 *
 * `loadData()` fetches all three categories in parallel because the pages that
 * call it need the whole bank. A preview needs one question, so it fetches one
 * category and keeps it: pointing at six references in a row must not mean six
 * requests, and pointing at a cat2 chip must not drag cat1 and cat3 along.
 *
 * The in-flight promise is cached alongside the result, so a burst of previews
 * over the same category shares a single request rather than racing.
 */
const cache = new Map<CategoryId, Promise<Map<number, Question>>>();

/** `cat2#92` → `{ cat: '2', id: 92 }`, or null when it does not parse. */
export function parseQuestionRef(ref: string): { cat: CategoryId; id: number } | null {
  const m = /^cat([321])#(\d+)$/.exec(ref.trim());
  if (!m || !m[1] || !m[2]) return null;
  return { cat: m[1] as CategoryId, id: Number(m[2]) };
}

function loadCategory(cat: CategoryId): Promise<Map<number, Question>> {
  const cached = cache.get(cat);
  if (cached) return cached;

  const pending = fetch(`/data/cat${cat}.json`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`cat${cat}: ${res.status}`);
      const raw = (await res.json()) as { questions?: RawQuestion[] };
      return new Map(buildCategory(cat, raw).questions.map((q) => [q.id, q]));
    })
    .catch((err) => {
      // A failed fetch must not poison the cache — the next hover should retry.
      cache.delete(cat);
      throw err;
    });

  cache.set(cat, pending);
  return pending;
}

/**
 * Resolves to the question, or null when the reference is malformed or names a
 * question the bank no longer ships (one withheld with `disabled`, say).
 * Rejects only when the category itself could not be fetched.
 */
export async function lookupQuestion(ref: string): Promise<Question | null> {
  const parsed = parseQuestionRef(ref);
  if (!parsed) return null;
  const byId = await loadCategory(parsed.cat);
  return byId.get(parsed.id) ?? null;
}

/** Category of a reference without fetching anything — for the badge on a skeleton. */
export function refCategory(ref: string): CategoryId | null {
  return parseQuestionRef(ref)?.cat ?? null;
}

export { CATEGORIES };
