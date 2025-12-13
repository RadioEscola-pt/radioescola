"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Item = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
};

export default function StudyIndexPage() {
  const t = useTranslations('Study');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const active = searchParams.get('cat') ?? 'all';
  const filtered = active === 'all' ? items : items.filter(i => i.categories.includes(active));

  useEffect(() => {
    fetch('/api/study-items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTabChange = (value: string) => {
    if (value === 'all') {
      router.push('/study');
    } else {
      router.push(`/study?cat=${value}`);
    }
  };

  const tabs = [
    { key: 'all', label: t('tabs.all') },
    { key: '3', label: t('tabs.category', { id: '3' }) },
    { key: '2', label: t('tabs.category', { id: '2' }) },
    { key: '1', label: t('tabs.category', { id: '1' }) },
  ];

  return (
    <main className="p-8">
      <section className="max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{t('description')}</p>

        <Tabs value={active} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="bg-brand-100 dark:bg-slate-800">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="mt-6 text-gray-600 dark:text-gray-400">{t('loading')}</div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((i) => (
              <li key={i.slug} className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-5 hover:shadow hover:border-brand-300 dark:hover:border-brand-600 transition-all">
                <Link href={`/study/${i.slug}`} className="block">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{i.title}</h2>
                  {i.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{i.description}</p>}
                  <div className="mt-3 flex gap-1">
                    {i.categories.map((c) => (
                      <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-300 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-700">{t('badge', { id: c })}</span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-gray-600 dark:text-gray-400">{t('empty')}</li>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
