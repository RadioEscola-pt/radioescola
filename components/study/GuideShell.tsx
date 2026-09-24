"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BARE_GUIDE_SLUGS, type StudyItem } from '@/lib/config/study-guides';
import GuideToc, { useGuideSections } from '@/components/study/GuideToc';

const LABEL = 'text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500';

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-0.5 ml-0 text-[15px] font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * The reading chrome shared by every prose guide: the header band, the section
 * rail and the prev/next pair. It exists so that the 37 `page.mdx` files carry
 * nothing but content, which is also why everything here is derived, never
 * declared: the title, description, categories and reading time come from the
 * frontmatter the layout read, the sections from the rendered headings, the
 * linked guides from the prose's own links.
 *
 * `items` is passed from the server layout rather than fetched, so the header
 * renders in the first paint and the article's own `h1` can be hidden without
 * the title flickering (see `[data-guide-shell]` in globals.css).
 */
export default function GuideShell({
  items,
  children,
}: {
  items: StudyItem[];
  children: ReactNode;
}) {
  const t = useTranslations('Study.guide');
  const pathname = usePathname() ?? '';
  const slug = pathname.replace(/^\/aprender\/?/, '').replace(/\/$/, '');
  const { sections, activeId } = useGuideSections(slug);

  const index = items.findIndex((i) => i.slug === slug);
  const item = index >= 0 ? items[index] : undefined;

  // The index page, the formulary, and any slug the reader cannot resolve: no
  // chrome, and the page keeps its own `h1`.
  if (!slug || BARE_GUIDE_SLUGS.has(slug) || !item) return <>{children}</>;

  const previous = index > 0 ? items[index - 1] : undefined;
  const next = index < items.length - 1 ? items[index + 1] : undefined;
  // Categories are authored most-beginner first, so the first one is the level
  // a reader arriving at this guide is most likely studying for.
  const practiceCategory = item.categories[0] ?? '3';

  return (
    <div data-guide-shell>
      {/* Full bleed: the band breaks out of the centred <main> to the viewport
          edges, while its contents stay on the page's own grid. */}
      <header className="relative left-1/2 -ml-[50vw] mb-9 w-screen border-b border-stone-200 bg-stone-50 py-7 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <nav aria-label={t('breadcrumb')} className="mb-2.5 text-[13px] text-stone-600 dark:text-slate-400">
              <Link href="/aprender" className="no-underline hover:underline">
                {t('breadcrumb')}
              </Link>
              <span className="mx-1.5 text-stone-400 dark:text-slate-600">/</span>
              <span>{item.title}</span>
            </nav>
            <h1 className="m-0 text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.35rem]">
              {item.title}
            </h1>
            <div aria-hidden="true" className="mt-4 h-[3px] w-[72px] bg-brand-500" />
            {item.description && (
              <p className="mt-3.5 text-[17px] leading-relaxed text-stone-600 dark:text-slate-400">
                {item.description}
              </p>
            )}
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-x-9 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
            <Datum label={t('categories')} value={item.categories.join(' · ')} />
            <Datum label={t('readTime')} value={t('readTimeValue', { minutes: item.readTime ?? 1 })} />
            {sections.length > 0 && <Datum label={t('sections')} value={String(sections.length)} />}
            <Datum
              label={t('position')}
              value={t('positionValue', { index: index + 1, total: items.length })}
            />
          </dl>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-14">
        <div className="min-w-0">
          {sections.length > 0 && (
            <details className="mb-8 rounded-lg border border-stone-200 px-4 py-3 lg:hidden dark:border-slate-800">
              <summary className="cursor-pointer text-sm font-semibold">{t('onThisPage')}</summary>
              <ul className="mt-3 flex list-none flex-col gap-2.5 p-0">
                {sections.map((s) => (
                  <li key={s.id} className="m-0 p-0">
                    <a
                      href={`#${s.id}`}
                      className="flex gap-2.5 text-sm text-stone-600 no-underline dark:text-slate-400"
                    >
                      {s.number && (
                        <span className="w-5 shrink-0 text-right tabular-nums text-stone-400 dark:text-slate-600">
                          {s.number}
                        </span>
                      )}
                      <span>{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {children}

          {(previous || next) && (
            <nav
              aria-label={t('otherGuides')}
              className="mt-12 flex flex-col gap-3 border-t border-stone-200 pt-8 sm:flex-row dark:border-slate-800"
            >
              {previous && (
                <Link
                  href={`/aprender/${previous.slug}`}
                  className="flex-1 rounded-lg border border-stone-200 px-4 py-3 no-underline transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <span className={`block ${LABEL}`}>{t('previous')}</span>
                  <span className="mt-1 block text-[15px] font-semibold">{previous.title}</span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/aprender/${next.slug}`}
                  className="flex-1 rounded-lg border border-stone-200 px-4 py-3 text-left no-underline transition-colors hover:border-stone-300 hover:bg-stone-50 sm:text-right dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <span className={`block ${LABEL}`}>{t('next')}</span>
                  <span className="mt-1 block text-[15px] font-semibold">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <GuideToc
              sections={sections}
              activeId={activeId}
              items={items}
              currentSlug={slug}
              practiceCategory={practiceCategory}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
