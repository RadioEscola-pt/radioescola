"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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

export default function BrowsePage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const categoryId = typeof params.category === 'string'
    ? params.category
    : Array.isArray(params.category)
      ? params.category[0] ?? '3'
      : '3';
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { openCalculator } = useCalculators();
  const { recordQuestionWithGamification, progress, refreshProgress } = useProgressContext();
  const t = useTranslations('Browse');

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
      setCategory(data.categories[categoryId] ?? null);
    });
  }, [categoryId]);

  // Questions load after the native anchor scroll would have fired, so honor
  // #q-{id} links (e.g. from the dashboard's weak areas) once they render.
  useEffect(() => {
    if (!category) return;
    const hash = window.location.hash;
    if (/^#q-\d+$/.test(hash)) {
      document.querySelector(hash)?.scrollIntoView();
    }
  }, [category]);

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
      <section className="sm:px-0">
        {category.questions.map((q, idx) => {
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
                showCalcHint
                onLaunchCalculator={handleLaunchCalculator}
                ended={isAnswered}
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
