import React from 'react';
import { Question } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  selectedOption?: number;
  onSelect: (index: number) => void;
  showImage?: boolean;
  indexNumber?: number; // 1-based index label to show before question
  showId?: boolean; // show unique ID label
  ended?: boolean; // when true, show correctness styling like exam review
  disabled?: boolean; // disable interaction
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
}) => {
  const isAnswered = selectedOption !== undefined;
  return (
    <div className="p-4 border rounded-md mb-4 bg-white">
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
        <p className="mt-2 text-sm">
          {selectedOption === question.correctIndex ? (
            <span className="text-green-700">Correct</span>
          ) : (
            <span className="text-red-700">{isAnswered ? 'Incorrect' : 'Unanswered'}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default QuestionCard;
