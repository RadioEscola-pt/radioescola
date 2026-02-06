import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

const STUDY_DIR = path.join(process.cwd(), 'app', 'study');

type Item = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
};

function humanize(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

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
    const data = (fm.data || {}) as Record<string, unknown>;
    const title = (data.title as string) ?? humanize(slug);
    const description = data.description as string | undefined;
    const categories = data.categories as (string[] | number[] | undefined);
    const cats = Array.isArray(categories)
      ? categories.map((c) => String(c))
      : ['3', '2', '1'];
    return { slug, title, description, categories: cats };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

export async function GET() {
  const items = readItems();
  return NextResponse.json(items);
}
