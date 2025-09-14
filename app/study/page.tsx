import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';

const STUDY_DIR = path.join(process.cwd(), 'app', 'study');

function getSlugs(): string[] {
  if (!fs.existsSync(STUDY_DIR)) return [];
  const entries = fs.readdirSync(STUDY_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(STUDY_DIR, e.name, 'page.mdx')))
    .map((e) => e.name)
    .sort();
}

function humanize(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function StudyIndexPage() {
  const slugs = getSlugs();
  return (
    <main className="p-8">
      <section className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
        <p className="mt-2 text-gray-700">Curated topics you can read offline, authored in MDX.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {slugs.map((slug) => (
            <li key={slug} className="rounded-xl border bg-white p-4 hover:shadow transition-shadow">
              <Link href={`/study/${slug}`} className="block">
                <h2 className="font-semibold text-gray-900">{humanize(slug)}</h2>
                <p className="text-sm text-gray-600">Open notes</p>
              </Link>
            </li>
          ))}
          {slugs.length === 0 && (
            <li className="text-gray-600">No study materials yet. Add an MDX file under <code>app/study/&lt;topic&gt;/page.mdx</code>.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

