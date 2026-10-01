"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { StudyItem } from '@/lib/config/study-guides';
import type { CategoryId } from '@/lib/config/categories';
import { GUIDE_SECTIONS, sectionNeededFor } from '@/lib/config/guide-sections';
import { useReaderCategory } from '@/lib/reader-category';

export type Section = { id: string; number: string | null; label: string };

/** `## 3. As quatro classes` and `## 5.1 Diagramas de blocos` both split here. */
const NUMBERED = /^(\d+(?:\.\d+)?)\.?\s+([\s\S]*)$/;

function splitHeading(text: string): { number: string | null; label: string } {
  const m = NUMBERED.exec(text.trim());
  return m && m[1] && m[2] ? { number: m[1], label: m[2] } : { number: null, label: text.trim() };
}

/**
 * The section list is read from the rendered article, not from a manifest: the
 * guides are MDX and their headings are the only place the structure exists.
 * `rehype-slug` supplies the ids server-side, so the anchors work before this
 * ever mounts; what mounting adds is the list itself and the active marker.
 */
export function useGuideSections(slug: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the headings exist only in the rendered DOM
    setActiveId(null);
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('article.prose h2[id]')
    );
    setSections(
      headings.map((h) => {
        // `mdx-components.tsx` has already lifted the number out of numbered
        // headings, and `textContent` glues the two spans back together
        // without the separator, so read the parts rather than reparse them.
        const number = h.querySelector('.guide-h2-number')?.textContent?.trim();
        const label = h.querySelector('.guide-h2-text')?.textContent?.trim();
        if (number && label) return { id: h.id, number, label };
        return { id: h.id, ...splitHeading(h.textContent ?? '') };
      })
    );

    if (headings.length === 0) return;

    // The last heading scrolled past, so the marker holds through the body of a
    // section instead of going blank between two headings.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 96; // clears the sticky navigation bar
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
      }
      setActiveId(current ?? headings[0]?.id ?? null);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [slug]);

  return { sections, activeId };
}

/** Guides this one links to in its prose, titled from the guide index. */
function useLinkedGuides(items: StudyItem[], currentSlug: string) {
  const [linked, setLinked] = useState<StudyItem[]>([]);

  useEffect(() => {
    const hrefs = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('article.prose a[href^="/aprender/"]')
    ).map((a) => a.getAttribute('href') ?? '');

    const slugs = new Set(
      hrefs
        .map((href) => href.replace(/^\/aprender\/?/, '').replace(/[#?].*$/, '').replace(/\/$/, ''))
        .filter((slug) => slug && slug !== currentSlug)
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect -- the links exist only in the rendered DOM
    setLinked(items.filter((i) => slugs.has(i.slug)));
  }, [items, currentSlug]);

  return linked;
}

const LABEL = 'text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500';

export default function GuideToc({
  sections,
  activeId,
  items,
  currentSlug,
  practiceCategory,
}: {
  sections: Section[];
  activeId: string | null;
  items: StudyItem[];
  currentSlug: string;
  practiceCategory: string;
}) {
  const t = useTranslations('Study.guide');
  const linked = useLinkedGuides(items, currentSlug);
  const reader = useReaderCategory();

  /**
   * A categoria mínima de cada secção, pela ordem em que as secções aparecem no
   * ficheiro, que é a mesma em que o `rehype-slug` as numera no DOM. Só se
   * marca quem já escolheu uma categoria: sem escolha não se presume nível
   * nenhum, e nada aqui esconde matéria, apenas a assinala.
   */
  const declared = GUIDE_SECTIONS[currentSlug] ?? [];
  const mark = (index: number): CategoryId | null => {
    if (!reader) return null;
    const min = declared[index]?.min ?? null;
    return min && !sectionNeededFor(min, reader) ? min : null;
  };

  return (
    <div className="flex flex-col gap-7">
      {sections.length > 0 && (
        <nav aria-label={t('onThisPage')}>
          <p className={LABEL}>{t('onThisPage')}</p>
          <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
            {sections.map((s, index) => {
              const active = s.id === activeId;
              const beyond = mark(index);
              return (
                <li key={s.id} className="m-0 p-0">
                  <a
                    href={`#${s.id}`}
                    aria-current={active ? 'true' : undefined}
                    className={`flex gap-2.5 text-sm no-underline transition-colors ${
                      active
                        ? 'font-semibold text-brand-700 dark:text-brand-300'
                        : beyond
                          ? 'text-stone-400 hover:text-stone-600 dark:text-slate-600 dark:hover:text-slate-400'
                          : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {s.number && (
                      <span
                        className={`w-4 shrink-0 text-right tabular-nums ${
                          active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 dark:text-slate-600'
                        }`}
                      >
                        {s.number}
                      </span>
                    )}
                    <span className={s.number ? '' : 'pl-[26px]'}>
                      {s.label}
                      {beyond && (
                        <span
                          className="ml-1.5 whitespace-nowrap rounded border border-stone-200 px-1 py-px align-[1px] text-[10px] font-semibold text-stone-500 dark:border-slate-700 dark:text-slate-500"
                          title={t('onlyFrom', { category: beyond })}
                        >
                          {t('categoryShort', { category: beyond })}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {linked.length > 0 && (
        <nav aria-label={t('linkedGuides')} className="border-t border-stone-200 pt-6 dark:border-slate-800">
          <p className={LABEL}>{t('linkedGuides')}</p>
          <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
            {linked.map((g) => (
              <li key={g.slug} className="m-0 p-0">
                <Link
                  href={`/aprender/${g.slug}`}
                  className="text-sm text-brand-700 no-underline hover:underline dark:text-brand-300"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="border-t border-stone-200 pt-6 dark:border-slate-800">
        <p className={LABEL}>{t('practiceLabel')}</p>
        <Link
          href={`/browse/${practiceCategory}`}
          className="mt-3 block rounded-lg bg-brand-700 px-3 py-3 text-center text-[15px] font-semibold text-white no-underline transition-colors hover:bg-brand-800"
        >
          {t('practiceCta', { category: practiceCategory })}
        </Link>
      </div>
    </div>
  );
}
