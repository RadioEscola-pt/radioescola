"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BookOpen, Search, Clock,
  Zap, CircuitBoard, Filter, RadioReceiver, RadioTower, Antenna, Radar,
  Gauge, ShieldAlert, HardHat, Waves, Palette, SpellCheck, MessagesSquare,
  Tag, Footprints,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/config/categories';
import type { CategoryId } from '@/lib/config/categories';

// Tinted tile presets for the guide icons (light + dark).
const ACCENTS = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const;

// Per-guide icon + accent. Unlisted slugs fall back to a neutral book icon.
const GUIDE_VISUAL: Record<string, { icon: LucideIcon; accent: keyof typeof ACCENTS }> = {
  'getting-started': { icon: Footprints, accent: 'amber' },
  'teoria-electrica-e-radio': { icon: Zap, accent: 'amber' },
  'componentes': { icon: CircuitBoard, accent: 'blue' },
  'circuitos': { icon: Filter, accent: 'cyan' },
  'recetores': { icon: RadioReceiver, accent: 'violet' },
  'emissores': { icon: RadioTower, accent: 'rose' },
  'antenas': { icon: Antenna, accent: 'emerald' },
  'propagacao': { icon: Radar, accent: 'cyan' },
  'medidas': { icon: Gauge, accent: 'blue' },
  'interferencias': { icon: ShieldAlert, accent: 'rose' },
  'seguranca': { icon: HardHat, accent: 'amber' },
  'campo-electromagnetico': { icon: Waves, accent: 'violet' },
  'codigo-de-cores': { icon: Palette, accent: 'emerald' },
  'alfabeto-fonetico': { icon: SpellCheck, accent: 'blue' },
  'abreviaturas-de-operacao': { icon: MessagesSquare, accent: 'cyan' },
  'prefixos-ic': { icon: Tag, accent: 'violet' },
};
const DEFAULT_VISUAL = { icon: BookOpen, accent: 'slate' as const };

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

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/study-items');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  // Retry handler (event-driven): reset to loading state, then refetch
  const loadItems = useCallback(() => {
    setLoading(true);
    setError(false);
    void fetchItems();
  }, [fetchItems]);

  // Initial load — state already starts in loading=true, so no synchronous reset needed
  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

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
          {filtered.map((item) => {
            const visual = GUIDE_VISUAL[item.slug] ?? DEFAULT_VISUAL;
            const Icon = visual.icon;
            return (
            <li key={item.slug}>
              <Link
                href={`/study/${item.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-all hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENTS[visual.accent]}`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
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
            );
          })}
        </ul>
      )}
    </main>
  );
}
