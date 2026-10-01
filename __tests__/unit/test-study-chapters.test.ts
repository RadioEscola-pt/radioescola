import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STUDY_CHAPTERS, chapterOf } from '@/lib/config/study-guides';
import pt from '@/messages/pt.json';
import en from '@/messages/en.json';

const STUDY_DIR = path.join(process.cwd(), 'app', 'aprender');

/** Os guias que existem em disco, que é a única fonte de verdade sobre eles. */
function guideSlugs(): string[] {
  return fs
    .readdirSync(STUDY_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(STUDY_DIR, e.name, 'page.mdx')))
    .map((e) => e.name);
}

/**
 * O agrupamento do índice é escrito à mão em `STUDY_CHAPTERS`, porque metade
 * dos guias não numera as secções e não há de onde o deduzir. Escrito à mão
 * significa que envelhece: um guia novo não aparece em capítulo nenhum, e um
 * guia renomeado deixa um slug morto no mapa. É isso que estes testes apanham.
 */
describe('mapa de capítulos dos guias', () => {
  it('cobre todos os guias em disco', () => {
    const mapped = new Set(STUDY_CHAPTERS.flatMap((c) => c.slugs));
    const missing = guideSlugs().filter((slug) => !mapped.has(slug));
    expect(missing, `guias sem capítulo: ${missing.join(', ')}`).toEqual([]);
  });

  it('não refere guias que não existem', () => {
    const existing = new Set(guideSlugs());
    const dead = STUDY_CHAPTERS.flatMap((c) => c.slugs).filter((s) => !existing.has(s));
    expect(dead, `slugs mortos no mapa: ${dead.join(', ')}`).toEqual([]);
  });

  it('põe cada guia num só capítulo', () => {
    const seen = new Map<string, string>();
    for (const chapter of STUDY_CHAPTERS) {
      for (const slug of chapter.slugs) {
        expect(seen.has(slug), `${slug} está em ${seen.get(slug)} e em ${chapter.id}`).toBe(false);
        seen.set(slug, chapter.id);
      }
    }
  });

  it('tem ids únicos e um título em cada idioma', () => {
    const ids = STUDY_CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      expect((pt.Study as Record<string, any>).chapters?.[id], `pt: ${id}`).toBeTruthy();
      expect((en.Study as Record<string, any>).chapters?.[id], `en: ${id}`).toBeTruthy();
    }
  });

  it('resolve o capítulo de um guia conhecido', () => {
    expect(chapterOf('leis-de-kirchhoff')?.number).toBe('3');
    expect(chapterOf('seguranca')?.number).toBe('10');
    expect(chapterOf('nao-existe')).toBeUndefined();
  });
});
