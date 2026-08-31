"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { useConfetti } from '@/hooks/useConfetti';
import { Trophy, XCircle, Clock, CircleCheck, CircleX, CircleDashed, Star, ArrowUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GamificationResult } from '@/lib/types/gamification';
import { ShareButton } from './ShareButton';
import { createExamResultShare } from '@/lib/share';
import { QuestionExplanation } from './QuestionExplanation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { topicShortLabel } from '@/lib/config';
import { weakTopics } from '@/lib/exam/weak-topics';

type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

interface ReviewAnswer {
  index: number;
  /** The bank id, which is what `/api/notes` is addressed by. */
  questionId: number;
  question: string;
  options: string[];
  selectedIndex: number | undefined;
  correctIndex: number;
  status: AnswerStatus;
  hasNotesMdx?: boolean;
  notes?: string | null;
  /** The shipped name for the source's `topic`; drives the study advice. */
  materia?: string | null;
}

export interface ExamResultsProps {
  category: string;
  score: number;
  totalQuestions: number;
  timeLeft: number;
  passingScore?: number;
  reviewAnswers: ReviewAnswer[];
  onStartNew: () => void;
  gamificationResult?: GamificationResult | null;
  gamificationEnabled?: boolean;
}

/** Animated counter that counts from 0 to target, preserving decimals */
function useAnimatedCounter(target: number, duration: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const hasDecimal = target % 1 !== 0;

  // This effect drives an animation (the counter value over time), which is a
  // legitimate use of synchronous setState — the rule's escape-hatch case.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const raw = eased * target;
      // Snap to exact target at end; during animation, round to nearest 0.25 if target has decimals
      setValue(progress >= 1 ? target : hasDecimal ? Math.round(raw * 4) / 4 : Math.round(raw));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled, hasDecimal]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return value;
}

