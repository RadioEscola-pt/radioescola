import { Data, Category, Question } from './types';
import { CATEGORIES } from './config';

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
    CATEGORIES.map(async (cat): Promise<[string, Category]> => {
      const res = await fetch(`/data/cat${cat}.json`);
      if (!res.ok) {
        return [cat, { id: cat, name: `Category ${cat}`, questions: [] }];
      }
      const raw = await res.json() as { questions?: unknown[] };
      const questions: Question[] = (raw.questions ?? []).map((q: unknown) => {
        const qObj = q as Record<string, unknown>;
        const rawOptions = Array.isArray(qObj.answers) ? qObj.answers : [];
        const options = rawOptions.map((opt: unknown) => (typeof opt === 'string' ? opt : String(opt ?? '')));
        const correctIndexRaw = (typeof qObj.correctIndex === 'number' ? qObj.correctIndex : 1) - 1;
        const boundedCorrectIndex = options.length > 0
          ? Math.max(0, Math.min(options.length - 1, correctIndexRaw))
          : 0;
        const imgPath = typeof qObj.img === 'string' && qObj.img.trim().length > 0
          ? `/images/cat${cat}/${qObj.img}`
          : null;
        return {
          id: typeof qObj.uniqueID === 'number' ? qObj.uniqueID : 0,
          question: typeof qObj.question === 'string' ? qObj.question : '',
          options,
          correctIndex: boundedCorrectIndex,
          img: imgPath,
          notes: normalizeNotes(qObj.notes),
          fonte: normalizeFonte(qObj.fonte),
          tutorial: typeof qObj.tutorial === 'string' && qObj.tutorial.trim() ? qObj.tutorial.trim() : null,
          materia: typeof qObj.materia === 'string' && qObj.materia.trim() ? qObj.materia.trim() : null,
          calc: typeof qObj.calc === 'string' && qObj.calc.trim() ? qObj.calc.trim() : null,
        } satisfies Question;
      });
      return [cat, { id: cat, name: `Category ${cat}`, questions }];
    })
  );
  const categories = Object.fromEntries(categoriesEntries) as Record<string, Category>;
  return { categories };
}
