"use client";

import { useCallback, useId, useState } from 'react';
import Link from 'next/link';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { parseQuestionRef } from '@/lib/question-lookup';
import { useCoarsePointer, useHoverIntent, useQuestionPreview } from '@/hooks/useQuestionPreview';
import { QuestionPreviewCard } from './QuestionPreviewCard';

/** The chip's own look, shared by every surface that cites a bank question. */
const CHIP =
  'inline-flex min-h-7 items-center rounded-md bg-slate-100 px-2 font-mono text-xs text-slate-600 transition-colors duration-150 hover:bg-amber-100 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 motion-reduce:transition-none dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-300';

/**
 * A citation of a bank question — `cat2#92` — that previews the question.
 *
 * Use this anywhere a question is referred to by id; it owns both the chip's
 * appearance and the preview, so a reference looks and behaves the same on
 * every surface.
 *
 * Two input models, one piece of markup. A pointer hovers (or tabs to) the
 * chip and gets a card anchored beside it, while the click still follows the
 * link as a link should. A touch device has no hover at all, so a tap opens a
 * bottom sheet instead of navigating, and the sheet carries the link. The
 * element rendered is an `<a>` either way — the branch is in the click
 * handler, not the markup, so the server and the client agree and the chip
 * still works as a plain link if the JavaScript never arrives.
 */
export function QuestionRef({
  refId,
  className = '',
  children,
}: {
  refId: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const parsed = parseQuestionRef(refId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const coarse = useCoarsePointer();
  const hover = useHoverIntent();
  const titleId = useId();

  const active = hover.open || sheetOpen;
  const state = useQuestionPreview(refId, active);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!coarse) return; // a mouse click follows the link
      e.preventDefault();
      setSheetOpen(true);
    },
    [coarse],
  );

  const label = children ?? refId.replace('#', ' · ');

  // An unparseable reference is still worth showing as text; it just cannot be
  // linked or previewed.
  if (!parsed) return <span className={`${CHIP} ${className}`}>{label}</span>;

  const href = `/browse/${parsed.cat}#q-${parsed.id}`;

  const chip = (
    <Link
      href={href}
      onClick={onClick}
      onPointerEnter={coarse ? undefined : hover.onEnter}
      onPointerLeave={coarse ? undefined : hover.onLeave}
      onFocus={coarse ? undefined : hover.onEnter}
      onBlur={coarse ? undefined : hover.onLeave}
      aria-label={`Pergunta ${refId}`}
      className={`${CHIP} ${className}`}
    >
      {label}
    </Link>
  );

  if (coarse) {
    return (
      <>
        {chip}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0 dark:bg-slate-800"
          >
            <SheetTitle className="sr-only">Pergunta {refId}</SheetTitle>
            <QuestionPreviewCard refId={refId} state={state} onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={hover.open} onOpenChange={hover.setOpen}>
      <PopoverAnchor asChild>{chip}</PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        aria-labelledby={titleId}
        // Pointing at something must not move the keyboard focus out from
        // under the reader; the card is reachable by tabbing to the chip.
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerEnter={hover.onEnter}
        onPointerLeave={hover.onLeave}
        className="w-[22rem] overflow-hidden border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-800"
      >
        <span id={titleId} className="sr-only">Pré-visualização da pergunta {refId}</span>
        <QuestionPreviewCard refId={refId} state={state} onNavigate={() => hover.setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
