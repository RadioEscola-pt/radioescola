"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { GUIDE_ACCENTS, guideVisual } from '@/lib/config/study-guides';
import { useStudyItem } from '@/hooks/useStudyItem';
import {
  RESOURCE_ROW, RESOURCE_TILE, RESOURCE_TITLE, RESOURCE_SUBTITLE, RESOURCE_CHEVRON,
} from '@/components/ui/resource-row';

interface StudyGuideLinkProps {
  /** Guide slug, matching a folder under app/study/. */
  slug: string;
  /** Localized "N min" formatter. */
  readTimeLabel: (minutes: number) => string;
}

/** Last-resort title when the slug is not in the index: "codigo-de-cores" -> "Codigo de cores". */
function humanize(slug: string) {
  const words = slug.replace(/[-_]/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * A Study Library guide, offered from the answer reveal.
 *
 * Deliberately NOT a card: the question it sits in is already one, and a
 * bordered box inside a bordered box reads as debris. It is a row instead,
 * flush with the card's text, earning its affordance from the accent tile, the
 * chevron and a hover fill that bleeds to the card padding.
 */
const StudyGuideLink: React.FC<StudyGuideLinkProps> = ({ slug, readTimeLabel }) => {
  const { item, loading } = useStudyItem(slug);
  const { icon: Icon, accent } = guideVisual(slug);
  const title = item?.title ?? humanize(slug);

  return (
    <Link
      href={`/study/${slug}`}
      className={`group ${RESOURCE_ROW}`}
    >
      <span
        className={`${RESOURCE_TILE} ${GUIDE_ACCENTS[accent]}`}
        aria-hidden="true"
      >
        <Icon className="h-4.5 w-4.5" />
      </span>

      <span className="min-w-0 flex-1">
        {loading ? (
          <span className="block h-3.5 w-40 max-w-full animate-pulse motion-reduce:animate-none rounded bg-slate-200 dark:bg-slate-700" />
        ) : (
          <span className={RESOURCE_TITLE}>{title}</span>
        )}
        {item?.description && (
          <span className={RESOURCE_SUBTITLE}>{item.description}</span>
        )}
      </span>

      {item?.readTime ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="h-3 w-3" />
          {readTimeLabel(item.readTime)}
        </span>
      ) : null}
      <ChevronRight className={RESOURCE_CHEVRON} />
    </Link>
  );
};

export default StudyGuideLink;
