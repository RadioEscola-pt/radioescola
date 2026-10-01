"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Check, ChevronDown, Search } from 'lucide-react';
import { STUDY_CHAPTERS, type StudyItem } from '@/lib/config/study-guides';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/config/categories';
import type { CategoryId } from '@/lib/config/categories';
import { useProgress } from '@/hooks/useProgress';
import { setReaderCategory } from '@/lib/reader-category';

type Drawer = {
  id: string;
  number: string | null;
  items: StudyItem[];
  minutes: number;
  read: number;
};

export default function StudyIndexPage() {
  const t = useTranslations('Study');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isGuideRead } = useProgress();

  const [items, setItems] = useState<StudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const activeCategory = searchParams.get('cat') ?? 'all';

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/study-items');
      if (!res.ok) throw new Error('Failed to load');
      setItems(await res.json());
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  /** The guides this reader's category actually asks for. */
  const inCategory = useMemo(
    () =>
      activeCategory === 'all'
        ? items
        : items.filter((i) => i.categories.includes(activeCategory)),
    [items, activeCategory]
  );

  const query = searchQuery.trim().toLowerCase();
  const found = useMemo(
    () =>
      query
        ? inCategory.filter(
            (i) =>
              i.title.toLowerCase().includes(query) ||
              i.description?.toLowerCase().includes(query)
          )
        : [],
    [inCategory, query]
  );

  /**
   * One drawer per syllabus chapter, in exam order. A chapter with nothing left
   * after the category filter is dropped rather than shown empty: a category 3
   * reader has no business seeing a chapter that only holds category 1 guides.
   */
  const drawers = useMemo<Drawer[]>(() => {
    const bySlug = new Map(inCategory.map((i) => [i.slug, i]));
    return STUDY_CHAPTERS.map((chapter) => {
      const chapterItems = chapter.slugs
        .map((slug) => bySlug.get(slug))
        .filter((i): i is StudyItem => Boolean(i));
      return {
        id: chapter.id,
        number: chapter.number,
        items: chapterItems,
        minutes: chapterItems.reduce((sum, i) => sum + (i.readTime ?? 1), 0),
        read: chapterItems.filter((i) => isGuideRead(i.slug)).length,
      };
    }).filter((d) => d.items.length > 0);
  }, [inCategory, isGuideRead]);

  const totals = useMemo(
    () => ({
      guides: inCategory.length,
      minutes: inCategory.reduce((sum, i) => sum + (i.readTime ?? 1), 0),
    }),
    [inCategory]
  );

  const setCategory = (value: string) => {
    // A escolha feita aqui segue para dentro dos guias, onde marca as secções
    // que esta categoria não precisa de estudar.
    setReaderCategory(value === 'all' ? null : (value as CategoryId));
    router.push(value === 'all' ? '/aprender' : `/aprender?cat=${value}`);
  };

  return (
    <main>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {t('title')}
          </h1>
          <p className="mt-1 text-slate-500 tabular-nums dark:text-slate-400">
            {loading
              ? t('loading')
              : `${t('guideCount', { count: totals.guides })} · ${t('minutes', { count: totals.minutes })}`}
          </p>
        </div>

        <div
          className="flex shrink-0 overflow-hidden rounded-full border border-stone-200 text-sm font-semibold dark:border-slate-700"
          role="group"
          aria-label={t('filterBy')}
        >
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={activeCategory === 'all'}
            className={`px-4 py-1.5 transition-colors ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-stone-600 hover:bg-stone-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {t('tabs.all')}
          </button>
          {CATEGORIES.map((catId) => (
            <button
              key={catId}
              type="button"
              onClick={() => setCategory(catId)}
              aria-pressed={activeCategory === catId}
              className={`px-4 py-1.5 transition-colors ${
                activeCategory === catId
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-stone-600 hover:bg-stone-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {t('tabs.category', { id: catId })}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-8">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="mt-3 text-stone-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="mb-3 text-stone-500 dark:text-slate-400">{t('error')}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(false);
              void fetchItems();
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 transition-colors hover:bg-amber-400"
          >
            {t('retry')}
          </button>
        </div>
      ) : query ? (
        <SearchResults items={found} isRead={isGuideRead} empty={t('empty')} />
      ) : (
        <div className="border-t border-stone-200 dark:border-slate-800">
          {drawers.map((drawer) => (
            <ChapterDrawer
              key={drawer.id}
              drawer={drawer}
              label={t(`chapters.${drawer.id}`)}
              open={open === drawer.id}
              onToggle={() => setOpen(open === drawer.id ? null : drawer.id)}
              isRead={isGuideRead}
              minutesLabel={(n: number) => t('minutes', { count: n })}
            />
          ))}
        </div>
      )}
    </main>
  );
}

