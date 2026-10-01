import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { StudyItem } from '@/lib/config/study-guides';

const STUDY_DIR = path.join(process.cwd(), 'app', 'aprender');

function humanize(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * The guide index, read from the MDX frontmatter itself: there is no manifest,
 * so a new `app/aprender/<slug>/page.mdx` shows up here (and therefore in the
 * index, the guide header and the prev/next links) with nothing else to edit.
 *
 * Both callers read off disk at request time with a path built from
 * `process.cwd()`, which file tracing cannot follow: `outputFileTracingIncludes`
 * in `next.config.js` has an entry per consuming route.
 */
export function readStudyItems(): StudyItem[] {
  if (!fs.existsSync(STUDY_DIR)) return [];

  const slugs = fs
    .readdirSync(STUDY_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(STUDY_DIR, e.name, 'page.mdx')))
    .map((e) => e.name);

  return slugs
    .map((slug) => {
      const raw = fs.readFileSync(path.join(STUDY_DIR, slug, 'page.mdx'), 'utf8');
      const fm = matter(raw);
      const data = (fm.data || {}) as Record<string, unknown>;
      const categories = data.categories as string[] | number[] | undefined;
      // ~200 words per minute, the same figure the index has always shown.
      const words = fm.content.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        title: (data.title as string) ?? humanize(slug),
        description: data.description as string | undefined,
        categories: Array.isArray(categories) ? categories.map(String) : ['3', '2', '1'],
        readTime: Math.max(1, Math.round(words / 200)),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
