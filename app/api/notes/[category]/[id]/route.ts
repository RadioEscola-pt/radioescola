import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const NOTES_ROOT = path.join(process.cwd(), 'content', 'notes');
const VALID_CATEGORIES = new Set(['1', '2', '3']);

type CacheEntry = {
  mtimeMs: number;
  html: string;
};

const cache = new Map<string, CacheEntry>();

function buildCacheKey(category: string, id: string) {
  return `${category}:${id}`;
}

async function compileMdxToHtml(filePath: string) {
  const source = await fs.readFile(filePath, 'utf8');
  const compiled = await compile(source, {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    outputFormat: 'function-body',
  });
  const { default: Content } = await run(compiled, runtime);
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = renderToStaticMarkup(React.createElement(Content));
  return html;
}

export async function GET(
  _req: Request,
  { params }: { params: { category: string; id: string } }
) {
  const { category, id } = params;
  if (!VALID_CATEGORIES.has(category)) {
    return new Response(JSON.stringify({ error: 'Invalid category' }), { status: 400 });
  }
  if (!/^\d+$/.test(id)) {
    return new Response(JSON.stringify({ error: 'Invalid identifier' }), { status: 400 });
  }

  const filePath = path.join(NOTES_ROOT, `cat${category}`, `${id}.mdx`);

  try {
    const stat = await fs.stat(filePath);
    const cacheKey = buildCacheKey(category, id);
    const cached = cache.get(cacheKey);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return Response.json({ html: cached.html });
    }

    const html = await compileMdxToHtml(filePath);
    cache.set(cacheKey, { html, mtimeMs: stat.mtimeMs });
    return Response.json({ html });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Notes not found' }), { status: 404 });
    }
    console.error('Failed to load MDX notes', err);
    return new Response(JSON.stringify({ error: 'Failed to load notes' }), { status: 500 });
  }
}
