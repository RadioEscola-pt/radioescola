"use client";

import { useMemo } from 'react';
import katex from 'katex';

/**
 * KaTeX for expressions that live in data rather than in MDX.
 *
 * The MDX pipeline (`remark-math` + `rehype-katex`) only sees `$…$` written in
 * a source file; the formulary keeps its expressions in `lib/config/formulario.ts`
 * so they can be filtered, so it renders them itself. `katex.min.css` is already
 * loaded once in the root layout — do not import it again here.
 *
 * `throwOnError: false` renders a bad expression in red instead of taking the
 * page down with it: a typo in one formula should not blank the other hundred.
 */
/**
 * Rendered markup, keyed by expression.
 *
 * Module scope rather than a hook: filtering unmounts and remounts cards, so a
 * per-instance `useMemo` is thrown away on every keystroke and the page then
 * re-renders all ~2000 expressions of the formulary synchronously — which locks
 * the tab for tens of seconds. `renderToString` is pure, so the result survives
 * the remount safely. Growth is bounded by the number of distinct expressions
 * in `formulario.data.ts`.
 */
const cache = new Map<string, string>();

function render(tex: string, display: boolean): string {
  const cacheKey = `${display ? 'D' : 'I'}${tex}`;
  let html = cache.get(cacheKey);
  if (html === undefined) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' });
    cache.set(cacheKey, html);
  }
  return html;
}

export function Math({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => render(tex, display), [tex, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Splits on the delimiters rather than reaching for a markdown renderer: the
 * only markup these strings carry is inline maths and bold, and pulling in a
 * markdown parser to render two constructs would cost more than it explains.
 */
const SEGMENT = /(\$[^$]+\$|\*\*[^*]+\*\*)/g;

/**
 * Prose with `$…$` and `**…**` islands in it — variable meanings, table cells,
 * and the exam-trap notes, where the emphasis is usually the whole point ("dB
 * de potência usa **10**, nunca 20").
 */
export function RichText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(SEGMENT).filter(Boolean), [text]);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          return <Math key={i} tex={part.slice(1, -1)} />;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
