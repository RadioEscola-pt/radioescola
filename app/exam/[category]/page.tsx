"use client";
import React, { useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';
import { loadData } from '@/lib/data';
import { EXAM_CONFIG, DEFAULT_CATEGORY } from '@/lib/config';
import { ExamResults } from '@/components/ExamResults';
import { PageLoading } from '@/components/shared/Loading';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/answer-option';
import { Button } from '@/components/ui/button';
import { StudyHeader } from '@/components/StudyHeader';
import { useProgressContext } from '@/components/providers/ProgressProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ExamAttempt, QuestionAttempt } from '@/lib/types/progress';
import type { GamificationResult } from '@/lib/types/gamification';

const { DURATION_SECONDS, QUESTIONS_PER_PAGE, MAX_QUESTIONS, PASSING_SCORE, WRONG_ANSWER_PENALTY } = EXAM_CONFIG;

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('Exam');
  const { recordExamWithGamification, recordQuestionBatch, gamification } = useProgressContext();
  const [timeLeft, setTimeLeft] = useState<number>(DURATION_SECONDS);
  // Wall-clock deadline (epoch ms) the countdown runs toward; null when no exam
  // is actively running (loading or replay).
  const [deadline, setDeadline] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizEnded, setQuizEnded] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const progressSavedRef = useRef(false);
  const isReplayRef = useRef(false);
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);

  // Timer: wall-clock countdown toward a fixed deadline. Deriving the remaining
  // time from Date.now() on each tick — rather than decrementing a per-tick
  // counter — avoids cumulative drift and prevents background-tab throttling from
  // silently granting extra time (a throttled tick still reads the true clock).
  // Deps are [quizEnded, deadline] only, so the interval is created once per exam,
  // not recreated on every tick.
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (quizEnded || deadline === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick(); // sync immediately so the display is correct on (re)start
    timerRef.current = setInterval(tick, 250);

    // Re-sync the moment the tab regains focus; background tabs throttle timers.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizEnded, deadline]);

  // End quiz when time runs out
  React.useEffect(() => {
    if (timeLeft === 0 && !quizEnded) {
      setQuizEnded(true);
      setResultsOpen(true);
    }
  }, [timeLeft, quizEnded]);

  // Scoring: +1 correct, -0.25 wrong, 0 unanswered
  React.useEffect(() => {
    if (!category) return;
    let total = 0;
    for (const q of category.questions) {
      const sel = answers[q.id];
      if (sel === undefined) continue;
      if (sel === q.correctIndex) total += 1;
      else total -= WRONG_ANSWER_PENALTY;
    }
    setScore(Math.max(0, total));
  }, [answers, category]);

  // Save progress when quiz ends (only for fresh exams, not replays)
  React.useEffect(() => {
    if (!quizEnded || !category || isReplayRef.current || progressSavedRef.current) {
      return;
    }

    progressSavedRef.current = true;
    const timeSpent = DURATION_SECONDS - timeLeft;

    // Calculate results
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (const q of category.questions) {
      const sel = answers[q.id];
      if (sel === undefined) {
        unansweredCount++;
      } else if (sel === q.correctIndex) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }

    const passed = score >= PASSING_SCORE;

    // Record exam attempt
    const examAttempt: ExamAttempt = {
      id: crypto.randomUUID(),
      category: category.id,
      score,
      totalQuestions: category.questions.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      timeSpent,
      passed,
      timestamp: Date.now(),
      questionIds: category.questions.map(q => q.id),
      answers: { ...answers },
    };

    // Record individual question attempts
    const questionAttempts: QuestionAttempt[] = category.questions
      .filter(q => answers[q.id] !== undefined)
      .map(q => ({
        questionId: q.id,
        category: category.id,
        correct: answers[q.id] === q.correctIndex,
        timestamp: Date.now(),
      }));

    // Sequence the writes so they don't race on localStorage: record the exam
    // (+ gamification, persisted atomically) first, then the per-question batch.
    // Running them concurrently let one overwrite the other's just-saved data.
    recordExamWithGamification(examAttempt, timeLeft).then((result) => {
      setGamificationResult(result);
      if (questionAttempts.length > 0) {
        recordQuestionBatch(questionAttempts);
      }
    });
  }, [quizEnded, category, answers, score, timeLeft, recordExamWithGamification, recordQuestionBatch]);

  React.useEffect(() => {
    const cat = typeof params.category === 'string'
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0] ?? DEFAULT_CATEGORY
        : DEFAULT_CATEGORY;
    // Reset state on category change
    setAnswers({});
    setScore(0);
    setTimeLeft(DURATION_SECONDS);
    // Keep the timer inert until the fresh/replay branch below establishes the
    // deadline, so a stale deadline from a previous exam can't tick in between.
    setDeadline(null);
    setQuizEnded(false);
    setResultsOpen(false);
    setCurrentPage(1);
    const qParam = searchParams.get('q');
    const aParam = searchParams.get('a');
    const tParam = searchParams.get('t');
    loadData().then((data) => {
      const base = data.categories[cat];
      if (!base) {
        setCategory(null);
        return;
      }
      // If a replay URL is present, reconstruct exact exam/order/answers
      if (qParam) {
        isReplayRef.current = true;
        const ids = qParam.split('-').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
        const byId = new Map(base.questions.map((q) => [q.id, q] as const));
        const chosen = ids.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
        setCategory({ id: base.id, name: base.name, questions: chosen });
        // Parse answers compact string (base36 for index, 'x' for unanswered)
        const ans: Record<number, number> = {};
        if (aParam) {
          const chars = aParam.split('');
          for (let i = 0; i < Math.min(chars.length, chosen.length); i++) {
            const ch = chars[i];
            const chosenQuestion = chosen[i];
            if (ch && ch !== 'x' && chosenQuestion) {
              const idx = parseInt(ch, 36);
              if (!Number.isNaN(idx)) ans[chosenQuestion.id] = idx;
            }
          }
        }
        setAnswers(ans);
        const t = tParam ? parseInt(tParam, 10) : 0;
        setTimeLeft(Number.isFinite(t) ? t : 0);
        setQuizEnded(true);
        setResultsOpen(false);
        return;
      }
      // Otherwise, sample a fresh random exam
      isReplayRef.current = false;
      progressSavedRef.current = false;
      const qs = [...base.questions];
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const qi = qs[i];
        const qj = qs[j];
        if (qi !== undefined && qj !== undefined) {
          qs[i] = qj;
          qs[j] = qi;
        }
      }
      const sample = qs.slice(0, Math.min(MAX_QUESTIONS, qs.length));
      setCategory({ id: base.id, name: base.name, questions: sample });
      setDeadline(Date.now() + DURATION_SECONDS * 1000);
    });
  }, [params.category, searchParams]);

  const startNewQuiz = () => {
    if (!category) return;
    isReplayRef.current = false;
    progressSavedRef.current = false;
    const catId = category.id;
    loadData().then((data) => {
      const base = data.categories[catId];
      if (!base) return;
      const qs = [...base.questions];
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const qi = qs[i];
        const qj = qs[j];
        if (qi !== undefined && qj !== undefined) {
          qs[i] = qj;
          qs[j] = qi;
        }
      }
      const sample = qs.slice(0, Math.min(MAX_QUESTIONS, qs.length));
      setCategory({ id: base.id, name: base.name, questions: sample });
      setAnswers({});
      setScore(0);
      setTimeLeft(DURATION_SECONDS);
      setDeadline(Date.now() + DURATION_SECONDS * 1000);
      setCurrentPage(1);
      setQuizEnded(false);
      setResultsOpen(false);
      setGamificationResult(null);
    });
  };

  // Calculate total pages (safe even when category is null)
  const totalPages = category ? Math.max(1, Math.ceil(category.questions.length / QUESTIONS_PER_PAGE)) : 1;

  // Keyboard shortcuts for exam navigation
  useKeyboardShortcuts({
    onNext: useCallback(() => {
      if (category) {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      }
    }, [category, totalPages]),
    onPrevious: useCallback(() => {
      setCurrentPage((p) => Math.max(1, p - 1));
    }, []),
    onEndQuiz: useCallback(() => {
      if (!quizEnded) {
        setQuizEnded(true);
        setResultsOpen(true);
      }
    }, [quizEnded]),
    enabled: !resultsOpen && !!category,
  });

  if (!category) {
    return <PageLoading message={t('loading')} />;
  }
  const answeredCount = Object.keys(answers).length;

  // Build review answers list (shared between results and replay views)
  const reviewAnswers = category.questions.map((q, idx) => {
    const sel = answers[q.id];
    const status = sel === undefined ? 'unanswered' : sel === q.correctIndex ? 'correct' : 'incorrect';
    return {
      index: idx,
      question: q.question,
      options: q.options,
      selectedIndex: sel,
      correctIndex: q.correctIndex,
      status: status as 'correct' | 'incorrect' | 'unanswered',
    };
  });

  // Show results page when quiz is ended and results are open
  if (resultsOpen) {
    return (
      <main className="-mx-4 sm:mx-0 pb-8">
        <StudyHeader
          categoryId={category.id}
          mode="exam"
          backHref="/"
          subtitle={t('resultsSubtitle')}
        />
        <ExamResults
          category={category.id}
          score={score}
          totalQuestions={category.questions.length}
          timeLeft={timeLeft}
          passingScore={PASSING_SCORE}
          reviewAnswers={reviewAnswers}
          onStartNew={startNewQuiz}
          gamificationResult={gamificationResult}
          gamificationEnabled={gamification?.isEnabled ?? false}
        />
      </main>
    );
  }

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <StudyHeader
        categoryId={category.id}
        mode="exam"
        backHref="/"
        subtitle={`${answeredCount}/${category.questions.length}`}
      >
        {/* Timer */}
        <div className={`font-mono text-sm px-2.5 py-1 rounded-md font-semibold tabular-nums ${
          timeLeft <= 60
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>

        {/* End/New quiz button */}
        {quizEnded ? (
          <Button size="sm" onClick={() => setResultsOpen(true)}>
            {t('viewResults')}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setQuizEnded(true);
              setResultsOpen(true);
            }}
          >
            {t('endQuiz')}
          </Button>
        )}
      </StudyHeader>

      {/* Questions */}
      <section className="sm:px-0">
        {category.questions
          .slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE)
          .map((q, qi) => {
          const selected = answers[q.id];
          const timeUp = timeLeft <= 0;
          const questionNumber = (currentPage - 1) * QUESTIONS_PER_PAGE + qi + 1;
          return (
            <div key={q.id} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sm:border sm:rounded-xl sm:mb-4 p-4">
              <p className="text-slate-900 dark:text-slate-100 mb-3">
                <span className="font-semibold text-amber-600 dark:text-amber-500 mr-2">{questionNumber}.</span>
                {q.question}
              </p>

              <div className={q.img ? "flex flex-col gap-4 sm:flex-row sm:items-start" : undefined}>
                <div className="space-y-2 sm:flex-[2] sm:min-w-0">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected === oi;
                    const isCorrect = oi === q.correctIndex;
                    let state: AnswerOptionState = "default";

                    if (quizEnded) {
                      if (isCorrect) state = "correct";
                      else if (isSelected) state = "incorrect";
                    } else if (isSelected) {
                      state = "selected";
                    }

                    return (
                      <AnswerOption
                        key={oi}
                        letter={String.fromCharCode(65 + oi)}
                        state={state}
                        disabled={timeUp || quizEnded}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                      >
                        {opt}
                      </AnswerOption>
                    );
                  })}
                </div>

                {q.img && (
                  <div className="sm:flex-1 sm:min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-aspect question diagram with no stored dimensions; not a next/image fit */}
                    <img src={q.img} alt="" className="max-w-full h-auto max-h-96 rounded-lg border border-slate-200 dark:border-slate-700" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom navigation - fixed on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 sm:relative sm:mt-6 sm:border-t-0 sm:bg-transparent sm:p-0">
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
          <button
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {t('previous')}
          </button>

          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            {t('next')}
          </button>
        </div>
      </div>

      {/* Spacer for fixed bottom nav on mobile */}
      <div className="h-16 sm:hidden" />
    </main>
  );
}
