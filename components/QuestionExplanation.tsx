"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

// The notes arrive as sanitized MDX-rendered HTML, so Tailwind's preflight has
// already stripped paragraph margins and list markers from it. Restore the
// rhythm for the tags the notes corpus actually uses: prose, the occasional
// bullet list, and the formula/diagram images.
export const NOTES_PROSE = [
  'max-w-[68ch] leading-relaxed',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg',
  '[&_img]:border [&_img]:border-slate-200 dark:[&_img]:border-slate-700',
  // Inline diagrams draw with currentColor, so they follow the theme.
  '[&_svg]:my-3 [&_svg]:max-w-full [&_svg]:h-auto',
  // ...but not KaTeX's own SVGs. It draws a radical as a path 400em wide and
  // relies on `.hide-tail` clipping it to show just the surd; capping that at
  // 100% scales the whole 400000-unit viewBox into ~30px and the radical
  // disappears, leaving `\sqrt{LC}` looking like a strikethrough. The
  // `.katex svg` selector outranks the bare `svg` one, so order is not at play.
  '[&_.katex_svg]:my-0 [&_.katex_svg]:max-w-none',
  '[&_strong]:font-semibold [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300',
  '[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline',
].join(' ');

export interface QuestionExplanationProps {
  /** '1' | '2' | '3'. Without it there is no note to address. */
  categoryId: string | undefined;
  questionId: number;
  /** Whether the bank generated a note file for this question. */
  hasNotesMdx?: boolean;
  /** Explanation shipped inline with the question, used when there is no file. */
  inlineNotes?: string | null;
  /** Rendered above the explanation. Pass null for callers that head it themselves. */
  heading?: React.ReactNode;
  className?: string;
}

/**
 * The explanation for one question, fetched from `/api/notes` on mount.
 *
 * Shared by the question card and the exam review so the two cannot drift:
 * they answer the same question ("why is this the right answer?") and any fix
 * to the fetch or the prose styling has to reach both.
 *
 * Mount this only when the explanation is actually visible — it fetches
 * immediately, and the exam review has forty of these behind an accordion.
 */
export const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
  categoryId,
  questionId,
  hasNotesMdx,
  inlineNotes,
  heading,
  className,
}) => {
  const t = useTranslations('QuestionCard');
  const [html, setHtml] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  // One key for the whole request. It is the only dependency of the fetch
  // effect on purpose: putting the loading flag in the deps makes the effect
  // tear itself down the moment it sets it, which cancels its own response.
  const notesKey = categoryId && hasNotesMdx
    ? `${encodeURIComponent(categoryId)}/${encodeURIComponent(String(questionId))}`
    : null;

  React.useEffect(() => {
    setHtml(null);
    setError(false);
  }, [questionId, categoryId]);

  React.useEffect(() => {
    if (!notesKey) return;

    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/notes/${notesKey}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load notes: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const body = typeof data?.html === 'string' ? data.html : '';
        setHtml(body.length > 0 ? body : null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [notesKey]);

  const resolved = html ?? inlineNotes ?? null;
  if (!loading && !error && !resolved) return null;

  return (
    <div className={cn('text-slate-600 dark:text-slate-400', className)}>
      {heading}
      {loading && (
        <div className="max-w-[68ch] space-y-2" aria-hidden="true">
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
          <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
        </div>
      )}
      {error && !loading && (
        <p className="text-red-600 dark:text-red-400">{t('notesError')}</p>
      )}
      {!loading && !error && resolved && (
        <div className={NOTES_PROSE} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolved) }} />
      )}
    </div>
  );
};
