"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, FileText, Video, Search, Clock, Filter } from 'lucide-react';

type ItemType = 'article' | 'video' | 'pdf';

type Item = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
  type?: ItemType;
  readTime?: number; // minutes
};

const TYPE_ICONS: Record<ItemType, typeof BookOpen> = {
  article: BookOpen,
  video: Video,
  pdf: FileText,
};

const TYPE_COLORS: Record<ItemType, string> = {
  article: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  pdf: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function StudyIndexPage() {
  const t = useTranslations('Study');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('cat') ?? 'all';

  // Filter items based on category and search
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

  useEffect(() => {
    fetch('/api/study-items')
      .then(res => res.json())
      .then(data => {
        // Add default type and readTime if not present
        const enriched = data.map((item: Item) => ({
          ...item,
          type: item.type || 'article',
          readTime: item.readTime || Math.floor(Math.random() * 10) + 3, // placeholder
        }));
        setItems(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      router.push('/study');
    } else {
      router.push(`/study?cat=${value}`);
    }
  };

  const categories = [
    { key: 'all', label: t('tabs.all') },
    { key: '3', label: t('tabs.category', { id: '3' }), color: 'bg-green-500' },
    { key: '2', label: t('tabs.category', { id: '2' }), color: 'bg-amber-500' },
    { key: '1', label: t('tabs.category', { id: '1' }), color: 'bg-rose-500' },
  ];

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-6 py-8 sm:rounded-2xl mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('title')}</h1>
        </div>
        <p className="text-slate-300 mb-6">{t('description')}</p>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="px-4 sm:px-0 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('filterBy')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.color && activeCategory !== cat.key && (
                <span className={`inline-block w-2 h-2 rounded-full ${cat.color} mr-2`} />
              )}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="px-4 sm:px-0">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-slate-500 dark:text-slate-400">{t('loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t('empty')}</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const Icon = TYPE_ICONS[item.type || 'article'];
              const typeColor = TYPE_COLORS[item.type || 'article'];

              return (
                <li key={item.slug}>
                  <Link
                    href={`/study/${item.slug}`}
                    className="group block h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-all hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600"
                  >
                    {/* Card header with type icon */}
                    <div className="p-4 pb-0">
                      <div className={`inline-flex p-2 rounded-lg ${typeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-4">
                      <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Footer with meta info */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.categories.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                c === '3' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                c === '2' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                              }`}
                            >
                              CAT {c}
                            </span>
                          ))}
                        </div>
                        {item.readTime && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{item.readTime} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
