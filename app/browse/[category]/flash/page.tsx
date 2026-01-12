"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QuestionCard from "@/components/QuestionCard";
import { Category } from "@/lib/types";
import { loadData } from "@/lib/data";
import { useCalculators } from "@/components/providers/CalculatorProvider";
import { PageLoading } from "@/components/shared/Loading";
import type { CalculatorCode } from "@/lib/types";
import { useProgressContext } from "@/components/providers/ProgressProvider";

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
  const { recordQuestion } = useProgressContext();
  const t = useTranslations("Browse");

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

  const handleLaunchCalculator = useCallback((code: string) => {
    openCalculator(code as CalculatorCode);
  }, [openCalculator]);

  const orderIndex = order[cursor];
  const currentQuestion =
    category && order.length > 0 && orderIndex !== undefined
      ? category.questions[orderIndex] ?? null
      : null;

  const handleSelect = (choice: number) => {
    if (selectedOption !== undefined || !currentQuestion) {
      return;
    }
    setSelectedOption(choice);
    // Record question attempt for progress tracking
    recordQuestion({
      questionId: currentQuestion.id,
      category: catId,
      correct: choice === currentQuestion.correctIndex,
      timestamp: Date.now(),
    });
  };

  const handleNext = () => {
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
  };

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
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("flashTitle", { id: catId })}</h1>
        <p className="text-sm text-gray-600">
          {t("flashSubtitle", { count: answeredCount })}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t("flashCard", { position: sessionPosition, total: category.questions.length })}
        </p>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedOption={selectedOption}
        onSelect={handleSelect}
        showImage
        indexNumber={sessionPosition}
        showCalcHint
        onLaunchCalculator={handleLaunchCalculator}
        ended={ended}
      />

      {ended && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("flashNext")}
          </button>
        </div>
      )}
    </main>
  );
}
