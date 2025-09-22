"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import QuestionCard from "@components/QuestionCard";
import { Category } from "../../../../lib/types";
import { loadData } from "../../../../lib/data";
import { useCalculators } from "@components/providers/CalculatorProvider";

const DEFAULT_CATEGORY = "3";

function createOrder(count: number, avoid?: number): number[] {
  const indices = Array.from({ length: count }, (_, idx) => idx);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  if (avoid !== undefined && indices.length > 1 && indices[0] === avoid) {
    const swapIndex = 1;
    indices[0] = indices[swapIndex];
    indices[swapIndex] = avoid;
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
        ? rawCategory[0]
        : DEFAULT_CATEGORY;

  const [category, setCategory] = useState<Category | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const { openOhms } = useCalculators();

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
    if (code === "OHMCALC") {
      openOhms();
    }
  }, [openOhms]);

  const currentQuestion =
    category && order.length > 0 ? category.questions[order[cursor]] : null;

  const handleSelect = (choice: number) => {
    if (selectedOption !== undefined) {
      return;
    }
    setSelectedOption(choice);
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
      const nextOrder = createOrder(category.questions.length, order[cursor]);
      setOrder(nextOrder);
      setCursor(0);
    }
    setSelectedOption(undefined);
  };

  if (isLoading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!category) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Flashcards</h1>
        <p className="text-gray-600">
          We could not find category {catId}. Try choosing a category from the Browse menu.
        </p>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Flashcards {category.name}</h1>
        <p className="text-gray-600">
          There are no questions available for this category yet.
        </p>
      </main>
    );
  }

  const ended = selectedOption !== undefined;
  const sessionPosition = cursor + 1;

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Flashcards {category.name}</h1>
        <p className="text-sm text-gray-600">
          Practice one random question at a time. Reviewed {answeredCount} so far.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Card {sessionPosition} of {category.questions.length} in this round.
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
            Next question
          </button>
        </div>
      )}
    </main>
  );
}
