/**
 * The formulary's invariants.
 *
 * `lib/config/formulario.data.ts` is generated from the question bank, and its
 * whole claim is that every entry is required by a real exam question. Nothing
 * else enforces that: it is plain data, so a hand-edit can silently introduce a
 * dangling ref, a duplicate anchor or an expression KaTeX cannot typeset, and
 * the page would render it as an empty box in production. These tests are the
 * check the build otherwise has no way to make.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import katex from 'katex';
import { FORMULARIO } from '@/lib/config/formulario.data';
import { parseRef, questionHref, type Formula, type FormulaTable } from '@/lib/config/formulario';
import { CATEGORIES } from '@/lib/config/categories';

const ROOT = resolve(__dirname, '../../');

/**
 * Every question the site actually serves, as `cat{n}#{id}`.
 *
 * Read from the shipped artifacts rather than from `content/questions/`,
 * because a question withheld with `disabled` still has a source file but is
 * dropped from the artifacts — and a ref to one would send the reader to a
 * `/browse` anchor that no longer exists.
 */
const bank = new Set(
  CATEGORIES.flatMap((cat) => {
    const data = JSON.parse(readFileSync(resolve(ROOT, `public/data/cat${cat}.json`), 'utf-8'));
    return (data.questions as Array<{ id: number }>).map((q) => `cat${cat}#${q.id}`);
  }),
);

const entries: Array<{ section: string; entry: Formula | FormulaTable }> = FORMULARIO.flatMap((s) =>
  [...s.formulas, ...s.tabelas].map((entry) => ({ section: s.id, entry })),
);

/** Inline `$…$` islands are typeset by the same renderer as the display forms. */
function inlineExpressions(text: string): string[] {
  return text.split(/\$([^$]+)\$/g).filter((_, i) => i % 2 === 1);
}

describe('Formulário', () => {
  it('has content in every section', () => {
    expect(FORMULARIO.length).toBeGreaterThan(0);
    for (const s of FORMULARIO) {
      expect(s.formulas.length + s.tabelas.length, `secção ${s.id} vazia`).toBeGreaterThan(0);
    }
  });

  it('gives every entry a key that is unique across the whole formulary', () => {
    // The key is the anchor id, so a collision breaks deep links silently.
    const keys = entries.map((e) => e.entry.key);
    expect(new Set(keys).size).toBe(keys.length);
    const sectionIds = FORMULARIO.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it('ties every entry to at least one question the site still serves', () => {
    const dangling: string[] = [];
    for (const { section, entry } of entries) {
      expect(entry.refs.length, `${section}#${entry.key} não cita nenhuma pergunta`).toBeGreaterThan(0);
      for (const ref of entry.refs) {
        if (!bank.has(ref)) dangling.push(`${section}#${entry.key} → ${ref}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it('claims a category only where a question of that category requires it', () => {
    const mismatched: string[] = [];
    for (const { section, entry } of entries) {
      expect(entry.categorias.length, `${section}#${entry.key} sem categoria`).toBeGreaterThan(0);
      const refCats = new Set(entry.refs.map((r) => parseRef(r)?.cat));
      for (const cat of entry.categorias) {
        if (!refCats.has(cat)) mismatched.push(`${section}#${entry.key} diz cat${cat} sem uma pergunta de cat${cat}`);
      }
    }
    expect(mismatched).toEqual([]);
  });

  it('typesets every expression without falling back to an error', () => {
    const broken: string[] = [];
    const check = (tex: string, where: string) => {
      try {
        katex.renderToString(tex, { throwOnError: true, displayMode: true });
      } catch (e) {
        broken.push(`${where}: ${(e as Error).message}`);
      }
    };
    for (const { section, entry } of entries) {
      const at = `${section}#${entry.key}`;
      if ('latex' in entry) {
        check(entry.latex, at);
        entry.variantes.forEach((v, i) => check(v, `${at} variante ${i}`));
        for (const v of entry.variaveis) {
          check(v.simbolo, `${at} símbolo`);
          inlineExpressions(v.significado).forEach((t) => check(t, `${at} significado`));
        }
        inlineExpressions(entry.notas).forEach((t) => check(t, `${at} notas`));
      } else {
        for (const cell of [...entry.colunas, ...entry.notas, ...entry.linhas.flat()]) {
          inlineExpressions(cell).forEach((t) => check(t, at));
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('never leaves bare LaTeX anywhere prose is rendered', () => {
    // RichText only typesets `$…$` islands; a bare `\\omega` sitting in prose
    // reaches the reader as the literal characters. This covers every field
    // that is rendered as text rather than as an expression.
    const outsideMath = (text: string) => text.split(/\$[^$]+\$/g).join(' ');
    const leaked: string[] = [];
    const check = (text: string, where: string) => {
      if (/\\[a-zA-Z]+/.test(outsideMath(text))) leaked.push(`${where}: ${text.slice(0, 60)}`);
    };
    for (const s of FORMULARIO) {
      check(s.intro, `${s.id} intro`);
      for (const f of s.formulas) {
        check(f.notas, `${s.id}#${f.key} notas`);
        for (const v of f.variaveis) {
          check(v.significado, `${s.id}#${f.key} ${v.simbolo} significado`);
          check(v.unidade, `${s.id}#${f.key} ${v.simbolo} unidade`);
        }
      }
      for (const t of s.tabelas) {
        for (const cell of [...t.colunas, ...t.notas, ...t.linhas.flat()]) check(cell, `${s.id}#${t.key}`);
      }
    }
    expect(leaked).toEqual([]);
  });

  it('never leaves bare LaTeX in a unit', () => {
    // `unidade` is short enough to render as text, so a `\\Omega` in it reaches
    // the reader verbatim rather than as Ω. Inline `$…$` is fine — that goes
    // through the same renderer as the rest of the prose — but a bare command
    // does not, and nothing else catches it.
    const leaked: string[] = [];
    for (const s of FORMULARIO) {
      for (const f of s.formulas) {
        for (const v of f.variaveis) {
          const outsideMath = v.unidade.split(/\$[^$]+\$/g).join(' ');
          if (/\\[a-zA-Z]+/.test(outsideMath)) leaked.push(`${s.id}#${f.key} ${v.simbolo}: ${v.unidade}`);
        }
      }
    }
    expect(leaked).toEqual([]);
  });

  it('keeps table rows aligned with their header', () => {
    for (const s of FORMULARIO) {
      for (const t of s.tabelas) {
        if (t.colunas.length === 0) continue;
        for (const [i, linha] of t.linhas.entries()) {
          expect(linha.length, `${s.id}#${t.key} linha ${i}`).toBe(t.colunas.length);
        }
      }
    }
  });
});

describe('questionHref', () => {
  it('turns a bank ref into the browse deep link', () => {
    expect(questionHref('cat2#134')).toBe('/browse/2#q-134');
    expect(questionHref(' cat1#7 ')).toBe('/browse/1#q-7');
  });

  it('returns null rather than a broken link for anything else', () => {
    expect(questionHref('cat4#1')).toBeNull();
    expect(questionHref('cat2-134')).toBeNull();
    expect(questionHref('')).toBeNull();
  });
});
