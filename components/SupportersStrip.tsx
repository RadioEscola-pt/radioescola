import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { SUPPORTERS } from '@/lib/config';

/** Chips beyond this collapse into a "+N" — the wall itself is the full list */
const MAX_CHIPS = 8;

interface SupportersStripProps {
  className?: string;
  /**
   * Copy for the donate row, folded into the same card so the thank-you and
   * the ask read as one gesture instead of two stacked prompts. Omitted on
   * the donations page, where the whole page is already the ask; the caller
   * passes the strings because they live in its own message namespace.
   */
  donate?: { prompt: string; label: string };
}

/**
 * The supporters teaser: real callsigns, no amounts, linking to the wall.
 * Shared by the home page and the donations page so the names stay in one
 * place — adding a supporter updates every surface at once.
 */
export default async function SupportersStrip({ className = '', donate }: SupportersStripProps) {
  const t = await getTranslations('Supporters');

  if (SUPPORTERS.length === 0) return null;

  const shown = SUPPORTERS.slice(0, MAX_CHIPS);
  const hidden = SUPPORTERS.length - shown.length;

  return (
    <section
      className={`rounded-xl border border-slate-200/60 bg-slate-50 p-5 dark:border-slate-700/40 dark:bg-slate-800/40 ${className}`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('stripTitle')}</p>
            <Link
              href="/apoiantes"
              className="group inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium text-amber-600 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-amber-400"
            >
              {t('stripCta')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {t('stripSubtitle', { count: SUPPORTERS.length })}
          </p>

          {/* The callsigns themselves — the thank-you has to name names */}
          <div className="mt-3 flex flex-wrap gap-2">
            {shown.map((supporter) => (
              <span
                key={`${supporter.name}-${supporter.since}`}
                className="inline-flex items-baseline gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-900/60"
              >
                {supporter.callsign && (
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{supporter.callsign}</span>
                )}
                <span className="text-slate-500 dark:text-slate-400">{supporter.name}</span>
              </span>
            ))}
            {hidden > 0 && (
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                {t('stripMore', { count: hidden })}
              </span>
            )}
          </div>

          {donate && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/50">
              <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Heart className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" aria-hidden />
                {donate.prompt}
              </p>
              <Button size="sm" asChild>
                <Link href="/donativos">{donate.label}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
