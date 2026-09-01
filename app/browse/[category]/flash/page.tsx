"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QuestionCard from "@/components/QuestionCard";
import { Category } from "@/lib/types";
import { loadData } from "@/lib/data";
import { useCalculators } from "@/components/providers/CalculatorProvider";
import { PageLoading } from "@/components/shared/Loading";
import { StudyHeader } from "@/components/StudyHeader";
import type { CalculatorCode } from "@/lib/types";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toggleBookmark } from "@/lib/storage/localStorage";

const DEFAULT_CATEGORY = "3";

function createOrder(count: number, avoid?: number): number[] {
  const indices = Array.from({ length: count }, (_, idx) => idx);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const idxI = indices[i];
    const idxJ = indices[j];
    if (idxI !== undefined && idxJ !== undefined) {
      indices[i] = idxJ;
      indices[j] = idxI;
    }
  }
  const first = indices[0];
  const second = indices[1];
  if (avoid !== undefined && indices.length > 1 && first === avoid && second !== undefined) {
    indices[0] = second;
    indices[1] = avoid;
  }
  return indices;
}

export default function FlashBrowsePage() {
  const params = useParams();
  const rawCategory = params?.category;
  const catId =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
        ? rawCategory[0] ?? DEFAULT_CATEGORY
        : DEFAULT_CATEGORY;

  const [category, setCategory] = useState<Category | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const { openCalculator } = useCalculators();
  const { recordQuestionWithGamification, progress, refreshProgress } = useProgressContext();
  const t = useTranslations("Browse");

  const isBookmarked = useCallback((questionId: number) => {
    const key = `cat${catId}_${questionId}`;
    return progress?.questionStats[key]?.bookmarked ?? false;
  }, [progress, catId]);

  const getQuestionDifficultyStats = useCallback((questionId: number) => {
    const key = `cat${catId}_${questionId}`;
    const stats = progress?.questionStats[key];
    if (!stats || stats.attempts === 0) return { successRate: undefined, attemptCount: 0 };
    return {
      successRate: (stats.correct / stats.attempts) * 100,
      attemptCount: stats.attempts,
    };
  }, [progress, catId]);

  const handleToggleBookmark = useCallback(async (questionId: number) => {
    await toggleBookmark(catId, questionId);
    await refreshProgress();
  }, [catId, refreshProgress]);

  useEffect(() => {
    let active = true;

    async function fetchCategory() {
      setIsLoading(true);
      try {
        const data = await loadData();
        if (!active) {
          return;
        }
        setCategory(data.categories[catId] ?? null);
      } catch (err) {
        if (!active) {
          return;
        }
        setCategory(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchCategory();

    return () => {
      active = false;
    };
  }, [catId]);

  useEffect(() => {
    if (!category || category.questions.length === 0) {
      setOrder([]);
      setCursor(0);
      setSelectedOption(undefined);
      setAnsweredCount(0);
      return;
    }
    setOrder(createOrder(category.questions.length));
    setCursor(0);
    setSelectedOption(undefined);
    setAnsweredCount(0);
  }, [category]);

  // Answering scrolls the page down to the explanation, so a new card has to be
  // brought back into view. `order` is in the deps because finishing a round
  // reshuffles it while leaving the cursor at 0. The jump is instant on purpose:
  // a smooth scroll is animated over the *next* card, which is usually shorter
  // than the answered one, and gets clamped to its new bottom on the way up.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [cursor, order]);

  const handleLaunchCalculator = useCallback((code: string) => {
    openCalculator(code as CalculatorCode);
  }, [openCalculator]);

  const orderIndex = order[cursor];
  const currentQuestion =
    category && order.length > 0 && orderIndex !== undefined
      ? category.questions[orderIndex] ?? null
      : null;

  const handleSelect = useCallback((choice: number) => {
    if (selectedOption !== undefined || !currentQuestion) {
      return;
    }
    setSelectedOption(choice);
    // Record question attempt (+ XP / daily goals) for progress tracking
    recordQuestionWithGamification({
      questionId: currentQuestion.id,
      category: catId,
      correct: choice === currentQuestion.correctIndex,
      timestamp: Date.now(),
    });
  }, [selectedOption, currentQuestion, recordQuestionWithGamification, catId]);

  const handleNext = useCallback(() => {
    if (!category || order.length === 0) {
      return;
    }
    setAnsweredCount((prev) => prev + 1);
    const nextIndex = cursor + 1;
    if (nextIndex < order.length) {
      setCursor(nextIndex);
    } else {
      const currentOrderIndex = order[cursor];
      const nextOrder = createOrder(category.questions.length, currentOrderIndex);
      setOrder(nextOrder);
      setCursor(0);
    }
    setSelectedOption(undefined);
  }, [category, order, cursor]);

  // Keyboard shortcuts for flashcard navigation
  const handleAnswer = useCallback((index: number) => {
    if (selectedOption === undefined && currentQuestion) {
      handleSelect(index);
    }
  }, [selectedOption, currentQuestion, handleSelect]);

  const handleRevealOrNext = useCallback(() => {
    if (selectedOption !== undefined) {
      handleNext();
    }
  }, [selectedOption, handleNext]);

  useKeyboardShortcuts({
    onAnswer1: () => handleAnswer(0),
    onAnswer2: () => handleAnswer(1),
    onAnswer3: () => handleAnswer(2),
    onAnswer4: () => handleAnswer(3),
    onReveal: handleRevealOrNext,
    enabled: !isLoading && !!currentQuestion,
  });

  if (isLoading) {
    return <PageLoading message={t("flashLoading")} />;
  }

  if (!category) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">{t("flashTitle", { id: catId })}</h1>
        <p className="text-gray-600">
          {t("flashNotFound", { id: catId })}
        </p>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">{t("flashTitle", { id: catId })}</h1>
        <p className="text-gray-600">
          {t("flashNoQuestions")}
        </p>
      </main>
    );
  }

  const ended = selectedOption !== undefined;
  const sessionPosition = cursor + 1;

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <StudyHeader
        categoryId={catId}
        mode="flash"
        backHref={`/browse/${catId}`}
        subtitle={t("flashCard", { position: sessionPosition, total: category.questions.length })}
      >
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          {t("flashReviewed", { count: answeredCount })}
        </span>
      </StudyHeader>

      <section className="sm:px-0">
      <QuestionCard
        question={currentQuestion}
        selectedOption={selectedOption}
        onSelect={handleSelect}
        showImage
        indexNumber={sessionPosition}
        showCalcHint
        onLaunchCalculator={handleLaunchCalculator}
        ended={ended}
        categoryId={catId}
        showBookmark
        isBookmarked={isBookmarked(currentQuestion.id)}
        onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
        successRate={getQuestionDifficultyStats(currentQuestion.id).successRate}
        attemptCount={getQuestionDifficultyStats(currentQuestion.id).attemptCount}
      />

      {ended && (
        <div className="flex justify-end mt-4 px-4 sm:px-0">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center rounded-md bg-amber-500 hover:bg-amber-400 px-4 py-2 text-slate-900 text-sm font-semibold transition-colors"
          >
            {t("flashNext")}
          </button>
        </div>
      )}
      </section>
    </main>
  );
}
