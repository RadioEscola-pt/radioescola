"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Timer, Zap, RotateCcw, Home, CheckCircle2, XCircle } from "lucide-react";
import { loadData } from "@/lib/data";
import { CATEGORIES } from "@/lib/config";
import { DRILL_CONFIG } from "@/lib/config/drill";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { PageLoading } from "@/components/shared/Loading";
import { AnswerOption, type AnswerOptionState } from "@/components/ui/answer-option";
import type { Question, Data } from "@/lib/types";

type DrillState = "setup" | "active" | "complete";

interface DrillQuestion {
  question: Question;
  categoryId: string;
  answered: boolean;
  selectedOption?: number;
  correct?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const itemI = shuffled[i];
    const itemJ = shuffled[j];
    if (itemI !== undefined && itemJ !== undefined) {
      shuffled[i] = itemJ;
      shuffled[j] = itemI;
    }
  }
  return shuffled;
}

export default function DrillPage() {
  const t = useTranslations("Drill");
  const { recordQuestion, recordDrillComplete } = useProgressContext();

  const [data, setData] = useState<Data | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [drillState, setDrillState] = useState<DrillState>("setup");
  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(DRILL_CONFIG.DURATION_SECONDS);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [xpEarned, setXpEarned] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completionRecordedRef = useRef(false);
  const recordDrillCompleteRef = useRef(recordDrillComplete);
  const recordQuestionRef = useRef(recordQuestion);

  // Keep the refs updated
  useEffect(() => {
    recordDrillCompleteRef.current = recordDrillComplete;
    recordQuestionRef.current = recordQuestion;
  }, [recordDrillComplete, recordQuestion]);

  // Load data
  useEffect(() => {
    loadData().then(setData);
  }, []);

  // Timer logic
  useEffect(() => {
    if (drillState !== "active") return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto finish
          if (timerRef.current) clearInterval(timerRef.current);
          setDrillState("complete");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [drillState]);

  // Calculate results
  const results = useMemo(() => {
    const answered = drillQuestions.filter((q) => q.answered);
    const correct = answered.filter((q) => q.correct).length;
    const total = drillQuestions.length;
    const accuracy = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
    const isPerfect = correct === total && answered.length === total;
    const passed = correct >= DRILL_CONFIG.PASS_THRESHOLD;
    return { correct, total, accuracy, isPerfect, passed, answeredCount: answered.length };
  }, [drillQuestions]);

  // Record drill completion (only once)
  useEffect(() => {
    if (drillState === "complete" && results.answeredCount > 0 && !completionRecordedRef.current) {
      completionRecordedRef.current = true;
      recordDrillCompleteRef.current(results.correct, results.total).then((result) => {
        setXpEarned(result.xpGained);
      });
    }
  }, [drillState, results.answeredCount, results.correct, results.total]);

  const startDrill = useCallback(() => {
    if (!data) return;

    // Get questions from selected category or all categories
    let allQuestions: { question: Question; categoryId: string }[] = [];

    if (selectedCategory === "all") {
      for (const catId of CATEGORIES) {
        const category = data.categories[catId];
        if (category) {
          allQuestions.push(
            ...category.questions.map((q) => ({ question: q, categoryId: catId }))
          );
        }
      }
    } else {
      const category = data.categories[selectedCategory];
      if (category) {
        allQuestions = category.questions.map((q) => ({
          question: q,
          categoryId: selectedCategory,
        }));
      }
    }

    // Shuffle and pick questions
    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, DRILL_CONFIG.QUESTION_COUNT);

    setDrillQuestions(
      selected.map((item) => ({
        question: item.question,
        categoryId: item.categoryId,
        answered: false,
      }))
    );
    setCurrentIndex(0);
    setSelectedOption(undefined);
    setTimeRemaining(DRILL_CONFIG.DURATION_SECONDS);
    setDrillState("active");
    setXpEarned(0);
  }, [data, selectedCategory]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (selectedOption !== undefined) return;

      const currentQuestion = drillQuestions[currentIndex];
      if (!currentQuestion) return;

      const isCorrect = index === currentQuestion.question.correctIndex;
      setSelectedOption(index);

      // Record the answer (use ref to avoid dependency loop)
      recordQuestionRef.current({
        questionId: currentQuestion.question.id,
        category: currentQuestion.categoryId,
        correct: isCorrect,
        timestamp: Date.now(),
      });

      // Update drill questions
      setDrillQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex
            ? { ...q, answered: true, selectedOption: index, correct: isCorrect }
            : q
        )
      );
    },
    [currentIndex, drillQuestions, selectedOption]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= drillQuestions.length) {
      // Drill complete
      if (timerRef.current) clearInterval(timerRef.current);
      setDrillState("complete");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(undefined);
    }
  }, [currentIndex, drillQuestions.length]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Keyboard shortcuts
  const handleKeyboardAnswer = useCallback(
    (index: number) => {
      if (drillState === "active" && selectedOption === undefined) {
        handleSelectOption(index);
      }
    },
    [drillState, selectedOption, handleSelectOption]
  );

  const handleKeyboardNext = useCallback(() => {
    if (drillState === "active" && selectedOption !== undefined) {
      handleNext();
    }
  }, [drillState, selectedOption, handleNext]);

  useKeyboardShortcuts({
    onAnswer1: () => handleKeyboardAnswer(0),
    onAnswer2: () => handleKeyboardAnswer(1),
    onAnswer3: () => handleKeyboardAnswer(2),
    onAnswer4: () => handleKeyboardAnswer(3),
    onReveal: handleKeyboardNext,
    enabled: drillState === "active",
  });

  const resetDrill = useCallback(() => {
    setDrillState("setup");
    setDrillQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(undefined);
    setTimeRemaining(DRILL_CONFIG.DURATION_SECONDS);
    setXpEarned(0);
    completionRecordedRef.current = false;
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return t("timeRemaining", {
      minutes: mins.toString(),
      seconds: secs.toString().padStart(2, "0"),
    });
  };

  const getOptionState = (idx: number): AnswerOptionState => {
    const currentQuestion = drillQuestions[currentIndex];
    if (!currentQuestion) return "default";

    const isSelected = selectedOption === idx;
    const isCorrect = idx === currentQuestion.question.correctIndex;
    const isAnswered = selectedOption !== undefined;

    if (isAnswered) {
      if (isCorrect) return "correct";
      if (isSelected) return "incorrect";
      return "default";
    }
    return "default";
  };

  if (!data) {
    return <PageLoading message="Loading..." />;
  }

  // Setup screen
  if (drillState === "setup") {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-4">
            <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{t("subtitle")}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t("selectCategory")}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">{t("allCategories")}</option>
            {CATEGORIES.map((catId) => (
              <option key={catId} value={catId}>
                {t("category", { id: catId })}
              </option>
            ))}
          </select>

          <button
            onClick={startDrill}
            className="w-full mt-6 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="h-5 w-5" />
            {t("startDrill")}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {DRILL_CONFIG.QUESTION_COUNT}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Questions</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {Math.floor(DRILL_CONFIG.DURATION_SECONDS / 60)}:00
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Time Limit</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{DRILL_CONFIG.XP_COMPLETION}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">XP</p>
          </div>
        </div>
      </main>
    );
  }

  // Active drill
  if (drillState === "active") {
    const currentQuestion = drillQuestions[currentIndex];
    if (!currentQuestion) return null;

    const isAnswered = selectedOption !== undefined;
    const timeWarning = timeRemaining <= 60;

    return (
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Header with timer and progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer
              className={`h-5 w-5 ${timeWarning ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}
            />
            <span
              className={`text-lg font-mono font-bold ${
                timeWarning
                  ? "text-red-500"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t("question", { current: currentIndex + 1, total: drillQuestions.length })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + (isAnswered ? 1 : 0)) / drillQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <p className="text-lg text-slate-900 dark:text-slate-100 mb-6">
            {currentQuestion.question.question}
          </p>

          {currentQuestion.question.img && (
            <div className="mb-6">
              <img
                src={currentQuestion.question.img}
                alt=""
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          <div className="space-y-2">
            {currentQuestion.question.options.map((option, idx) => (
              <AnswerOption
                key={idx}
                letter={String.fromCharCode(65 + idx)}
                state={getOptionState(idx)}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
              >
                {option}
              </AnswerOption>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          {!isAnswered ? (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {t("skip")}
            </button>
          ) : (
            <div />
          )}

          {isAnswered && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors"
            >
              {currentIndex + 1 >= drillQuestions.length ? "Finish" : "Next"}
            </button>
          )}
        </div>
      </main>
    );
  }

  // Complete screen
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            results.isPerfect
              ? "bg-amber-100 dark:bg-amber-900/40"
              : results.passed
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-slate-100 dark:bg-slate-700"
          }`}
        >
          {results.isPerfect ? (
            <Zap className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          ) : results.passed ? (
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-10 w-10 text-slate-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {timeRemaining === 0 ? t("timeUp") : t("drillComplete")}
        </h1>

        <p
          className={`text-lg font-medium mb-2 ${
            results.isPerfect
              ? "text-amber-600 dark:text-amber-400"
              : results.passed
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {results.isPerfect ? t("perfect") : results.passed ? t("passed") : t("needsWork")}
        </p>

        <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("score", { correct: results.correct, total: results.total })}
        </p>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t("accuracy", { percent: results.accuracy })}
        </p>

        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-300 font-semibold mb-6">
            <Zap className="h-4 w-4" />
            {t("xpEarned", { xp: xpEarned })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetDrill}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            <Home className="h-4 w-4" />
            {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
