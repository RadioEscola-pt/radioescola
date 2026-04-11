"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Search, Clock } from 'lucide-react';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/config/categories';
import type { CategoryId } from '@/lib/config/categories';

type Item = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
  type?: string;
  readTime?: number;
};

export default function StudyIndexPage() {
  const t = useTranslations('Study');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('cat') ?? 'all';

  const filtered = useMemo(() => {
    let result = items;

    if (activeCategory !== 'all') {
      result = result.filter(i => i.categories.includes(activeCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, activeCategory, searchQuery]);

  const loadItems = () => {
    setLoading(true);
    setError(false);
    fetch('/api/study-items')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      router.push('/study');
    } else {
      router.push(`/study?cat=${value}`);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        {t('title')}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('description')}</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label={t('filterBy')}>
        <button
          onClick={() => handleCategoryChange('all')}
          aria-pressed={activeCategory === 'all'}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {t('tabs.all')}
        </button>
        {CATEGORIES.map((catId) => {
          const cfg = CATEGORY_CONFIG[catId];
          const Icon = cfg.icon;
          const isActive = activeCategory === catId;
          return (
            <button
              key={catId}
              onClick={() => handleCategoryChange(catId)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? `${cfg.badgeBg} ${cfg.badgeText}`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t('tabs.category', { id: catId })}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 mb-3">{t('error')}</p>
          <button
            onClick={loadItems}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{t('empty')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/study/${item.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-colors hover:border-amber-300 dark:hover:border-amber-600"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {item.categories.map((c) => {
                      const cfg = CATEGORY_CONFIG[c as CategoryId];
                      if (!cfg) return null;
                      const CatIcon = cfg.icon;
                      return (
                        <span
                          key={c}
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
                        >
                          <CatIcon className="h-2.5 w-2.5" />
                          CAT {c}
                        </span>
                      );
                    })}
                    {item.readTime && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        {item.readTime} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
