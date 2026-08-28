import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Radio, Server, Globe, BookOpen, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { EXTERNAL_LINKS, SUPPORTERS, supportersByYear, supporterDate, firstSupportYear } from '@/lib/config';
import type { Supporter } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Supporters');
  return { title: `${t('title')} — Rádio Escola`, description: t('metaDescription') };
}

const SUSTAINS = [
  { icon: Server, titleKey: 'sustainServer', descKey: 'sustainServerDesc' },
  { icon: Globe, titleKey: 'sustainDomain', descKey: 'sustainDomainDesc' },
  { icon: BookOpen, titleKey: 'sustainFree', descKey: 'sustainFreeDesc' },
] as const;

/**
 * A supporter rendered as a QSL card — the postcard hams exchange to confirm a
 * contact. Callsign on the plate, no amount anywhere: what is being confirmed
 * here is the contact, not the sum.
 */
function QslCard({
  supporter,
  date,
  t,
}: {
  supporter: Supporter;
  date: string;
  t: Awaited<ReturnType<typeof getTranslations<'Supporters'>>>;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600/60">
      {/* Card head — the amber band a QSL card prints its callsign strip on */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">QSL</span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/90">
          {t('qslTag')}
          <Heart className="h-3 w-3 fill-white/90" />
        </span>
      </div>

      <div className="relative overflow-hidden px-5 pt-5 pb-4">
        <Radio
          className="pointer-events-none absolute -right-4 -top-3 h-24 w-24 text-slate-100 transition-transform duration-300 group-hover:scale-110 dark:text-slate-700/50"
          aria-hidden
        />
        {supporter.callsign ? (
          <p className="relative font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] dark:text-white">
            {supporter.callsign}
          </p>
        ) : (
          <p className="relative font-mono text-lg font-semibold tracking-tight text-slate-400 dark:text-slate-500">
            {t('noCallsign')}
          </p>
        )}
        <span className="relative mt-2 block h-0.5 w-10 rounded-full bg-amber-400 transition-all duration-200 group-hover:w-16" />
        <p className="relative mt-3 text-base font-medium text-slate-700 dark:text-slate-200">{supporter.name}</p>
      </div>

      {/* Perforation — the tear line of the real card */}
      <div className="border-t border-dashed border-slate-200 px-5 py-3 dark:border-slate-700">
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t('supporterSince', { date })}</span>
        </p>
      </div>
    </article>
  );
}

export default async function ApoiantesPage() {
  const t = await getTranslations('Supporters');
  const locale = await getLocale();
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  const years = supportersByYear();
  const firstYear = firstSupportYear();

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero — a signal radiating outwards, because that is what the support buys */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-12 text-center sm:rounded-2xl sm:px-8 md:py-16 dark:from-slate-900 dark:to-black">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {/* Standing rings, so the hero reads as a signal even between pulses */}
          {[0.4, 0.7, 1].map((scale) => (
            <span
              key={scale}
              className="absolute rounded-full border border-amber-400/10"
              style={{ height: `${420 * scale}px`, width: `${420 * scale}px` }}
            />
          ))}
          {[0, 1, 2, 3].map((ring) => (
            <span
              key={ring}
              className="absolute h-[420px] w-[420px] rounded-full border border-amber-400/30 opacity-0 motion-safe:animate-[wave-expand_6s_ease-out_infinite] motion-reduce:hidden"
              style={{ animationDelay: `${ring * 1.5}s` }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/30">
            <Radio className="h-8 w-8 text-amber-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{t('heroBadge')}</p>
          <h1 className="mx-auto mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t('heroSubtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-medium text-white ring-1 ring-white/15">
              {t('statSupporters', { count: SUPPORTERS.length })}
            </span>
            {firstYear !== null && (
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-medium text-white ring-1 ring-white/15">
                {t('statSince', { year: firstYear })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* The wall itself — a chronological rail of QSL cards */}
      <section className="mt-12 px-4 sm:px-0 md:mt-16">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('timelineTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('timelineSubtitle')}</p>

        <ol className="relative mt-8 space-y-12">
          {/* The rail, fading out below the last year so the open slot reads as "to be continued" */}
          <span
            className="absolute left-4 top-2 bottom-0 w-px bg-gradient-to-b from-amber-400 via-slate-200 to-transparent dark:via-slate-700"
            aria-hidden
          />

          {years.map((group) => (
            <li key={group.year} className="relative pl-12 sm:pl-14">
              <span
                className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/40"
                aria-hidden
              >
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>

              <div className="flex items-baseline gap-3">
                <h3 className="font-mono text-lg font-bold text-slate-900 dark:text-white">{group.year}</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {t('statSupporters', { count: group.supporters.length })}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.supporters.map((supporter) => (
                  <QslCard
                    key={`${supporter.name}-${supporter.since}`}
                    supporter={supporter}
                    date={monthFormat.format(supporterDate(supporter))}
                    t={t}
                  />
                ))}
              </div>
            </li>
          ))}

          {/* The blank card at the end of the rail — the wall is not finished */}
          <li className="relative pl-12 sm:pl-14">
            <span
              className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 dark:border-slate-600"
              aria-hidden
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </span>
            <Link
              href="/donativos"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-6 outline-none transition-all duration-200 hover:border-amber-400 hover:bg-amber-50/60 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:max-w-md dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-amber-500/60 dark:hover:bg-amber-950/20"
            >
              <span>
                <span className="block font-mono text-lg font-semibold text-slate-500 dark:text-slate-400">
                  {t('openSlotTitle')}
                </span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{t('openSlotDesc')}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </Link>
          </li>
        </ol>
      </section>

      {/* What the support pays for — the honest, amount-free version */}
      <section className="mt-16 px-4 sm:px-0">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('sustainTitle')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SUSTAINS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{t(item.titleKey)}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t(item.descKey)}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400 dark:text-slate-500">{t('privacyNote')}</p>
      </section>

      {/* Closing invitation */}
      <section className="mt-12 px-4 sm:px-0">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-10 text-center ring-1 ring-amber-200/60 dark:from-amber-950/30 dark:to-orange-950/20 dark:ring-amber-800/40">
          <Heart className="h-8 w-8 text-rose-500 animate-heartbeat" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('ctaDesc')}</p>
          <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={EXTERNAL_LINKS.PAYPAL_DONATE} target="_blank" rel="noopener noreferrer">
                <Heart className="h-4 w-4" />
                {t('ctaButton')}
              </a>
            </Button>
            <Link
              href="/donativos"
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-amber-600 hover:underline dark:text-slate-300 dark:hover:text-amber-400"
            >
              {t('ctaCosts')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
