import React from 'react';
import { Heart, Coffee, Server, Star, Receipt, Sparkles, Tent, Radio, Trophy } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { EXTERNAL_LINKS } from '@/lib/config';

const DONATION_TIERS = [
  { amountKey: 'coffeeAmount', labelKey: 'coffee', icon: Coffee, recommended: false },
  { amountKey: 'hosting10Amount', labelKey: 'hosting10', icon: Server, recommended: true },
  { amountKey: 'sponsorAmount', labelKey: 'sponsor', icon: Star, recommended: false },
] as const;

export default async function DonativosPage() {
  const t = await getTranslations('Donate');

  const received = parseFloat(t('fundingReceivedRaw'));
  const goal = parseFloat(t('fundingGoalRaw'));
  const percent = Math.min(100, Math.round((received / goal) * 100));

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-8 py-10 sm:rounded-2xl mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/20 shrink-0 mt-1">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 animate-heartbeat" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t('title')}</h1>
        </div>
        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
          {t('subtitle')}
        </p>

        {/* Funding progress — prominent, inside the hero */}
        <div className="mt-8 max-w-md">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
            <p className="text-sm font-medium text-slate-400">{t('fundingTitle')}</p>
            <p className="text-sm text-slate-400">
              <span className="text-lg font-bold text-white">{t('fundingReceived')}</span>
              <span className="mx-1">/</span>
              {t('fundingGoal')}
            </p>
          </div>
          <div className="h-4 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">{t('fundingUpdated')}</p>
        </div>
      </div>

      {/* Donation amounts */}
      <div className="px-4 sm:px-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('chooseAmount')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {DONATION_TIERS.map((tier) => {
            const amount = t(tier.amountKey);
            const Icon = tier.icon;
            return (
              <a
                key={tier.amountKey}
                href={`${EXTERNAL_LINKS.PAYPAL_DONATE}/${amount}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border bg-white dark:bg-slate-800 p-4 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 outline-none transition-all duration-200 ${
                  tier.recommended
                    ? 'border-amber-400 dark:border-amber-500 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 sm:px-2.5 py-0.5 rounded-full">
                    {t('recommended')}
                  </span>
                )}
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover:-translate-y-1" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{amount}€</span>
                <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t(tier.labelKey)}</span>
              </a>
            );
          })}
          <a
            href={EXTERNAL_LINKS.PAYPAL_DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 outline-none transition-all duration-200"
          >
            <Heart className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover:-translate-y-1" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{t('otherAmount')}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t('otherAmountDesc')}</span>
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          {t('donateVia')}
        </p>
      </div>

      {/* Transparency */}
      <div className="px-4 sm:px-0 mt-16 md:mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Receipt className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('transparency')}</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t('transparencyDesc')}</p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('expenseHosting')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hetzner</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('expenseHostingAmount')}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 text-slate-500 dark:text-slate-400 text-center text-xs font-bold leading-4">.pt</span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('expenseDomain')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">radioescola.pt</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('expenseDomainAmount')}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('expenseTotal')}</p>
            <span className="font-bold text-amber-600 dark:text-amber-400">{t('expenseTotalAmount')}</span>
          </div>
        </div>

        {/* Beyond the basics */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('excessTitle')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { icon: Tent, key: 'excessFairs', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
              { icon: Heart, key: 'excessStickers', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
              { icon: Radio, key: 'excessEquipment', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: Trophy, key: 'excessPrizes', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
            ] as const).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(item.key)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
