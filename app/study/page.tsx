import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import matter from 'gray-matter';

const STUDY_DIR = path.join(process.cwd(), 'app', 'study');

type Item = {
  slug: string;
  title: string;
  description?: string;
  categories: string[]; // ['3','2','1']
};

function readItems(): Item[] {
  if (!fs.existsSync(STUDY_DIR)) return [];
  const entries = fs.readdirSync(STUDY_DIR, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(STUDY_DIR, e.name, 'page.mdx')))
    .map((e) => e.name);

  return folders.map((slug) => {
    const filePath = path.join(STUDY_DIR, slug, 'page.mdx');
    const raw = fs.readFileSync(filePath, 'utf8');
    const fm = matter(raw);
    const data = (fm.data || {}) as any;
    const title = (data.title as string) ?? humanize(slug);
    const description = data.description as string | undefined;
    let categories = data.categories as (string[] | number[] | undefined);
    const cats = Array.isArray(categories)
      ? categories.map((c) => String(c))
      : ['3', '2', '1'];
    return { slug, title, description, categories: cats };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

function humanize(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function StudyIndexPage({ searchParams }: { searchParams?: { cat?: string } }) {
  const items = readItems();
  const active = searchParams?.cat ?? 'all';
  const filtered = active === 'all' ? items : items.filter(i => i.categories.includes(active));

  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: '3', label: 'Category 3' },
    { key: '2', label: 'Category 2' },
    { key: '1', label: 'Category 1' },
  ];

  return (
    <main className="p-8">
      <section className="max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
        <p className="mt-2 text-gray-700">Filter by your target ham category.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const selected = active === t.key;
            const href = t.key === 'all' ? '/study' : `/study?cat=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={
                  'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm ' +
                  (selected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50')
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <li key={i.slug} className="rounded-xl border bg-white p-5 hover:shadow transition-shadow">
              <Link href={`/study/${i.slug}`} className="block">
                <h2 className="font-semibold text-gray-900">{i.title}</h2>
                {i.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{i.description}</p>}
                <div className="mt-3 flex gap-1">
                  {i.categories.map((c) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">CAT {c}</span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-gray-600">No materials match this category yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
