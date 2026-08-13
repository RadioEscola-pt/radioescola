import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CATEGORIES } from '@/lib/config';
import { buildCategory } from '@/lib/data';
import type { Category, Data } from '@/lib/types';

/**
 * Serves the full question bank.
 *
 * Reads the compiled artifacts from disk rather than calling `loadData()`:
 * that helper fetches a relative URL, which cannot resolve server-side, so
 * this route used to throw on every request. The per-question mapping is
 * shared with the client via `buildCategory`.
 */
export async function GET() {
  const dataDir = path.join(process.cwd(), 'public', 'data');

  const entries = await Promise.all(
    CATEGORIES.map(async (cat): Promise<[string, Category]> => {
      const raw = JSON.parse(
        await readFile(path.join(dataDir, `cat${cat}.json`), 'utf8')
      );
      return [cat, buildCategory(cat, raw)];
    })
  );

  const data: Data = {
    categories: Object.fromEntries(entries) as Data['categories'],
  };
  return NextResponse.json(data);
}
