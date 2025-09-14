
import { Data, Category, Question } from './types';

export async function loadData(): Promise<Data> {
  const cats = ['1', '2', '3'];
  const categoriesEntries = await Promise.all(
    cats.map(async (cat): Promise<[string, Category]> => {
      const res = await fetch(`/data/cat${cat}.json`);
      if (!res.ok) {
        return [cat, { id: cat, name: `Category ${cat}`, questions: [] }];
      }
      const raw = await res.json();
      const questions: Question[] = (raw.questions || []).map((q: any) => ({
        id: q.uniqueID,
        question: q.question,
        options: q.answers,
        correctIndex: (q.correctIndex ?? 1) - 1,
        img: q.img ? `/images/cat${cat}/${q.img}` : undefined,
      }));
      return [cat, { id: cat, name: `Category ${cat}`, questions }];
    })
  );
  const categories = Object.fromEntries(categoriesEntries) as Record<string, Category>;
  return { categories };
}
