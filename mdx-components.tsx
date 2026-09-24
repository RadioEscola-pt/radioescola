import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** `## 3. As quatro classes`, and the syllabus-numbered `## 5.1 Diagramas`. */
const NUMBERED_HEADING = /^(\d+(?:\.\d+)?)\.?\s+([\s\S]*)$/;

/**
 * Pulls the leading number out of a section heading and sets it in the margin.
 *
 * The guides number their sections in the heading text itself (it is how they
 * map onto the CEPT syllabus), so this is a rendering concern, not a content
 * one: the number is lifted here rather than by editing 37 MDX files. The
 * heading keeps its `rehype-slug` id, and the numeral is `aria-hidden` so the
 * accessible name stays the section title.
 */
function Heading2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
  const parts: ReactNode[] = Array.isArray(children) ? children : [children];
  const [first, ...rest] = parts;

  if (typeof first === 'string') {
    const match = NUMBERED_HEADING.exec(first);
    if (match?.[1] && match[2]) {
      return (
        <h2 {...props} className="guide-h2">
          <span aria-hidden="true" className="guide-h2-number">
            {match[1]}
          </span>
          <span className="guide-h2-text">
            {match[2]}
            {rest}
          </span>
        </h2>
      );
    }
  }

  return <h2 {...props}>{children}</h2>;
}

/** Wide comparison tables are the norm in these guides; phones are not. */
function Table(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="guide-table-scroll">
      <table {...props} />
    </div>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <article className="prose dark:prose-invert max-w-none">{children}</article>
    ),
    h2: Heading2,
    table: Table,
    ...components,
  };
}