export function ExamResults({
  category,
  score,
  totalQuestions,
  timeLeft,
  passingScore = 20,
  reviewAnswers,
  onStartNew,
  gamificationResult,
  gamificationEnabled = false,
}: ExamResultsProps) {
  const t = useTranslations('ExamResults');
  // The explanation reuses the question card's copy — it is the same label
  // answering the same question, and two spellings of it would drift.
  const tq = useTranslations('QuestionCard');
  const tGamification = useTranslations('Gamification');
  const locale = useLocale();
  const passed = score >= passingScore;
  const isPerfect = score === totalQuestions;
  const [filter, setFilter] = useState<'all' | AnswerStatus>('all');
  const { celebrate, reset } = useConfetti({ enabled: passed });
  const [revealed, setRevealed] = useState(false);

  const animatedScore = useAnimatedCounter(score, 1200, revealed);

  const shareContent = useMemo(() => createExamResultShare({
    category,
    score,
    totalQuestions,
    passed,
  }), [category, score, totalQuestions, passed]);

  useEffect(() => {
    const revealTimer = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    if (passed) {
      const timer = setTimeout(celebrate, 300);
      return () => clearTimeout(timer);
    }
    return;
  }, [passed, celebrate]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const timeMessage = useMemo(() => {
    const minutesLeft = Math.floor(timeLeft / 60);
    if (minutesLeft <= 0) return t('time.usedFullTime');
    if (minutesLeft >= 30) return t('time.finishedVeryEarly', { minutes: minutesLeft });
    if (minutesLeft >= 5) return t('time.finishedEarly', { minutes: minutesLeft });
    return t('time.usedMostTime', { minutes: minutesLeft });
  }, [timeLeft, t]);

  const encouragement = useMemo(() => {
    if (isPerfect) return t('status.encouragePassedPerfect');
    if (passed && score >= totalQuestions * 0.85) return t('status.encouragePassedHigh');
    if (passed) return t('status.encouragePassed');
    if (score >= passingScore - 3) return t('status.encourageFailedClose');
    if (score < passingScore * 0.5) return t('status.encourageFailedLow');
    return t('status.encourageFailed');
  }, [score, totalQuestions, passingScore, passed, isPerfect, t]);

  const statusText = isPerfect ? t('status.perfect') : passed ? t('status.passed') : t('status.failed');

  const counts = useMemo(() => ({
    correct: reviewAnswers.filter(a => a.status === 'correct').length,
    incorrect: reviewAnswers.filter(a => a.status === 'incorrect').length,
    unanswered: reviewAnswers.filter(a => a.status === 'unanswered').length,
  }), [reviewAnswers]);

  const studyAreas = useMemo(() => weakTopics(reviewAnswers), [reviewAnswers]);

  const filteredAnswers = useMemo(() =>
    filter === 'all' ? reviewAnswers : reviewAnswers.filter(a => a.status === filter),
    [reviewAnswers, filter]
  );

  const StatusIcon = ({ status }: { status: AnswerStatus }) => {
    if (status === 'correct') return <CircleCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />;
    if (status === 'incorrect') return <CircleX className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
    return <CircleDashed className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Hero Status Section */}
      <div className={cn(
        "flex flex-col items-center py-8 sm:py-10 px-4 sm:rounded-xl transition-colors duration-700",
        revealed && passed && "bg-green-50/60 dark:bg-green-950/20",
        revealed && !passed && "bg-red-50/40 dark:bg-red-950/15"
      )}>
        {/* Icon */}
        <div className={cn(
          "animate-badge-entrance",
          isPerfect
            ? "text-amber-500 dark:text-amber-400"
            : passed
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
        )}>
          {isPerfect ? (
            <Star className="w-16 h-16 fill-amber-200 dark:fill-amber-800" strokeWidth={1.5} />
          ) : passed ? (
            <Trophy className="w-16 h-16" strokeWidth={1.5} />
          ) : (
            <XCircle className="w-16 h-16" strokeWidth={1.5} />
          )}
        </div>

        {/* Status headline */}
        <h1 className={cn(
          "mt-4 text-2xl font-bold transition-all duration-500",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          isPerfect
            ? "text-amber-600 dark:text-amber-400"
            : passed
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
        )}>
          {statusText}
        </h1>

        {/* Score — points (primary) + correct answers (secondary) */}
        <div className={cn(
          "mt-3 text-center transition-all duration-500 delay-100",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <div>
            <span className="text-5xl sm:text-6xl font-bold tabular-nums text-foreground">
              {Number.isInteger(animatedScore) ? animatedScore : animatedScore.toFixed(2)}
            </span>
            <span className="text-lg sm:text-xl text-muted-foreground ml-1">{t('score.points')}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('score.passThreshold', { score: passingScore })}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('score.correct', { count: counts.correct })}
            {counts.incorrect > 0 && <> · {t('score.incorrect', { count: counts.incorrect })}</>}
            {counts.unanswered > 0 && <> · {t('score.unanswered', { count: counts.unanswered })}</>}
          </p>
        </div>

        {/* Encouragement + time */}
        <div className={cn(
          "mt-4 text-center space-y-1 transition-all duration-500 delay-200",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {encouragement}
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {timeMessage}
          </p>
        </div>

      </div>

      {/* XP Section */}
      {gamificationEnabled && gamificationResult && gamificationResult.xpGained > 0 && (
        <div className={cn(
          "mx-4 sm:mx-0 mt-4 p-4 rounded-xl border border-border transition-all duration-500 delay-500",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h3 className="font-semibold text-foreground">
              {tGamification('xpEarned.title')}
            </h3>
            <span className="ml-auto text-lg font-bold text-amber-600 dark:text-amber-400">
              +{gamificationResult.xpGained} XP
            </span>
          </div>

          <div className="space-y-1 text-sm">
            {gamificationResult.xpEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between text-muted-foreground">
                <span>{tGamification(`xpEvents.${event.type}`)}</span>
                <span className="text-amber-600 dark:text-amber-400">+{event.amount} XP</span>
              </div>
            ))}
          </div>

          {gamificationResult.levelUp && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <ArrowUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {tGamification('levelUp.title')}
              </span>
              <span className="text-muted-foreground">
                {tGamification('levelUp.description', { level: gamificationResult.newLevel })}
              </span>
            </div>
          )}

          {gamificationResult.newAchievements.length > 0 && (
            <div className="mt-2 space-y-1">
              {gamificationResult.newAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Star className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="font-medium text-purple-700 dark:text-purple-400">
                    {tGamification(achievement.nameKey)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    +{achievement.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={cn(
        "flex justify-center gap-3 mx-4 sm:mx-0 mt-6 transition-all duration-500 delay-500",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
        <Button onClick={onStartNew}>
          {passed ? t('buttons.takeAnother') : t('buttons.tryAgain')}
        </Button>
        <ShareButton content={shareContent} iconOnly />
      </div>

      {/* What to study next. Absent after a flawless attempt: there is nothing
          to advise, and an empty panel would read as a broken one. */}
      {studyAreas.length > 0 && (
        <section className="mx-4 sm:mx-0 mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">{t('studyAreas.title')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('studyAreas.subtitle')}</p>
          <ul className="space-y-2">
            {studyAreas.map((topic) => {
              const label = topicShortLabel(topic.slug, locale) ?? topic.slug;
              const missedShare = Math.round((topic.missed / topic.total) * 100);
              return (
                <li key={topic.slug}>
                  <Link
                    href={`/browse/${category}?topic=${encodeURIComponent(topic.slug)}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-amber-300 dark:hover:border-amber-700"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-foreground truncate">{label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {t('studyAreas.missed', { missed: topic.missed, total: topic.total })}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
                          style={{ width: `${missedShare}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                      {t('studyAreas.practice')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Review Section */}
      <section className="mx-4 sm:mx-0 mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('tabs.review')}</h2>

        {/* Filter bar */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg mb-4">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'all'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('filter.all', { count: reviewAnswers.length })}
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'correct'
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CircleCheck className="w-3 h-3" />
            {counts.correct}
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'incorrect'
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CircleX className="w-3 h-3" />
            {counts.incorrect}
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'unanswered'
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CircleDashed className="w-3 h-3" />
            {counts.unanswered}
          </button>
        </div>

        {filteredAnswers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === 'correct' && counts.correct === 0
                ? t('review.emptyCorrect')
                : filter === 'incorrect' && counts.incorrect === 0 && counts.unanswered === 0
                  ? t('review.emptyAllCorrect')
                  : t('review.empty')}
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredAnswers.map((item) => (
              <AccordionItem
                key={item.index}
                value={`item-${item.index}`}
                className={cn(
                  "border rounded-lg px-4",
                  item.status === 'correct' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                  item.status === 'incorrect' && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                  item.status === 'unanswered' && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                )}
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <StatusIcon status={item.status} />
                    <span className="text-sm font-medium line-clamp-2">
                      {item.index + 1}. {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1.5 pt-1 pb-1">
                    {item.options.map((option, optIdx) => {
                      const isSelected = item.selectedIndex === optIdx;
                      const isCorrect = item.correctIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                            isCorrect && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                            isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
                            !isSelected && !isCorrect && "text-muted-foreground"
                          )}
                        >
                          <span className="font-mono text-xs w-5">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{option}</span>
                          {isCorrect && <CircleCheck className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {isSelected && !isCorrect && <CircleX className="w-4 h-4 text-red-600 dark:text-red-400" />}
                        </div>
                      );
                    })}
                  </div>
                  {/* Mounted with the open panel, so only the question being
                      reviewed fetches its explanation, not all forty. */}
                  <QuestionExplanation
                    categoryId={category}
                    questionId={item.questionId}
                    hasNotesMdx={item.hasNotesMdx}
                    inlineNotes={item.notes}
                    className="mt-3 pt-3 border-t border-border/60 text-sm"
                    heading={<p className="mb-2 font-semibold text-foreground">{tq('explanation')}</p>}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}