/** One dash per guide, filled when that guide is read: the count is the bar. */
function ProgressDashes({ items, isRead }: { items: StudyItem[]; isRead: (s: string) => boolean }) {
  return (
    <span className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.slug}
          className={`h-[5px] w-6 rounded-full ${
            isRead(item.slug) ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-200 dark:bg-slate-700'
          }`}
        />
      ))}
    </span>
  );
}

function ChapterDrawer({
  drawer,
  label,
  open,
  onToggle,
  isRead,
  minutesLabel,
}: {
  drawer: Drawer;
  label: string;
  open: boolean;
  onToggle: () => void;
  isRead: (slug: string) => boolean;
  minutesLabel: (n: number) => string;
}) {
  const panelId = `capitulo-${drawer.id}`;

  return (
    <div className={open ? 'border-b border-stone-200 bg-stone-50/60 dark:border-slate-800 dark:bg-slate-800/30' : 'border-b border-stone-200 dark:border-slate-800'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 px-2 py-4 text-left transition-colors hover:bg-stone-50 sm:gap-5 dark:hover:bg-slate-800/40"
      >
        <span
          className={`w-7 shrink-0 text-right text-lg font-bold tabular-nums ${
            open ? 'text-brand-500' : 'text-stone-300 dark:text-slate-600'
          }`}
          aria-hidden="true"
        >
          {drawer.number ?? '·'}
        </span>
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </span>
        <ProgressDashes items={drawer.items} isRead={isRead} />
        <span className="w-[6.5rem] shrink-0 text-right text-[13px] tabular-nums text-stone-500 dark:text-slate-400">
          {drawer.items.length} · {minutesLabel(drawer.minutes)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul id={panelId} className="flex list-none flex-col gap-1 px-2 pb-4 pl-4 sm:pl-[3.25rem]">
          {drawer.items.map((item) => {
            const read = isRead(item.slug);
            return (
              <li key={item.slug}>
                <Link
                  href={`/aprender/${item.slug}`}
                  className="flex items-baseline gap-3 rounded-lg px-2 py-2 no-underline transition-colors hover:bg-white dark:hover:bg-slate-800"
                >
                  <span className="w-4 shrink-0 self-center" aria-hidden="true">
                    {read && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[15px] ${
                      read
                        ? 'text-stone-400 line-through dark:text-slate-500'
                        : 'font-medium text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-stone-400 dark:text-slate-500">
                    {minutesLabel(item.readTime ?? 1)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SearchResults({
  items,
  isRead,
  empty,
}: {
  items: StudyItem[];
  isRead: (slug: string) => boolean;
  empty: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpen className="mx-auto mb-3 h-12 w-12 text-stone-300 dark:text-slate-600" aria-hidden="true" />
        <p className="text-stone-500 dark:text-slate-400">{empty}</p>
      </div>
    );
  }

  return (
    <ul className="flex list-none flex-col border-t border-stone-200 dark:border-slate-800">
      {items.map((item) => (
        <li key={item.slug} className="border-b border-stone-200 dark:border-slate-800">
          <Link
            href={`/aprender/${item.slug}`}
            className="flex items-baseline gap-3 px-2 py-3 no-underline transition-colors hover:bg-stone-50 dark:hover:bg-slate-800/40"
          >
            <span className="w-4 shrink-0 self-center" aria-hidden="true">
              {isRead(item.slug) && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-slate-900 dark:text-slate-100">
                {item.title}
              </span>
              {item.description && (
                <span className="mt-0.5 block truncate text-[13px] text-stone-500 dark:text-slate-400">
                  {item.description}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
