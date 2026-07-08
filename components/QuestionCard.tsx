"use client";

import React from 'react';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { Question } from '@/lib/types';
import { getCalculatorMeta } from '@/lib/config';
import type { CalculatorCode } from '@/lib/types';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/answer-option';
import BookmarkButton from '@/components/BookmarkButton';

interface QuestionCardProps {
  question: Question;
  selectedOption?: number;
  onSelect: (index: number) => void;
  showImage?: boolean;
  indexNumber?: number; // 1-based index label to show before question
  showId?: boolean; // show unique ID label
  ended?: boolean; // when true, show correctness styling like exam review
  disabled?: boolean; // disable interaction
  showCalcHint?: boolean; // show calculator suggestion badge
  onLaunchCalculator?: (code: string) => void;
  categoryId?: string;
  // Bookmark feature
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => Promise<void> | void;
  // Difficulty indicator
  successRate?: number; // 0-100 percentage
  attemptCount?: number;
}

function buildFonteLink(entry: string) {
  const match = entry.match(/^([^\/]+)\/(.+?)p(\d+)$/i);
  if (!match) {
    return { label: entry, href: null };
  }
  const [, folder, file, page] = match;
  if (!folder || !file || !page) {
    return { label: entry, href: null };
  }
  const href = `/exams/${folder}/${file}.pdf#page=${page}`;
  const label = `${folder.toUpperCase()} ${file} (p${page})`;
  return { label, href };
}

