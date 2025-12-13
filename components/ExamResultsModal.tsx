"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useConfetti } from '@/hooks/useConfetti';
import { Trophy, XCircle, Clock, Copy, Check, Share2, CircleCheck, CircleX, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

interface ReviewAnswer {
  index: number;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  status: AnswerStatus;
}

interface ExamResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
  timeLeft: number;
  totalSeconds: number;
  passingScore?: number;
  shareableUrl: string;
  reviewAnswers: ReviewAnswer[];
  onStartNew: () => void;
}

export function ExamResultsModal({
  open,
  onOpenChange,
  score,
  totalQuestions,
  timeLeft,
  totalSeconds,
  passingScore = 20,
  shareableUrl,
  reviewAnswers,
  onStartNew,
}: ExamResultsModalProps) {
  const passed = score >= passingScore;
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | AnswerStatus>('all');
  const { celebrate, reset } = useConfetti({ enabled: passed });

  useEffect(() => {
    if (open && passed) {
      const timer = setTimeout(celebrate, 300);
      return () => clearTimeout(timer);
    }
    if (!open) {
      reset();
      setCopied(false);
    }
  }, [open, passed, celebrate, reset]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(0, Math.min(100, Math.round((score / totalQuestions) * 100)));
  const passThreshold = Math.round((passingScore / totalQuestions) * 100);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        {/* Header with Share button */}
        <DialogHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <DialogTitle className="text-xl">Exam Results</DialogTitle>
            <DialogDescription>Summary of your performance</DialogDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "p-2 rounded-md transition-colors",
                  "hover:bg-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                title="Share results"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Share this exam</h4>
                <p className="text-xs text-muted-foreground">
                  Copy this link to share your exact exam and answers.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareableUrl}
                    className="flex-1 px-2 py-1.5 border rounded-md bg-gray-50 font-mono text-xs"
                  />
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium",
                      "border transition-all duration-200",
                      "hover:bg-gray-100",
                      copied && "bg-green-50 border-green-300 text-green-700"
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="review">
              Review {wrongCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                  {wrongCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="flex-1 overflow-auto">
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
                {passed ? "You Passed!" : "Not Passed"}
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
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium">{fmt(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Elapsed:</span>
                <span className="font-medium">{fmt(totalSeconds - timeLeft)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="py-4">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Progress</span>
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
                  title={`Pass at ${passingScore} pts`}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Pass: {passingScore}</span>
                <span>Perfect: {totalQuestions}</span>
              </div>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="flex-1 flex flex-col min-h-0">
            {/* Filter selector */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  filter === 'all'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({reviewAnswers.length})
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
            <div className="flex-1 overflow-auto min-h-0">
              {filteredAnswers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">No questions match the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {filteredAnswers.map((item) => (
                    <div
                      key={item.index}
                      className={cn(
                        "border rounded-md p-3",
                        item.status === 'correct' && "bg-green-50 border-green-200",
                        item.status === 'incorrect' && "bg-red-50 border-red-200",
                        item.status === 'unanswered' && "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.status === 'correct' && <CircleCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />}
                        {item.status === 'incorrect' && <CircleX className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                        {item.status === 'unanswered' && <CircleDashed className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground mb-1 font-medium">
                            {item.index + 1}. {item.question}
                          </div>
                          <div className="text-sm space-y-0.5">
                            {item.status !== 'unanswered' && (
                              <p>
                                <span className="text-muted-foreground">Your answer:</span>{' '}
                                <span className={item.status === 'correct' ? "text-green-600" : "text-red-600"}>
                                  {item.userAnswer}
                                </span>
                              </p>
                            )}
                            {item.status !== 'correct' && (
                              <p>
                                <span className="text-muted-foreground">Correct:</span>{' '}
                                <span className="text-green-600">{item.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            Close
          </button>
          <button
            onClick={onStartNew}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "bg-indigo-600 text-white",
              "transition-all duration-200",
              "hover:bg-indigo-700 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              "active:scale-[0.98]"
            )}
          >
            Take Another Exam
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
