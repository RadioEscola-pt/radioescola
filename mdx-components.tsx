import type { MDXComponents } from 'mdx/types';

// Provide default MDX element mappings and a prose wrapper
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Wrap all MDX pages with Tailwind Typography for better defaults
    wrapper: ({ children }) => (
      <article className="prose prose-indigo dark:prose-invert max-w-none">{children}</article>
    ),
    // You can add more overrides here (e.g., code, a)
    ...components,
  };
}