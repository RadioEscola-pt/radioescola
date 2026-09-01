"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TOPICS, topicShortLabel } from "@/lib/config";
import { TopicIcon } from "@/components/TopicIcon";

export type TopicCount = { slug: string; label: string; count: number };

interface QuestionFiltersProps {
  /** Per-topic counts over the *current search results*, not the whole bank. */
  counts: TopicCount[];
  total: number;
  bankTotal: number;
  activeTopic: string | null;
  onTopicChange: (slug: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const CHIP =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500";
const CHIP_OFF =
  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
const CHIP_ON = "bg-amber-500 text-slate-900";

/**
 * Search field plus one chip per topic, sitting under StudyHeader.
 *
 * Counts come from the search results rather than the bank, so with a term
 * typed the chips stop being a menu and become a distribution: searching cat 3
 * for "antena" shows that only four of the thirteen matches live in Antenas.
 */
export function QuestionFilters({
  counts, total, bankTotal, activeTopic, onTopicChange, search, onSearchChange,
}: QuestionFiltersProps) {
  const t = useTranslations("Browse");

  return (
    <div className="sticky top-[6.25rem] z-10 mb-4 border-b border-slate-200/60 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/80">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-amber-400 dark:border-slate-700 dark:bg-slate-800">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={t("searchClear")}
              className="shrink-0 rounded text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {total === bankTotal ? bankTotal : t("resultCount", { shown: total, total: bankTotal })}
        </span>
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onTopicChange(null)}
          aria-pressed={activeTopic === null}
          className={`${CHIP} ${activeTopic === null ? CHIP_ON : CHIP_OFF}`}
        >
          {t("topicAll")}
          <span className="font-mono text-[10px] tabular-nums opacity-60">{total}</span>
        </button>
        {counts.map(({ slug, label, count }) => (
          <button
            key={slug}
            type="button"
            onClick={() => onTopicChange(slug)}
            aria-pressed={activeTopic === slug}
            className={`${CHIP} ${activeTopic === slug ? CHIP_ON : CHIP_OFF}`}
          >
            <TopicIcon slug={slug} colored className="w-3.5 h-3.5 shrink-0" />
            {label}
            <span className="font-mono text-[10px] tabular-nums opacity-60">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Topic counts over a set of questions, ordered by count.
 *
 * Topics with nothing in them are dropped rather than shown at zero — cat 1
 * has a single safety question, and an empty chip is an invitation to a blank
 * screen.
 */
export function topicCounts(
  questions: { materia?: string | null }[],
  locale: string
): TopicCount[] {
  const tally = new Map<string, number>();
  for (const q of questions) {
    if (!q.materia) continue;
    tally.set(q.materia, (tally.get(q.materia) ?? 0) + 1);
  }
  return TOPICS.flatMap((topic) => {
    const count = tally.get(topic.slug) ?? 0;
    if (count === 0) return [];
    const label = topicShortLabel(topic.slug, locale);
    return label ? [{ slug: topic.slug, label, count }] : [];
  }).sort((a, b) => b.count - a.count);
}

/** Convenience for callers that already have the locale from context. */
export function useTopicCounts(questions: { materia?: string | null }[]) {
  const locale = useLocale();
  return React.useMemo(() => topicCounts(questions, locale), [questions, locale]);
}
