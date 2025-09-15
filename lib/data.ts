import { Data, Category, Question } from './types';

const cats = ['1', '2', '3'];

function normalizeNotes(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed
    .replace(/src=(['"])images\//gi, 'src=$1/images/')
    .replace(/href=(['"])exams\//gi, 'href=$1/exams/');
}

function normalizeFonte(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const filtered = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return filtered.length ? filtered : null;
}

export async function loadData(): Promise<Data> {
  const categoriesEntries = await Promise.all(
    cats.map(async (cat): Promise<[string, Category]> => {
      const res = await fetch(`/data/cat${cat}.json`);
      if (!res.ok) {
        return [cat, { id: cat, name: `Category ${cat}`, questions: [] }];
      }
      const raw = await res.json();
      const questions: Question[] = (raw.questions || []).map((q: any) => {
        const rawOptions = Array.isArray(q.answers) ? q.answers : [];
        const options = rawOptions.map((opt: any) => (typeof opt === 'string' ? opt : String(opt ?? '')));
        const correctIndexRaw = (q.correctIndex ?? 1) - 1;
        const boundedCorrectIndex = options.length > 0
          ? Math.max(0, Math.min(options.length - 1, correctIndexRaw))
          : 0;
        const imgPath = typeof q.img === 'string' && q.img.trim().length > 0
          ? `/images/cat${cat}/${q.img}`
          : null;
        return {
          id: q.uniqueID,
          question: q.question,
          options,
          correctIndex: boundedCorrectIndex,
          img: imgPath,
          notes: normalizeNotes(q.notes),
          fonte: normalizeFonte(q.fonte),
          tutorial: typeof q.tutorial === 'string' && q.tutorial.trim() ? q.tutorial.trim() : null,
          materia: typeof q.materia === 'string' && q.materia.trim() ? q.materia.trim() : null,
          calc: typeof q.calc === 'string' && q.calc.trim() ? q.calc.trim() : null,
        } satisfies Question;
      });
      return [cat, { id: cat, name: `Category ${cat}`, questions }];
    })
  );
  const categories = Object.fromEntries(categoriesEntries) as Record<string, Category>;
  return { categories };
}
