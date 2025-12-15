"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';
import { loadData } from '@/lib/data';
import QuestionCard from '@/components/QuestionCard';
import { useCalculators } from '@/components/providers/CalculatorProvider';
import { PageLoading } from '@/components/shared/Loading';
import type { CalculatorCode } from '@/lib/types';

export default function BrowsePage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryId, setCategoryId] = useState<string>('3');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { openCalculator } = useCalculators();
  const t = useTranslations('Browse');

  useEffect(() => {
    const cat = typeof params.category === 'string'
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0] ?? '3'
        : '3';
    setCategoryId(cat);
    loadData().then((data) => {
      setCategory(data.categories[cat] ?? null);
    });
  }, [params.category]);

  const handleLaunchCalculator = useCallback((code: string) => {
    openCalculator(code as CalculatorCode);
  }, [openCalculator]);

  if (!category) {
    return <PageLoading message={t('loading')} />;
  }

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <div className="px-4 sm:px-0 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('title', { id: categoryId })}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {category.questions.length} {category.questions.length === 1 ? 'question' : 'questions'}
        </p>
      </div>
      <section className="sm:px-0">
        {category.questions.map((q, idx) => {
          const selected = answers[q.id];
          const isAnswered = selected !== undefined;
          return (
            <QuestionCard
              key={q.id}
              question={q}
              selectedOption={selected}
              onSelect={(choice) => {
                setAnswers((prev) => {
                  if (Object.prototype.hasOwnProperty.call(prev, q.id)) return prev;
                  return { ...prev, [q.id]: choice };
                });
              }}
              showImage
              indexNumber={idx + 1}
              showCalcHint
              onLaunchCalculator={handleLaunchCalculator}
              ended={isAnswered}
            />
          );
        })}
      </section>
    </main>
  );
}
