import React from 'react';
import Link from 'next/link';
import { Heart, Coffee, Server, Star, Sparkles, Tent, Radio, Trophy, Users, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  DONATION_TIERS,
  EXPENSES,
  EXTERNAL_LINKS,
  FUNDING,
  annualCost,
  expenseShare,
  formatEuros,
  fundingPercent,
  fundingUpdatedDate,
} from '@/lib/config';
import SupportersStrip from '@/components/SupportersStrip';

/** The tier's picture, keyed by its label. The amounts live in the config. */
const TIER_ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  hosting10: Server,
  sponsor: Star,
};

const EXCESS_ITEMS = [
  { icon: Tent, key: 'excessFairs', chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { icon: Heart, key: 'excessStickers', chip: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
  { icon: Radio, key: 'excessEquipment', chip: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' },
  { icon: Trophy, key: 'excessPrizes', chip: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
] as const;

export default async function DonativosPage() {
  const t = await getTranslations('Donate');
  const locale = await getLocale();
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  const goal = annualCost();
  const percent = fundingPercent();

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero — emotional, funding goal front and center */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-6 py-10 text-center sm:rounded-2xl sm:px-8 md:py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/30">
          <Heart className="h-8 w-8 text-rose-400 animate-heartbeat" />
        </div>
        <h1 className="mx-auto max-w-2xl text-2xl font-bold text-white sm:text-3xl md:text-4xl">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-slate-300">{t('subtitle')}</p>

        <div className="mx-auto mt-8 max-w-md">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{t('fundingTitle', { year: String(FUNDING.year) })}</p>
          <div className="mt-2 flex items-end justify-center gap-2">
            <span className="font-mono text-4xl font-bold text-white">{formatEuros(FUNDING.received, locale)}</span>
            <span className="mb-1 text-slate-400">/ {formatEuros(goal, locale)}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">{t('fundingUpdated', { date: monthFormat.format(fundingUpdatedDate()) })}</p>

          <Link
            href="/apoiantes"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
          >
            <Users className="h-4 w-4 text-amber-400" />
            {t('supportersLink')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Donation tiers */}
      <div className="px-4 sm:px-0 mt-10">
        <h2 className="mb-5 text-center text-xl font-semibold text-slate-900 dark:text-white">{t('chooseAmount')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {DONATION_TIERS.map((tier) => {
            const Icon = TIER_ICONS[tier.labelKey] ?? Heart;
            return (
              <a
                key={tier.labelKey}
                href={`${EXTERNAL_LINKS.PAYPAL_DONATE}/${tier.amount}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col items-center gap-2 sm:gap-3 rounded-2xl border p-4 sm:p-6 text-center outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  tier.recommended
                    ? 'border-transparent bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600'
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-amber-700 shadow-sm">
                    {t('recommended')}
                  </span>
                )}
                <Icon
                  className={`h-6 w-6 transition-transform duration-200 group-hover:-translate-y-1 ${
                    tier.recommended ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
                <span className={`text-2xl font-bold ${tier.recommended ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {tier.amount}€
                </span>
                <span className={`text-sm ${tier.recommended ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                  {t(tier.labelKey)}
                </span>
              </a>
            );
          })}
          <a
            href={EXTERNAL_LINKS.PAYPAL_DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center outline-none transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:p-6 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
          >
            <Heart className="h-6 w-6 text-amber-600 transition-transform duration-200 group-hover:-translate-y-1 dark:text-amber-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{t('otherAmount')}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t('otherAmountDesc')}</span>
          </a>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">{t('donateVia')}</p>
      </div>

      {/* Transparency + extra support */}
      <div className="px-4 sm:px-0 mt-16 grid gap-6 md:mt-20 md:grid-cols-2">
        {/* Cost ledger — the split visualized */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('transparency')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('transparencyDesc')}</p>

          <div className="mt-5 flex h-2 gap-0.5 overflow-hidden rounded-full">
            {EXPENSES.map((expense) => (
              <div key={expense.nameKey} className={expense.segment} style={{ width: `${expenseShare(expense)}%` }} />
            ))}
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700/60">
            {EXPENSES.map((expense) => (
              <div key={expense.nameKey} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${expense.segment}`} aria-hidden />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t(expense.nameKey)} <span className="font-normal text-slate-400">· {expense.provider}</span>
                  </p>
                </div>
                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                  {t(expense.period === 'month' ? 'expenseAmountMonthly' : 'expenseAmountYearly', {
                    amount: formatEuros(expense.amount, locale),
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3.5 py-3 dark:bg-amber-950/20">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('expenseTotal')}</span>
            <span className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">{t('expenseTotalAmount', { amount: formatEuros(goal, locale) })}</span>
          </div>
        </div>

        {/* Beyond the basics — what extra support unlocks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('excessTitle')}</p>
          </div>
          <div className="space-y-1">
            {EXCESS_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.chip}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{t(item.key)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thank you — the people who already answered the ask above */}
      <div className="px-4 sm:px-0 mt-10">
        <SupportersStrip />
      </div>
    </main>
  );
}
