"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useConfetti } from '@/hooks/useConfetti';
import { Trophy, XCircle, Clock, CircleCheck, CircleX, CircleDashed, Sparkles, Star, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GamificationResult } from '@/lib/types/gamification';
import { ShareButton } from './ShareButton';
import { createExamResultShare } from '@/lib/share';

type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

interface ReviewAnswer {
  index: number;
  question: string;
  options: string[];
  selectedIndex: number | undefined;
  correctIndex: number;
  status: AnswerStatus;
}

interface ExamResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  score: number;
  totalQuestions: number;
  timeLeft: number;
  totalSeconds: number;
  passingScore?: number;
  reviewAnswers: ReviewAnswer[];
  onStartNew: () => void;
  gamificationResult?: GamificationResult | null;
  gamificationEnabled?: boolean;
}

export function ExamResultsModal({
  open,
  onOpenChange,
  category,
  score,
  totalQuestions,
  timeLeft,
  totalSeconds,
  passingScore = 20,
  reviewAnswers,
  onStartNew,
  gamificationResult,
  gamificationEnabled = false,
}: ExamResultsModalProps) {
  const t = useTranslations('ExamResults');
  const tGamification = useTranslations('Gamification');
  const passed = score >= passingScore;
  const [filter, setFilter] = useState<'all' | AnswerStatus>('all');
  const { celebrate, reset } = useConfetti({ enabled: passed });

  // Create share content for exam results
  const shareContent = useMemo(() => createExamResultShare({
    category,
    score,
    totalQuestions,
    passed,
  }), [category, score, totalQuestions, passed]);

  useEffect(() => {
    if (open && passed) {
      const timer = setTimeout(celebrate, 300);
      return () => clearTimeout(timer);
    }
    if (!open) {
      reset();
    }
    return;
  }, [open, passed, celebrate, reset]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(0, Math.min(100, Math.round((score / totalQuestions) * 100)));
  const passThreshold = Math.round((passingScore / totalQuestions) * 100);

  const counts = useMemo(() => ({
    correct: reviewAnswers.filter(a => a.status === 'correct').length,
    incorrect: reviewAnswers.filter(a => a.status === 'incorrect').length,
    unanswered: reviewAnswers.filter(a => a.status === 'unanswered').length,
  }), [reviewAnswers]);

  const filteredAnswers = useMemo(() =>
    filter === 'all' ? reviewAnswers : reviewAnswers.filter(a => a.status === filter),
    [reviewAnswers, filter]
  );

  const wrongCount = counts.incorrect + counts.unanswered;

  const StatusIcon = ({ status }: { status: AnswerStatus }) => {
    if (status === 'correct') return <CircleCheck className="w-4 h-4 text-green-600 shrink-0" />;
    if (status === 'incorrect') return <CircleX className="w-4 h-4 text-red-600 shrink-0" />;
    return <CircleDashed className="w-4 h-4 text-amber-600 shrink-0" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[75dvh] flex flex-col">
        {/* Header with Share button */}
        <DialogHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <DialogTitle className="text-xl">{t('title')}</DialogTitle>
            <DialogDescription>{t('subtitle')}</DialogDescription>
          </div>
          <ShareButton content={shareContent} iconOnly />
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="summary">{t('tabs.summary')}</TabsTrigger>
            <TabsTrigger value="review">
              {t('tabs.review')} {wrongCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                  {wrongCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="flex-1 overflow-auto min-h-0">
            {/* Hero Status Section */}
            <div className="flex flex-col items-center py-4">
              <div className={cn(
                "animate-badge-entrance",
                passed ? "text-green-500" : "text-red-500"
              )}>
                {passed ? (
                  <Trophy className="w-14 h-14" strokeWidth={1.5} />
                ) : (
                  <XCircle className="w-14 h-14" strokeWidth={1.5} />
                )}
              </div>

              <h2 className={cn(
                "mt-3 text-xl font-bold animate-score-pop",
                passed ? "text-green-700" : "text-red-700"
              )}>
                {passed ? t('status.passed') : t('status.failed')}
              </h2>

              <div className="mt-2 text-center animate-score-pop" style={{ animationDelay: '0.1s' }}>
                <span className="text-4xl font-bold text-foreground">{score}</span>
                <span className="text-xl text-muted-foreground"> / {totalQuestions}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-6 py-3 border-t border-b text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('time.remaining')}</span>
                <span className="font-medium">{fmt(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('time.elapsed')}</span>
                <span className="font-medium">{fmt(totalSeconds - timeLeft)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="py-4">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{t('progress.label')}</span>
                <span>{progress}%</span>
              </div>
              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full animate-progress-fill",
                    passed ? "bg-green-500" : "bg-indigo-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-green-700"
                  style={{ left: `${passThreshold}%` }}
                  title={t('progress.pass', { score: passingScore })}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('progress.pass', { score: passingScore })}</span>
                <span>{t('progress.perfect', { score: totalQuestions })}</span>
              </div>
            </div>

            {/* XP Earned Section */}
            {gamificationEnabled && gamificationResult && gamificationResult.xpGained > 0 && (
              <div className="py-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">
                    {tGamification('xpEarned.title')}
                  </h3>
                  <span className="ml-auto text-lg font-bold text-amber-600">
                    +{gamificationResult.xpGained} XP
                  </span>
                </div>

                {/* XP Breakdown */}
                <div className="space-y-1 text-sm">
                  {gamificationResult.xpEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between text-muted-foreground">
                      <span>{tGamification(`xpEvents.${event.type}`)}</span>
                      <span className="text-amber-600">+{event.amount} XP</span>
                    </div>
                  ))}
                </div>

                {/* Level Up */}
                {gamificationResult.levelUp && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {tGamification('levelUp.title')}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                      {tGamification('levelUp.description', { level: gamificationResult.newLevel })}
                    </p>
                  </div>
                )}

                {/* New Achievements */}
                {gamificationResult.newAchievements.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {gamificationResult.newAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        <Star className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                            {tGamification(achievement.nameKey)}
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 dark:text-purple-500">
                          +{achievement.xpReward} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="flex-1 flex flex-col min-h-0">
            {/* Filter selector */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg mt-2 shrink-0">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
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
                  "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  filter === 'correct'
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CircleCheck className="w-3 h-3" />
                {counts.correct}
              </button>
              <button
                onClick={() => setFilter('incorrect')}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  filter === 'incorrect'
                    ? "bg-red-100 text-red-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CircleX className="w-3 h-3" />
                {counts.incorrect}
              </button>
              <button
                onClick={() => setFilter('unanswered')}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  filter === 'unanswered'
                    ? "bg-amber-100 text-amber-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CircleDashed className="w-3 h-3" />
                {counts.unanswered}
              </button>
            </div>

            {/* Answers list */}
            <div className="flex-1 overflow-auto min-h-0 mt-2">
              {filteredAnswers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">{t('review.empty')}</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-1">
                  {filteredAnswers.map((item) => (
                    <AccordionItem
                      key={item.index}
                      value={`item-${item.index}`}
                      className={cn(
                        "border rounded-md px-3",
                        item.status === 'correct' && "bg-green-50 border-green-200",
                        item.status === 'incorrect' && "bg-red-50 border-red-200",
                        item.status === 'unanswered' && "bg-amber-50 border-amber-200"
                      )}
                    >
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                          <StatusIcon status={item.status} />
                          <span className="text-sm font-medium">
                            {item.index + 1}. {item.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pt-1">
                          {item.options.map((option, optIdx) => {
                            const isSelected = item.selectedIndex === optIdx;
                            const isCorrect = item.correctIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1.5 rounded text-sm",
                                  isCorrect && "bg-green-100 text-green-800",
                                  isSelected && !isCorrect && "bg-red-100 text-red-800",
                                  !isSelected && !isCorrect && "text-muted-foreground"
                                )}
                              >
                                <span className="font-mono text-xs w-5">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className="flex-1">{option}</span>
                                {isCorrect && <CircleCheck className="w-4 h-4 text-green-600" />}
                                {isSelected && !isCorrect && <CircleX className="w-4 h-4 text-red-600" />}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="pt-4 border-t">
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "border transition-all duration-200",
              "hover:bg-gray-100",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            {t('buttons.close')}
          </button>
          <button
            onClick={onStartNew}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "bg-brand-500 text-white",
              "transition-all duration-200",
              "hover:bg-brand-600 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
              "active:scale-[0.98]"
            )}
          >
            {t('buttons.takeAnother')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
