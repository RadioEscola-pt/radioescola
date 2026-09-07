"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';
import { loadData } from '@/lib/data';
import QuestionCard from '@/components/QuestionCard';
import { useCalculators } from '@/components/providers/CalculatorProvider';
import { PageLoading } from '@/components/shared/Loading';
import { StudyHeader } from '@/components/StudyHeader';
import type { CalculatorCode } from '@/lib/types';
import { useProgressContext } from '@/components/providers/ProgressProvider';
import { toggleBookmark } from '@/lib/storage/localStorage';
import { QuestionFilters, useTopicCounts } from '@/components/QuestionFilters';
import { questionMatches } from '@/lib/utils';
import { isTopicSlug } from '@/lib/config';
import {
  ORDER_PARAM,
  browseHref,
  dealRanks,
  isRandomOrder,
  orderQuestions,
  type QuestionRanks,
} from '@/lib/browse/order';

export default function BrowsePage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [ranks, setRanks] = useState<QuestionRanks | null>(null);
  const categoryId = typeof params.category === 'string'
    ? params.category
    : Array.isArray(params.category)
      ? params.category[0] ?? '3'
      : '3';
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { openCalculator } = useCalculators();
  const { recordQuestionWithGamification, progress, refreshProgress } = useProgressContext();
  const t = useTranslations('Browse');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  // The topic and the order live in the URL so the dashboard can link straight
  // to a weak area and a shuffled page can be shared; the search does not,
  // because a query is a passing question and pushing one per keystroke would
  // bury the back button.
  const topicParam = searchParams.get('topic');
  const activeTopic = topicParam && isTopicSlug(topicParam) ? topicParam : null;
  const randomOrder = isRandomOrder(searchParams.get(ORDER_PARAM));

  // Either control has to carry the other's state through the URL.
  const navigate = useCallback((next: { topic?: string | null; random?: boolean }) => {
    router.push(browseHref(categoryId, { topic: activeTopic, random: randomOrder, ...next }));
  }, [router, categoryId, activeTopic, randomOrder]);

  const setTopic = useCallback(
    (slug: string | null) => navigate({ topic: slug }),
    [navigate]
  );
  const setRandomOrder = useCallback(
    (on: boolean) => navigate({ random: on }),
    [navigate]
  );

  const isBookmarked = useCallback((questionId: number) => {
    const key = `cat${categoryId}_${questionId}`;
    return progress?.questionStats[key]?.bookmarked ?? false;
  }, [progress, categoryId]);

  const getQuestionDifficultyStats = useCallback((questionId: number) => {
    const key = `cat${categoryId}_${questionId}`;
    const stats = progress?.questionStats[key];
    if (!stats || stats.attempts === 0) return { successRate: undefined, attemptCount: 0 };
    return {
      successRate: (stats.correct / stats.attempts) * 100,
      attemptCount: stats.attempts,
    };
  }, [progress, categoryId]);

  const handleToggleBookmark = useCallback(async (questionId: number) => {
    await toggleBookmark(categoryId, questionId);
    await refreshProgress();
  }, [categoryId, refreshProgress]);

  useEffect(() => {
    loadData().then((data) => {
      const loaded = data.categories[categoryId] ?? null;
      setCategory(loaded);
      // Dealt on load rather than when the toggle flips: the order is a
      // property of the visit, so turning it off to look something up and back
      // on again lands on the page you left, and a reload is the reshuffle.
      setRanks(loaded ? dealRanks(loaded.questions.map((q) => q.id)) : null);
    });
  }, [categoryId]);

  // Search narrows the set the chips describe; the topic then narrows that.
  const searched = useMemo(
    () => (category ? category.questions.filter((q) => questionMatches(q, search)) : []),
    [category, search]
  );
  const counts = useTopicCounts(searched);
  const visible = useMemo(
    () => (activeTopic ? searched.filter((q) => q.materia === activeTopic) : searched),
    [searched, activeTopic]
  );
  // Matches outside the active topic, to tell an empty result which of the two
  // conditions is the one to drop.
  const elsewhere = searched.length - visible.length;
  // Ordering last: it reorders what survived the filters, never what they see.
  const ordered = useMemo(
    () => orderQuestions(visible, randomOrder ? ranks : null),
    [visible, randomOrder, ranks]
  );

  // Questions load after the native anchor scroll would have fired, so honor
  // #q-{id} links (e.g. from the dashboard's weak areas) once they render.
  useEffect(() => {
    if (!category) return;
    const hash = window.location.hash;
    if (!/^#q-\d+$/.test(hash)) return;
    // A deep link means "show me this question". A topic in the URL could be
    // hiding it, and the scroll would then fail silently, so the link wins and
    // the topic is dropped — replace, not push, so back still leaves the page.
    // The search box needs no such handling: it starts empty on every
    // navigation, so it cannot be stale when a hash arrives.
    if (activeTopic) {
      router.replace(browseHref(categoryId, { random: randomOrder }));
      return;
    }
    document.querySelector(hash)?.scrollIntoView();
  }, [category, activeTopic, randomOrder, router, categoryId]);

  const handleLaunchCalculator = useCallback((code: string) => {
    openCalculator(code as CalculatorCode);
  }, [openCalculator]);

  if (!category) {
    return <PageLoading message={t('loading')} />;
  }

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <StudyHeader
        categoryId={categoryId}
        mode="browse"
        backHref="/"
        subtitle={t("questionCount", { count: category.questions.length })}
      />
      <QuestionFilters
        counts={counts}
        total={searched.length}
        bankTotal={category.questions.length}
        activeTopic={activeTopic}
        onTopicChange={setTopic}
        search={search}
        onSearchChange={setSearch}
        randomOrder={randomOrder}
        onRandomOrderChange={setRandomOrder}
      />
      <section className="sm:px-0">
        {visible.length === 0 && (
          <div className="px-4 py-12 text-center sm:px-0">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('emptyTitle')}</p>
            {elsewhere > 0 && activeTopic ? (
              <>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {t('emptyElsewhere', { count: elsewhere })}
                </p>
                <button
                  type="button"
                  onClick={() => setTopic(null)}
                  className="mt-4 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                >
                  {t('emptySearchAll')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {t('emptyClear')}
              </button>
            )}
          </div>
        )}
        {ordered.map((q) => {
          // Position in the unfiltered bank: a question keeps one number in
          // every view, so it stays something you can refer to and link to.
          const idx = category.questions.indexOf(q);
          const selected = answers[q.id];
          const isAnswered = selected !== undefined;
          const difficultyStats = getQuestionDifficultyStats(q.id);
          return (
            <div key={q.id} id={`q-${q.id}`} className="scroll-mt-20">
              <QuestionCard
                question={q}
                selectedOption={selected}
                onSelect={(choice) => {
                  setAnswers((prev) => {
                    if (Object.prototype.hasOwnProperty.call(prev, q.id)) return prev;
                    // Record question attempt (+ XP / daily goals) for progress tracking
                    recordQuestionWithGamification({
                      questionId: q.id,
                      category: categoryId,
                      correct: choice === q.correctIndex,
                      timestamp: Date.now(),
                    });
                    return { ...prev, [q.id]: choice };
                  });
                }}
                showImage
                indexNumber={idx + 1}
                highlight={search}
                showCalcHint
                onLaunchCalculator={handleLaunchCalculator}
                ended={isAnswered}
                categoryId={categoryId}
                showBookmark
                isBookmarked={isBookmarked(q.id)}
                onToggleBookmark={() => handleToggleBookmark(q.id)}
                successRate={difficultyStats.successRate}
                attemptCount={difficultyStats.attemptCount}
              />
            </div>
          );
        })}
      </section>
    </main>
  );
}
