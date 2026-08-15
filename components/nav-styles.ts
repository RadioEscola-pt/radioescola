import { cn } from "@/lib/utils";

/**
 * Glass affordance shared by the top bar: idle is flat, hover/focus/open frosts
 * the item over the blurred header, and the current section is tinted amber.
 */
const glass =
  "text-slate-700 hover:backdrop-blur-md focus:backdrop-blur-md data-[state=open]:backdrop-blur-md hover:border-slate-900/10 hover:bg-white/70 hover:text-slate-900 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_0_rgba(15,23,42,0.06)] focus:border-slate-900/10 focus:bg-white/70 focus:text-slate-900 data-[state=open]:border-slate-900/10 data-[state=open]:bg-white/70 data-[state=open]:text-slate-900 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-white dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] dark:focus:border-white/15 dark:focus:bg-white/10 dark:focus:text-white dark:data-[state=open]:border-white/15 dark:data-[state=open]:bg-white/10 dark:data-[state=open]:text-white";

const itemBase =
  "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none";

const iconBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-colors focus:outline-none";

/** Text + icon nav entry (links and dropdown triggers). */
export const navItem = cn(itemBase, glass);

/** Square icon-only control in the top bar. */
export const navIconButton = cn(iconBase, glass);

/** Replaces `navItem`'s idle colors when the entry points at the current section. */
export const navItemActive = cn(
  itemBase,
  "border-amber-500/30 bg-amber-500/15 text-amber-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md hover:border-amber-500/40 hover:bg-amber-500/25 hover:text-amber-900 data-[state=open]:bg-amber-500/25 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/20 dark:hover:text-amber-100 dark:data-[state=open]:bg-amber-400/20"
);
