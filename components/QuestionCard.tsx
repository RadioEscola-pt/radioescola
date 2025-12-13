import React from 'react';
import DOMPurify from 'dompurify';
import { Question } from '@/lib/types';

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
}) => {
  const isAnswered = selectedOption !== undefined;
  const handleLaunch = React.useCallback(() => {
    if (question.calc && onLaunchCalculator) {
      onLaunchCalculator(question.calc);
    }
  }, [onLaunchCalculator, question.calc]);

  return (
    <div className="p-4 border rounded-md mb-4 bg-white">
      {showCalcHint && question.calc && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          <span>Suggested calculator:</span>
          <span className="font-semibold">{question.calc}</span>
          {onLaunchCalculator && (
            <button
              type="button"
              onClick={handleLaunch}
              className="rounded bg-blue-600 px-2 py-1 text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Open
            </button>
          )}
        </div>
      )}
      <h2 className="font-semibold mb-1">
        {indexNumber ? `${indexNumber}. ` : ''}{question.question}
      </h2>
      {showId && (
        <div className="text-xs text-gray-500 mb-2">ID: {question.id}</div>
      )}
      <div className="grid gap-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const base = 'text-left border rounded px-3 py-2 transition-colors';
          const cls = ended
            ? idx === question.correctIndex
              ? isSelected
                ? 'bg-green-100 border-green-400'
                : 'bg-white border-green-300'
              : isSelected
                ? 'bg-red-100 border-red-400'
                : 'bg-white border-gray-200'
            : isAnswered
              ? isSelected
                ? 'bg-blue-100 border-blue-300'
                : 'bg-white border-gray-200 opacity-70'
              : 'hover:bg-gray-50 border-gray-200';
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled || ended}
              onClick={() => onSelect(idx)}
              className={[base, cls].join(' ')}
            >
              <span className="mr-2 font-mono">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          );
        })}
      </div>
      {showImage && question.img && (
        <div className="mt-3">
          <img src={question.img} alt={question.question} className="max-h-64 rounded border" />
        </div>
      )}
      {ended && (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            {selectedOption === question.correctIndex ? (
              <span className="text-green-700">Correct</span>
            ) : (
              <span className="text-red-700">{isAnswered ? 'Incorrect' : 'Unanswered'}</span>
            )}
          </p>
          {question.notes && (
            <div
              className="text-gray-700 [&_a]:text-blue-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.notes) }}
            />
          )}
          {question.tutorial && (
            <div>
              <span className="font-semibold text-gray-700">Related tutorial:</span>{' '}
              <a className="text-blue-600 underline" href={`/study/${question.tutorial}`}>
                {question.tutorial}
              </a>
            </div>
          )}
          {question.fonte && question.fonte.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Fonte oficial:</span>
              <ul className="mt-1 space-y-1 list-disc list-inside text-gray-700">
                {question.fonte.map((entry, idx) => {
                  const { href, label } = buildFonteLink(entry);
                  return (
                    <li key={`${entry}-${idx}`}>
                      {href ? (
                        <a className="text-blue-600 underline" href={href} target="_blank" rel="noreferrer">
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
