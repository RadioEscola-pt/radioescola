"use client";
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Category } from '../../../lib/types';
import { loadData } from '../../../lib/data';
import ExamTimer from '../../../components/ExamTimer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [timeLeft, setTimeLeft] = useState(3600);
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizEnded, setQuizEnded] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalSeconds = 3600;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  // Timer: countdown from initial time to 0; stops when quiz ends
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    // If quiz ended or time is up, ensure timer is stopped
    if (quizEnded || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    // Start ticking
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizEnded, timeLeft]);

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
      else total -= 0.25;
    }
    setScore(total);
  }, [answers, category]);

  React.useEffect(() => {
    const cat = typeof params.category === 'string'
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0]
        : '3';
    // Reset state on category change
    setAnswers({});
    setScore(0);
    setTimeLeft(3600);
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
            if (ch && ch !== 'x') {
              const idx = parseInt(ch, 36);
              if (!Number.isNaN(idx)) ans[chosen[i].id] = idx;
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
      const qs = [...base.questions];
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
      const sample = qs.slice(0, Math.min(40, qs.length));
      setCategory({ id: base.id, name: base.name, questions: sample });
    });
  }, [params.category, searchParams]);

  const startNewQuiz = () => {
    if (!category) return;
    const catId = category.id;
    loadData().then((data) => {
      const base = data.categories[catId];
      if (!base) return;
      const qs = [...base.questions];
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
      const sample = qs.slice(0, Math.min(40, qs.length));
      setCategory({ id: base.id, name: base.name, questions: sample });
      setAnswers({});
      setScore(0);
      setTimeLeft(3600);
      setCurrentPage(1);
      setQuizEnded(false);
      setResultsOpen(false);
    });
  };

  if (!category) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Exam: {category.name}</h1>
      <div className="flex items-center justify-between mb-2">
        <ExamTimer timeLeft={timeLeft} />
        <div className="flex items-center">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50 mr-2"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(category.questions.length / pageSize), p + 1))}
            disabled={currentPage >= Math.ceil(category.questions.length / pageSize)}
          >
            Next
          </button>
          <span className="ml-3 text-sm text-gray-600 mr-4">
            Page {currentPage} / {Math.max(1, Math.ceil(category.questions.length / pageSize))}
          </span>
          {quizEnded ? (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={startNewQuiz}
            >
              Take Another
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={() => {
                setQuizEnded(true);
                setResultsOpen(true);
              }}
            >
              End Quiz
            </button>
          )}
        </div>
      </div>
      {quizEnded && (
        <p className="mb-2 font-semibold">Score: {score} / {category.questions.length}</p>
      )}
      <section className="mt-6 space-y-6">
        {category.questions
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((q, qi) => {
          const selected = answers[q.id];
          const isAnswered = selected !== undefined;
          const timeUp = timeLeft <= 0;
          return (
            <div key={q.id} className="border rounded-md p-4">
              <h2 className="font-semibold mb-1">{(currentPage - 1) * pageSize + qi + 1}. {q.question}</h2>
              <div className="text-xs text-gray-500 mb-2">ID: {q.id}</div>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={timeUp || quizEnded}
                      onClick={() => {
                        setAnswers(prev => ({ ...prev, [q.id]: oi }));
                      }}
                      className={[
                        'text-left border rounded px-3 py-2 transition-colors',
                        quizEnded
                          ? (oi === q.correctIndex
                              ? (isSelected ? 'bg-green-100 border-green-400' : 'bg-white border-green-300')
                              : (isSelected ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200'))
                          : (isAnswered
                              ? (isSelected ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200 opacity-70')
                              : 'hover:bg-gray-50 border-gray-200')
                      ].join(' ')}
                    >
                      <span className="mr-2 font-mono">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {q.img && (
                <div className="mt-3">
                  <img src={q.img} alt={q.question} className="max-h-64 rounded border" />
                </div>
              )}
              {quizEnded && (
                <p className="mt-2 text-sm">
                  {selected === q.correctIndex ? (
                    <span className="text-green-700">Correct</span>
                  ) : (
                    <span className="text-red-700">{isAnswered ? 'Incorrect' : 'Unanswered'}</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </section>
      <Dialog open={resultsOpen} onOpenChange={(v) => setResultsOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exam Results</DialogTitle>
            <DialogDescription>Summary of your performance in this attempt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p><span className="font-medium">Points:</span> {score} / {category.questions.length}</p>
            <p><span className="font-medium">Time Remaining:</span> {fmt(timeLeft)}</p>
            <p><span className="font-medium">Time Elapsed:</span> {fmt(totalSeconds - timeLeft)}</p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {score >= 20 ? (
                <span className="text-green-700">Approved</span>
              ) : (
                <span className="text-red-700">Not Approved</span>
              )}
            </p>
          </div>
          {/* Shareable URL to revisit this exact exam */}
          {(() => {
            const buildUrl = () => {
              try {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const catId = category.id;
                const ids = category.questions.map((q) => q.id).join('-');
                const ans = category.questions
                  .map((q) => {
                    const sel = answers[q.id];
                    return sel === undefined ? 'x' : sel.toString(36);
                  })
                  .join('');
                const t = timeLeft;
                const url = `${origin}/exam/${encodeURIComponent(catId)}?q=${encodeURIComponent(ids)}&a=${encodeURIComponent(ans)}&t=${t}`;
                return url;
              } catch {
                return '';
              }
            };
            const url = buildUrl();
            return (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Shareable Link</h4>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={url}
                    className="flex-1 px-3 py-2 border rounded font-mono text-xs"
                  />
                  <button
                    className="px-3 py-2 border rounded"
                    onClick={() => {
                      if (url) navigator.clipboard?.writeText(url);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            );
          })()}
          {/* Progress toward pass and perfection */}
          {(() => {
            const total = category.questions.length || 1;
            const passPoints = 20;
            const maxPoints = total;
            const raw = score / maxPoints;
            const progress = Math.max(0, Math.min(1, raw));
            const passPct = Math.min(100, Math.max(0, (passPoints / maxPoints) * 100));
            const progPct = Math.round(progress * 100);
            const needToPass = Math.max(0, passPoints - score);
            const needForPerfect = Math.max(0, maxPoints - score);
            return (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                  <span>Progress to Pass</span>
                  <span>{progPct}%</span>
                </div>
                <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-indigo-500"
                    style={{ width: `${progPct}%` }}
                  />
                  {/* Pass threshold marker */}
                  <div
                    className="absolute top-0 h-full border-l-2 border-green-500"
                    style={{ left: `${passPct}%` }}
                    aria-label="Pass threshold"
                    title={`Pass at ${passPoints} pts`}
                  />
                  {/* Perfect marker */}
                  <div
                    className="absolute top-0 right-0 h-full border-r-2 border-amber-500"
                    aria-label="Perfect score"
                    title={`Perfect at ${maxPoints} pts`}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>Pass: {passPoints} pts</span>
                  <span>Perfect: {maxPoints} pts</span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {score >= passPoints ? (
                    <span>You passed by {Math.max(0, score - passPoints).toFixed(2)} pts.</span>
                  ) : (
                    <span>{needToPass.toFixed(2)} pts needed to pass.</span>
                  )}
                  {needForPerfect > 0 && (
                    <span className="ml-2">{needForPerfect.toFixed(2)} pts from perfect.</span>
                  )}
                </div>
              </div>
            );
          })()}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Review Wrong Answers</h4>
            <div className="space-y-3 max-h-64 overflow-auto pr-2">
              {category.questions.filter(q => answers[q.id] !== q.correctIndex).length === 0 ? (
                <p className="text-sm text-gray-600">Great job! No wrong answers to review.</p>
              ) : (
                category.questions.map((q, idx) => {
                  const sel = answers[q.id];
                  if (sel === q.correctIndex) return null;
                  return (
                    <div key={q.id} className="border rounded p-3">
                      <div className="text-sm text-gray-700 mb-1">{idx + 1}. {q.question}</div>
                      <div className="text-sm"><span className="font-medium">Your answer:</span> {sel !== undefined ? q.options[sel] : 'Unanswered'}</div>
                      <div className="text-sm"><span className="font-medium">Correct answer:</span> <span className="text-green-700">{q.options[q.correctIndex]}</span></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <button className="px-4 py-2 border rounded" onClick={() => setResultsOpen(false)}>Close</button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={startNewQuiz}
            >
              Take Another
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </main>
  );
}
