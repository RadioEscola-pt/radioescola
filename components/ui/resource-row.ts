/**
 * Shared shape for the resource affordances in a question's answer reveal:
 * the Study Library guide and the official exam papers.
 *
 * Kept as class constants rather than a component because the two render
 * different elements (a next/link vs. a dialog trigger button), but they must
 * stay visually identical: two hand-maintained copies would drift apart.
 *
 * Deliberately borderless. The question is already a card, so a bordered box
 * inside it reads as debris; the tile, the chevron and a hover fill that bleeds
 * out to the card padding carry the affordance instead.
 */
export const RESOURCE_ROW =
  '-mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

/** Same row, for an item we cannot open. No hover, no pointer. */
export const RESOURCE_ROW_INERT =
  '-mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left';

export const RESOURCE_TILE =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg';

export const RESOURCE_TITLE =
  'block truncate font-semibold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400';

export const RESOURCE_SUBTITLE =
  'mt-0.5 block truncate text-xs font-normal text-slate-500 dark:text-slate-400';

export const RESOURCE_CHEVRON =
  'h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none';