/** Normalize calc field to array of calculator codes */
function normalizeCalcCodes(calc: string | string[] | null | undefined): string[] {
  if (!calc) return [];
  if (Array.isArray(calc)) return calc;
  return [calc];
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelect,
  showImage = false,
  indexNumber,
  showId = false,
  ended = false,
  disabled = false,
  showCalcHint = false,
  onLaunchCalculator,
  showBookmark = false,
  isBookmarked = false,
  onToggleBookmark,
  successRate,
  attemptCount,
  categoryId,
}) => {
  const t = useTranslations('QuestionCard');
  const tc = useTranslations('Calculators');
  const isAnswered = selectedOption !== undefined;
  const [remoteNotesHtml, setRemoteNotesHtml] = React.useState<string | null>(null);
  const [remoteNotesLoading, setRemoteNotesLoading] = React.useState(false);
  const [remoteNotesError, setRemoteNotesError] = React.useState<string | null>(null);
  const [remoteNotesLoaded, setRemoteNotesLoaded] = React.useState(false);

  React.useEffect(() => {
    setRemoteNotesHtml(null);
    setRemoteNotesLoading(false);
    setRemoteNotesError(null);
    setRemoteNotesLoaded(false);
  }, [question.id, categoryId]);

  React.useEffect(() => {
    if (!ended) return;
    if (!categoryId) return;
    if (!question.hasNotesMdx) return;
    if (remoteNotesLoading || remoteNotesLoaded) return;

    let cancelled = false;
    setRemoteNotesLoading(true);
    fetch(`/api/notes/${encodeURIComponent(categoryId)}/${encodeURIComponent(String(question.id))}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load notes: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const html = typeof data?.html === 'string' ? data.html : '';
        setRemoteNotesHtml(html.length > 0 ? html : null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setRemoteNotesError('Unable to load notes.');
      })
      .finally(() => {
        if (cancelled) return;
        setRemoteNotesLoading(false);
        setRemoteNotesLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ended, categoryId, question.hasNotesMdx, question.id, remoteNotesLoaded, remoteNotesLoading]);

  const resolvedNotes = remoteNotesHtml ?? question.notes ?? null;
  const calcCodes = normalizeCalcCodes(question.calc);

  // Get color class for difficulty badge based on success rate
  const getDifficultyColorClass = (rate: number) => {
    if (rate >= 70) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (rate >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const handleLaunch = React.useCallback((code: string) => {
    if (onLaunchCalculator) {
      onLaunchCalculator(code);
    }
  }, [onLaunchCalculator]);

  const getOptionState = (idx: number): AnswerOptionState => {
    const isSelected = selectedOption === idx;
    const isCorrect = idx === question.correctIndex;

    if (ended) {
      if (isCorrect) return "correct";
      if (isSelected) return "incorrect";
      return "default";
    }
    if (isSelected) return "selected";
    return "default";
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sm:border sm:rounded-xl sm:mb-4 p-4">
      {showCalcHint && calcCodes.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300">
          <span>{calcCodes.length > 1 ? t('suggestedCalculators') : t('suggestedCalculator')}</span>
          {calcCodes.map((code) => {
            const meta = getCalculatorMeta(code as CalculatorCode);
            const translationKey = meta?.translationKey;
            const displayName = translationKey ? tc(`${translationKey}.shortTitle`) : code;
            return (
              <span key={code} className="inline-flex items-center gap-1">
                <span className="font-semibold">{displayName}</span>
                {onLaunchCalculator && (
                  <button
                    type="button"
                    onClick={() => handleLaunch(code)}
                    className="rounded bg-blue-600 px-2 py-0.5 text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {t('open')}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 mb-3">
        <p className="flex-1 text-slate-900 dark:text-slate-100">
          {indexNumber && (
            <span className="font-semibold text-amber-600 dark:text-amber-500 mr-2">{indexNumber}.</span>
          )}
          {question.question}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {attemptCount !== undefined && attemptCount > 0 && successRate !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColorClass(successRate)}`}>
              {t('successRate', { rate: Math.round(successRate) })}
            </span>
          )}
          {showBookmark && onToggleBookmark && (
            <BookmarkButton
              isBookmarked={isBookmarked}
              onToggle={onToggleBookmark}
              size="sm"
            />
          )}
        </div>
      </div>

      <div className={showImage && question.img ? "flex flex-col gap-4 sm:flex-row sm:items-start" : undefined}>
        <div className="space-y-2 sm:flex-[2] sm:min-w-0">
          {question.options.map((option, idx) => (
            <AnswerOption
              key={idx}
              letter={String.fromCharCode(65 + idx)}
              state={getOptionState(idx)}
              disabled={disabled || ended}
              onClick={() => onSelect(idx)}
            >
              {option}
            </AnswerOption>
          ))}
        </div>

        {showImage && question.img && (
          <div className="sm:flex-1 sm:min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-aspect question diagram with no stored dimensions; not a next/image fit */}
            <img src={question.img} alt="" className="max-w-full h-auto max-h-96 rounded-lg border border-slate-200 dark:border-slate-700" />
          </div>
        )}
      </div>

      {ended && (
        <div className="mt-4 space-y-2 text-sm">
          {(remoteNotesLoading || remoteNotesError || resolvedNotes) && (
            <div className="text-slate-600 dark:text-slate-400 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline">
              {remoteNotesLoading && <p className="italic text-gray-500">Loading notes…</p>}
              {remoteNotesError && !remoteNotesLoading && (
                <p className="italic text-red-600">{remoteNotesError}</p>
              )}
              {!remoteNotesLoading && !remoteNotesError && resolvedNotes && (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolvedNotes) }} />
              )}
            </div>
          )}
          {question.tutorial && (
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{t('relatedTutorial')}</span>{' '}
              <a className="text-blue-600 dark:text-blue-400 underline" href={`/study/${question.tutorial}`}>
                {question.tutorial}
              </a>
            </div>
          )}
          {question.fonte && question.fonte.length > 0 && (
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{t('officialSource')}</span>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                {question.fonte.map((entry, idx) => {
                  const { href, label } = buildFonteLink(entry);
                  return (
                    <li key={`${entry}-${idx}`}>
                      {href ? (
                        <a className="text-blue-600 dark:text-blue-400 underline" href={href} target="_blank" rel="noreferrer">
                          {label}
                        </a>
                      ) : (
                        entry
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
