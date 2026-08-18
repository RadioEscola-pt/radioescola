"use client";

import React from 'react';
import DOMPurify from 'dompurify';
import { Calculator, ChevronRight, FileText, FileX } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Question, SourceRef } from '@/lib/types';
import { getCalculatorMeta } from '@/lib/config';
import type { CalculatorCode } from '@/lib/types';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/answer-option';
import BookmarkButton from '@/components/BookmarkButton';
import PdfPageDialog from '@/components/PdfPageDialog';
import StudyGuideLink from '@/components/StudyGuideLink';
import {
  RESOURCE_ROW, RESOURCE_ROW_INERT, RESOURCE_TILE, RESOURCE_TITLE, RESOURCE_SUBTITLE, RESOURCE_CHEVRON,
} from '@/components/ui/resource-row';

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

/**
 * Papers are named `YYYY_MM_DD`; a day of `00` means we only know the month.
 * Shown as a real date because "2014_05_23" is a filename, not a citation.
 */
function formatExamDate(file: string, locale: string): string {
  const parts = file.split('_');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return file;
  }
  const hasDay = Number.isFinite(day) && day > 0;
  const parted = new Intl.DateTimeFormat(locale, {
    ...(hasDay ? { day: 'numeric' as const } : {}),
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(Date.UTC(year, month - 1, hasDay ? day : 1)));
  // Keep the locale's field order but drop its connective words ("2 de jan.
  // de 2024" is too long for a chip), keeping punctuation like the en comma.
  return parted
    .map((part) => (part.type === 'literal' && /\p{L}/u.test(part.value) ? ' ' : part.value))
    .join('')
    .trim();
}

function buildSourceLink(source: SourceRef, locale: string) {
  // No parsing: the pdf, pergunta number and page arrive as separate fields.
  // The pergunta number is never rendered as a page — a paper carries about
  // four questions per page, so they diverge immediately. Without a resolved
  // page the PDF opens at the start.
  const [folder, file] = source.pdf.split('/');
  if (!folder || !file) {
    return { date: source.pdf, href: null };
  }
  const date = formatExamDate(file, locale);
  // The paper is cited but we do not hold it; linking would 404. Keep the
  // citation visible — it is still provenance — and drop the link.
  if (source.unavailable) {
    return { date, href: null };
  }
  const base = `/exams/${source.pdf}.pdf`;
  return {
    href: source.page ? `${base}#page=${source.page}` : base,
    date,
  };
}

// The notes arrive as sanitized MDX-rendered HTML, so Tailwind's preflight has
// already stripped paragraph margins and list markers from it. Restore the
// rhythm for the tags the notes corpus actually uses: prose, the occasional
// bullet list, and the formula/diagram images.
const NOTES_PROSE = [
  'max-w-[68ch] leading-relaxed',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg',
  '[&_img]:border [&_img]:border-slate-200 dark:[&_img]:border-slate-700',
  // Inline diagrams draw with currentColor, so they follow the theme.
  '[&_svg]:my-3 [&_svg]:max-w-full [&_svg]:h-auto',
  '[&_strong]:font-semibold [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300',
  '[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline',
].join(' ');

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
  const locale = useLocale();
  const isAnswered = selectedOption !== undefined;
  const [remoteNotesHtml, setRemoteNotesHtml] = React.useState<string | null>(null);
  const [remoteNotesLoading, setRemoteNotesLoading] = React.useState(false);
  const [remoteNotesError, setRemoteNotesError] = React.useState<string | null>(null);

  // One key for the whole request. It is the only dependency of the fetch
  // effect on purpose: putting the loading flag in the deps makes the effect
  // tear itself down the moment it sets it, which cancels its own response.
  const notesKey = ended && categoryId && question.hasNotesMdx
    ? `${encodeURIComponent(categoryId)}/${encodeURIComponent(String(question.id))}`
    : null;

  React.useEffect(() => {
    setRemoteNotesHtml(null);
    setRemoteNotesError(null);
  }, [question.id, categoryId]);

  React.useEffect(() => {
    if (!notesKey) return;

    let cancelled = false;
    setRemoteNotesLoading(true);
    setRemoteNotesError(null);
    fetch(`/api/notes/${notesKey}`)
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
      });

    return () => {
      cancelled = true;
    };
  }, [notesKey]);

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
        <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4 text-sm">
          {(remoteNotesLoading || remoteNotesError || resolvedNotes) && (
            <div className="text-slate-600 dark:text-slate-400">
              <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">{t('explanation')}</p>
              {remoteNotesLoading && (
                <div className="max-w-[68ch] space-y-2" aria-hidden="true">
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse motion-reduce:animate-none" />
                </div>
              )}
              {remoteNotesError && !remoteNotesLoading && (
                <p className="text-red-600 dark:text-red-400">{t('notesError')}</p>
              )}
              {!remoteNotesLoading && !remoteNotesError && resolvedNotes && (
                <div className={NOTES_PROSE} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolvedNotes) }} />
              )}
            </div>
          )}
          {question.tutorial && (
            <div>
              <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">{t('studyLibrary')}</p>
              <StudyGuideLink
                slug={question.tutorial}
                readTimeLabel={(minutes) => t('readTime', { minutes })}
              />
            </div>
          )}
          {question.sources && question.sources.length > 0 && (
            <div className="text-slate-600 dark:text-slate-400">
              <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">{t('officialSource')}</p>
              <ul className="flex flex-col">
                {question.sources.map((source, idx) => {
                  const { href, date } = buildSourceLink(source, locale);
                  const description = t('sourceDescription', { date, question: source.question });
                  // The page was previously only in the link fragment. It is
                  // the useful half of the citation, so it is shown.
                  const detail = source.page
                    ? `${t('sourceQuestion', { question: source.question })} · ${t('sourcePage', { page: source.page })}`
                    : t('sourceQuestion', { question: source.question });
                  return (
                    <li key={`${source.pdf}-${source.question}-${idx}`}>
                      {href ? (
                        <PdfPageDialog
                          href={href}
                          label={description}
                          openInNewTabLabel={t('sourceOpenNewTab')}
                          closeLabel={t('sourceClose')}
                          triggerClassName={`group ${RESOURCE_ROW}`}
                        >
                          <span className={`${RESOURCE_TILE} bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400`} aria-hidden="true">
                            <FileText className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={RESOURCE_TITLE}>{date}</span>
                            <span className={RESOURCE_SUBTITLE}>{detail}</span>
                          </span>
                          <ChevronRight className={RESOURCE_CHEVRON} />
                        </PdfPageDialog>
                      ) : (
                        <span className={RESOURCE_ROW_INERT}>
                          <span className={`${RESOURCE_TILE} bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600`} aria-hidden="true">
                            <FileX className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-slate-400 dark:text-slate-500">{date}</span>
                            <span className={RESOURCE_SUBTITLE}>
                              {detail}
                              {source.unavailable && ` · ${t('sourceUnavailable')}`}
                            </span>
                          </span>
                        </span>
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
