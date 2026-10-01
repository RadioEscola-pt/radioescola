import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUIDE_SECTIONS, sectionNeededFor } from '@/lib/config/guide-sections';
import { CATEGORIES } from '@/lib/config/categories';

const STUDY_DIR = path.join(process.cwd(), 'app', 'aprender');

function guideSlugs(): string[] {
  return fs
    .readdirSync(STUDY_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(STUDY_DIR, e.name, 'page.mdx')))
    .map((e) => e.name);
}

function headingsOf(slug: string): string[] {
  const raw = fs.readFileSync(path.join(STUDY_DIR, slug, 'page.mdx'), 'utf8');
  return [...raw.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
}

/**
 * A categoria de cada secção foi apurada à mão contra o Anexo 1 e o banco, e
 * está guardada por ordem, não por chave: casa-se com a página pela posição do
 * `##`. Isso é barato de ler e frágil de manter, e é essa fragilidade que estes
 * testes vigiam. Editar o título de uma secção, acrescentar uma, ou trocar a
 * ordem, faz falhar aqui em vez de calar uma secção errada ao leitor.
 */
describe('categoria mínima por secção', () => {
  it('cobre todos os guias', () => {
    const missing = guideSlugs().filter((slug) => !(slug in GUIDE_SECTIONS));
    expect(missing, `guias sem secções declaradas: ${missing.join(', ')}`).toEqual([]);
  });

  it('não declara guias que não existem', () => {
    const existing = new Set(guideSlugs());
    const dead = Object.keys(GUIDE_SECTIONS).filter((slug) => !existing.has(slug));
    expect(dead, `guias mortos: ${dead.join(', ')}`).toEqual([]);
  });

  it('tem os mesmos títulos, pela mesma ordem, que os ficheiros', () => {
    for (const slug of guideSlugs()) {
      const declared = (GUIDE_SECTIONS[slug] ?? []).map((s) => s.heading);
      expect(declared, `${slug}`).toEqual(headingsOf(slug));
    }
  });

  it('só usa categorias que existem', () => {
    const valid = new Set<string>(CATEGORIES);
    for (const [slug, sections] of Object.entries(GUIDE_SECTIONS)) {
      for (const section of sections) {
        if (section.min !== null) {
          expect(valid.has(section.min), `${slug}: ${section.heading}`).toBe(true);
        }
      }
    }
  });

  it('nunca esconde uma secção de quem a precisa', () => {
    // Cumulativo para cima: o que a categoria 3 precisa, a 2 e a 1 também.
    expect(sectionNeededFor('3', '3')).toBe(true);
    expect(sectionNeededFor('3', '1')).toBe(true);
    expect(sectionNeededFor('1', '3')).toBe(false);
    expect(sectionNeededFor('2', '3')).toBe(false);
    expect(sectionNeededFor('2', '1')).toBe(true);
    // Sem matéria é sempre visível.
    expect(sectionNeededFor(null, '3')).toBe(true);
  });

  it('não contradiz a frontmatter: a secção mais baixa cabe nas categorias do guia', () => {
    const problems: string[] = [];
    for (const slug of guideSlugs()) {
      const raw = fs.readFileSync(path.join(STUDY_DIR, slug, 'page.mdx'), 'utf8');
      const declared = /categories:\s*\[(.*?)\]/.exec(raw)?.[1];
      if (!declared) continue;
      const cats = new Set(declared.split(',').map((c) => c.trim().replace(/['"]/g, '')));
      for (const section of GUIDE_SECTIONS[slug] ?? []) {
        if (section.min && !cats.has(section.min)) {
          problems.push(`${slug}: «${section.heading}» é cat ${section.min}, fora de [${declared}]`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
});
