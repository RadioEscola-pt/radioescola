import React from 'react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Compiles one explanation's MDX to static HTML.
 *
 * Lives here rather than inline in the route so the plugin list is covered by
 * tests. Dropping a plugin fails silently and only in production — maths would
 * come out as literal `$` signs on the question card, with nothing erroring.
 *
 * Note that `next.config.js` configures the same plugins for MDX *pages*; that
 * has no effect here, because explanations are compiled at request time rather
 * than at build time. Both lists have to be kept in step.
 * `katex.min.css` is loaded globally in `app/layout.tsx`.
 */
export async function renderNoteToHtml(source: string): Promise<string> {
  const compiled = await compile(source, {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
    outputFormat: 'function-body',
  });
  const { default: Content } = await run(compiled, runtime);
  const { renderToStaticMarkup } = await import('react-dom/server');
  return renderToStaticMarkup(React.createElement(Content));
}
