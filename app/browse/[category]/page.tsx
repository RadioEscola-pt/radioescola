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
    <main className="p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t('title', { id: categoryId })}</h1>
      </div>
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
            showId
            showCalcHint
            onLaunchCalculator={handleLaunchCalculator}
            ended={isAnswered}
          />
        );
      })}
    </main>
  );
}
