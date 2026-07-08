"use client";

import React from 'react';
import DOMPurify from 'dompurify';
import { Calculator } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Question } from '@/lib/types';
import { getCalculatorMeta } from '@/lib/config';
import type { CalculatorCode } from '@/lib/types';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/answer-option';
import BookmarkButton from '@/components/BookmarkButton';
import PdfPageDialog from '@/components/PdfPageDialog';

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

function buildFonteLink(entry: string, pdfPage?: number) {
  const match = entry.match(/^([^\/]+)\/(.+?)p(\d+)$/i);
  if (!match) {
    return { label: entry, href: null };
  }
  const [, folder, file, num] = match;
  if (!folder || !file || !num) {
    return { label: entry, href: null };
  }
  // `num` is the pergunta (question) number, shown in the label. The actual PDF
  // page comes from fontePages when resolved; otherwise open the PDF at page 1
  // (the pergunta number is not a page and would land on the wrong page).
  const base = `/exams/${folder}/${file}.pdf`;
  const href = pdfPage ? `${base}#page=${pdfPage}` : base;
  const label = `${folder.toUpperCase()} ${file} (p${num})`;
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
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {calcCodes.map((code) => {
            const meta = getCalculatorMeta(code as CalculatorCode);
            const Icon = meta?.icon ?? Calculator;
            const translationKey = meta?.translationKey;
            const displayName = translationKey ? tc(`${translationKey}.shortTitle`) : code;
            const chipClass = 'inline-flex items-center gap-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300';
            const chip = (
              <>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{displayName}</span>
              </>
            );
            return onLaunchCalculator ? (
              <button
                key={code}
                type="button"
                onClick={() => handleLaunch(code)}
                aria-label={`${t('open')} · ${displayName}`}
                title={`${t('open')} · ${displayName}`}
                className={`${chipClass} cursor-pointer transition-colors duration-150 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 active:bg-blue-200 dark:active:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
              >
                {chip}
              </button>
            ) : (
              <span key={code} className={chipClass}>
                {chip}
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
                  const trimmed = entry.trim();
                  const { href, label } = buildFonteLink(trimmed, question.fontePages?.[trimmed]);
                  return (
                    <li key={`${entry}-${idx}`}>
                      {href ? (
                        <PdfPageDialog
                          href={href}
                          label={label}
                          openInNewTabLabel={t('sourceOpenNewTab')}
                          closeLabel={t('sourceClose')}
                        />
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
