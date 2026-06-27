"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";
import { Category } from "@/lib/types";
import { loadData } from "@/lib/data";
import { useCalculators } from "@/components/providers/CalculatorProvider";
import { PageLoading } from "@/components/shared/Loading";
import { StudyHeader } from "@/components/StudyHeader";
import type { CalculatorCode } from "@/lib/types";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import {
  selectQuestionsForReview,
  getQuestionCounts,
  type QuestionWithPriority,
} from "@/lib/spaced-repetition/question-selector";
import {
  calculateSM2,
  QUALITY_LABELS,
  getIntervalPreviews,
  type QualityRating,
} from "@/lib/spaced-repetition/sm2";
import { RotateCcw, Zap, Clock, CheckCircle2, RefreshCw, Brain, ThumbsUp, Sparkles } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const DEFAULT_CATEGORY = "3";
const SESSION_SIZE = 20;

type QualityButton = {
  key: keyof typeof QUALITY_LABELS;
  label: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  bgHover: string;
  text: string;
  iconBg: string;
};

export default function SmartPracticePage() {
  const params = useParams();
  const router = useRouter();
  const rawCategory = params?.category;
  const catId =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
        ? rawCategory[0] ?? DEFAULT_CATEGORY
        : DEFAULT_CATEGORY;

  const [category, setCategory] = useState<Category | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuestionWithPriority[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const sessionActiveRef = useRef(false);
  const { openCalculator } = useCalculators();
  const { progress, recordQuestionWithSR, getQuestionStats, refreshProgress, recordSmartPracticeSession } = useProgressContext();
  const t = useTranslations("SmartPractice");
  const tBrowse = useTranslations("Browse");

  // Load category data
  useEffect(() => {
    let active = true;

    async function fetchCategory() {
      setIsLoading(true);
      try {
        const data = await loadData();
        if (!active) return;
        setCategory(data.categories[catId] ?? null);
      } catch {
        if (!active) return;
        setCategory(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchCategory();
    return () => { active = false; };
  }, [catId]);

  // Select questions for the session when category loads (not on every progress update)
  useEffect(() => {
    if (!category || category.questions.length === 0) {
      setSessionQuestions([]);
      return;
    }

    // Don't re-select questions mid-session — progress updates after each answer
    if (sessionActiveRef.current) return;

    const selected = selectQuestionsForReview(
      category.questions,
      progress,
      catId,
      SESSION_SIZE
    );
    setSessionQuestions(selected);
    setCursor(0);
    setSelectedOption(undefined);
    setSessionComplete(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    sessionActiveRef.current = true;
  }, [category, progress, catId]);

  const handleLaunchCalculator = useCallback((code: string) => {
    openCalculator(code as CalculatorCode);
  }, [openCalculator]);

  const currentQuestionData = sessionQuestions[cursor];
  const currentQuestion = currentQuestionData?.question ?? null;

  // Get current SR stats for interval preview
  const currentStats = currentQuestion
    ? getQuestionStats(catId, currentQuestion.id)?.spacedRep
    : undefined;

  const intervalPreviews = useMemo(
    () => getIntervalPreviews(currentStats),
    [currentStats]
  );

  const handleSelect = useCallback((choice: number) => {
    if (selectedOption !== undefined || !currentQuestion) return;
    setSelectedOption(choice);
  }, [selectedOption, currentQuestion]);

  const handleQualityRating = async (quality: QualityRating) => {
    if (!currentQuestion || selectedOption === undefined) return;

    const wasCorrect = selectedOption === currentQuestion.correctIndex;

    // Calculate new SR stats
    const { newStats } = calculateSM2({
      currentStats,
      quality,
    });

    // Record the attempt with SR data
    await recordQuestionWithSR(catId, currentQuestion.id, newStats, wasCorrect);

    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
    }));

    // Move to next question or end session
    if (cursor + 1 >= sessionQuestions.length) {
      setSessionComplete(true);
      sessionActiveRef.current = false;
      recordSmartPracticeSession(sessionQuestions.length);
    } else {
      setCursor(prev => prev + 1);
      setSelectedOption(undefined);
    }
  };

  const handleRestartSession = async () => {
    sessionActiveRef.current = false;
    await refreshProgress();
    if (category) {
      const selected = selectQuestionsForReview(
        category.questions,
        progress,
        catId,
        SESSION_SIZE
      );
      setSessionQuestions(selected);
      setCursor(0);
      setSelectedOption(undefined);
      setSessionComplete(false);
      setSessionStats({ correct: 0, incorrect: 0 });
      sessionActiveRef.current = true;
    }
  };

  // Get question counts for display
  const questionCounts = useMemo(() => {
    if (!category) return null;
    return getQuestionCounts(category.questions, progress, catId);
  }, [category, progress, catId]);

  const qualityButtons: QualityButton[] = [
    {
      key: "again",
      label: t("again"),
      shortcut: "1",
      icon: RefreshCw,
      bg: "bg-red-50 dark:bg-red-950/40",
      bgHover: "hover:bg-red-100 dark:hover:bg-red-900/50",
      text: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/60",
    },
    {
      key: "hard",
      label: t("hard"),
      shortcut: "2",
      icon: Brain,
      bg: "bg-orange-50 dark:bg-orange-950/40",
      bgHover: "hover:bg-orange-100 dark:hover:bg-orange-900/50",
      text: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/60",
    },
    {
      key: "good",
      label: t("good"),
      shortcut: "3",
      icon: ThumbsUp,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      bgHover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
    },
    {
      key: "easy",
      label: t("easy"),
      shortcut: "4",
      icon: Sparkles,
      bg: "bg-sky-50 dark:bg-sky-950/40",
      bgHover: "hover:bg-sky-100 dark:hover:bg-sky-900/50",
      text: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-100 dark:bg-sky-900/60",
    },
  ];

  const formatInterval = (days: number) => {
    if (days === 1) return t("intervalDay", { count: 1 });
    if (days < 30) return t("intervalDays", { count: days });
    if (days < 365) {
      const months = Math.round(days / 30);
      return months === 1 ? t("intervalMonth", { count: 1 }) : t("intervalMonths", { count: months });
    }
    const years = Math.round(days / 365);
    return years === 1 ? t("intervalYear", { count: 1 }) : t("intervalYears", { count: years });
  };

  // Keyboard shortcuts for answer selection
  const handleKeyboardAnswer = useCallback((index: number) => {
    if (selectedOption === undefined && currentQuestion) {
      handleSelect(index);
    }
  }, [selectedOption, currentQuestion, handleSelect]);

  useKeyboardShortcuts({
    onAnswer1: () => handleKeyboardAnswer(0),
    onAnswer2: () => handleKeyboardAnswer(1),
    onAnswer3: () => handleKeyboardAnswer(2),
    onAnswer4: () => handleKeyboardAnswer(3),
    enabled: !isLoading && !sessionComplete && !!currentQuestion,
  });

  if (isLoading) {
    return <PageLoading message={t("loading")} />;
  }

  if (!category) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {tBrowse("flashNotFound", { id: catId })}
        </p>
      </main>
    );
  }

  if (sessionQuestions.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">{t("title")} - {tBrowse("title", { id: catId })}</h1>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">{t("allCaughtUp")}</h2>
              <p className="text-green-700 dark:text-green-300">{t("noQuestions")}</p>
            </div>
          </div>
          <Link
            href={`/browse/${catId}`}
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
          >
            {t("browseAll")}
          </Link>
        </div>
      </main>
    );
  }

  if (sessionComplete) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((sessionStats.correct / totalAnswered) * 100) : 0;

    return (
      <main className="p-8 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("sessionComplete")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t("reviewedCount", { count: totalAnswered })}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{sessionStats.correct}</p>
              <p className="text-sm text-green-700 dark:text-green-300">{t("correctLabel")}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{sessionStats.incorrect}</p>
              <p className="text-sm text-red-700 dark:text-red-300">{t("incorrectLabel")}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{accuracy}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("accuracy")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRestartSession}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              {t("practiceMore")}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              {t("viewProgress")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const ended = selectedOption !== undefined;
  const progressPercent = ((cursor) / sessionQuestions.length) * 100;

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <StudyHeader
        categoryId={catId}
        mode="smart"
        backHref={`/browse/${catId}`}
        subtitle={t("progress", { current: cursor + 1, total: sessionQuestions.length })}
      >
        {/* Question counts badges */}
        {questionCounts && (
          <div className="flex items-center gap-1.5">
            {questionCounts["due-now"] > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                <Zap className="h-2.5 w-2.5" />
                {questionCounts["due-now"]}
              </span>
            )}
            {questionCounts["new"] > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {questionCounts["new"]} new
              </span>
            )}
            {questionCounts["due-soon"] > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                <Clock className="h-2.5 w-2.5" />
                {questionCounts["due-soon"]}
              </span>
            )}
          </div>
        )}
      </StudyHeader>

      {/* Progress bar */}
      <div className="px-4 sm:px-0 mb-4">
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <section className="sm:px-0">
        {currentQuestion && (() => {
          const stats = getQuestionStats(catId, currentQuestion.id);
          const attemptCount = stats?.attempts ?? 0;
          const successRate = attemptCount > 0 ? ((stats?.correct ?? 0) / attemptCount) * 100 : undefined;
          return (
            <QuestionCard
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelect={handleSelect}
              showImage
              indexNumber={cursor + 1}
              showCalcHint
              onLaunchCalculator={handleLaunchCalculator}
              ended={ended}
              successRate={successRate}
              attemptCount={attemptCount}
            />
          );
        })()}

      {/* Quality rating */}
      {ended && (
        <div className="px-4 sm:px-0 mt-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            {t("ratePrompt")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {qualityButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.key}
                  onClick={() => handleQualityRating(QUALITY_LABELS[btn.key])}
                  className={`group flex flex-col items-center gap-2 rounded-xl py-4 px-3 transition-all duration-150
                    ${btn.bg} ${btn.bgHover} active:scale-[0.97]`}
                >
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${btn.iconBg}`}>
                    <Icon className={`w-5 h-5 ${btn.text}`} />
                  </span>
                  <span className={`text-sm font-semibold ${btn.text}`}>{btn.label}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                    {formatInterval(intervalPreviews[btn.key])}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      </section>
    </main>
  );
}
