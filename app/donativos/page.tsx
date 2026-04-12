import React from 'react';
import { Heart, Server, Code, Users, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { EXTERNAL_LINKS } from '@/lib/config';

const DONATION_TIERS = [
  { amountKey: 'coffeeAmount', labelKey: 'coffee', icon: '☕' },
  { amountKey: 'hosting10Amount', labelKey: 'hosting10', icon: '🖥️' },
  { amountKey: 'sponsorAmount', labelKey: 'sponsor', icon: '⭐' },
] as const;

const WHAT_HELPS = [
  { icon: Server, titleKey: 'hosting', descKey: 'hostingDesc' },
  { icon: Code, titleKey: 'development', descKey: 'developmentDesc' },
  { icon: Users, titleKey: 'community', descKey: 'communityDesc' },
] as const;

export default async function DonativosPage() {
  const t = await getTranslations('Donate');

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-8 py-10 sm:rounded-2xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/20">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('title')}</h1>
        </div>
        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* What donations help with */}
      <div className="px-4 sm:px-0 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('whatHelps')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {WHAT_HELPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
              >
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t(item.titleKey)}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t(item.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested amounts */}
      <div className="px-4 sm:px-0 mb-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('chooseAmount')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DONATION_TIERS.map((tier) => {
            const amount = t(tier.amountKey);
            return (
              <a
                key={tier.amountKey}
                href={`${EXTERNAL_LINKS.PAYPAL_DONATE}/${amount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all"
              >
                <span className="text-3xl">{tier.icon}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{amount}€</span>
                <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t(tier.labelKey)}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
                  {t('donateVia')}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            );
          })}
          {/* Other amount */}
          <a
            href={EXTERNAL_LINKS.PAYPAL_DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-6 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all"
          >
            <span className="text-3xl">💛</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">…€</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t('otherAmount')}</span>
            <span className="text-xs text-slate-500 dark:text-slate-500">{t('otherAmountDesc')}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
              {t('donateVia')}
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>
      </div>

      {/* Thank you */}
      <div className="px-4 sm:px-0">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('thankYou')}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">{t('thankYouText')}</p>
        </div>
      </div>
    </main>
  );
}
