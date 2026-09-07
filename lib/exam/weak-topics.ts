/**
 * Which subject areas an exam attempt exposed as weak.
 *
 * The score says whether you passed; it does not say what to do next. The bank
 * already carries a topic on every question, so the attempt itself can answer
 * "what should I study?" without any extra bookkeeping.
 */

export type TopicOutcome = {
  slug: string;
  /** Questions of this topic in the attempt. */
  total: number;
  /** Wrong plus unanswered — both mean the candidate could not produce it. */
  missed: number;
  /** correct / total, 0..1. */
  accuracy: number;
};

type Scored = {
  materia?: string | null;
  status: 'correct' | 'incorrect' | 'unanswered';
};

/**
 * Topics the attempt got wrong, worst first.
 *
 * "Worst" is the count of misses before the rate: four wrong out of twelve is
 * a bigger hole in a 40-question exam than one wrong out of one, even though
 * the rate says otherwise. The rate breaks ties, so a topic that was mostly
 * missed outranks one that was mostly right.
 *
 * Topics answered perfectly are absent: this is a list of things to do, and a
 * to-do list with completed items is just a scoreboard again.
 */
export function weakTopics(answers: readonly Scored[], limit = 4): TopicOutcome[] {
  const byTopic = new Map<string, { total: number; missed: number }>();

  for (const answer of answers) {
    const slug = answer.materia;
    // A question with no topic cannot be turned into advice, and guessing one
    // would send the candidate to the wrong chapter.
    if (!slug) continue;
    const row = byTopic.get(slug) ?? { total: 0, missed: 0 };
    row.total += 1;
    if (answer.status !== 'correct') row.missed += 1;
    byTopic.set(slug, row);
  }

  return [...byTopic.entries()]
    .map(([slug, { total, missed }]) => ({
      slug,
      total,
      missed,
      accuracy: total === 0 ? 0 : (total - missed) / total,
    }))
    .filter((topic) => topic.missed > 0)
    .sort((a, b) => b.missed - a.missed || a.accuracy - b.accuracy || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}
