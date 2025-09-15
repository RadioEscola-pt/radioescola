"use client"

import React from 'react';
import QuestionCard from './QuestionCard';
import { Question } from '../lib/types';

type CorrectSpecifier = number | string; // index, letter (e.g., 'C'), or exact option text

interface StudyQuestionCardProps {
  prompt: string;
  options: string[];
  correct: CorrectSpecifier;
  indexNumber?: number;
  disabled?: boolean;
  ended?: boolean; // force review mode externally
  revealOnSelect?: boolean; // default true
  onAnswer?: (selectedIndex: number, selectedLetter: string, isCorrect: boolean) => void;
}

const toIndex = (correct: CorrectSpecifier, options: string[]): number => {
  if (typeof correct === 'number') {
    return Math.max(0, Math.min(options.length - 1, correct));
  }
  // single-letter A..Z
  const up = correct.toUpperCase();
  if (/^[A-Z]$/.test(up)) {
    const idx = up.charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) return idx;
  }
  // try match by option text
  const found = options.indexOf(correct);
  return found >= 0 ? found : 0;
};

const StudyQuestionCard: React.FC<StudyQuestionCardProps> = ({
  prompt,
  options,
  correct,
  indexNumber,
  disabled,
  ended,
  revealOnSelect = true,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    undefined
  );

  const correctIndex = React.useMemo(() => toIndex(correct, options), [correct, options]);

  const q: Question = {
    id: 0,
    question: prompt,
    options,
    correctIndex,
  };

  const handleSelect = (idx: number) => {
    if (disabled) return;
    setSelectedIndex(idx);
    const letter = String.fromCharCode(65 + idx);
    onAnswer?.(idx, letter, idx === q.correctIndex);
  };

  const showEnded = ended ?? (revealOnSelect && selectedIndex !== undefined);

  return (
    <QuestionCard
      question={q}
      selectedOption={selectedIndex}
      onSelect={handleSelect}
      indexNumber={indexNumber}
      ended={showEnded}
      disabled={disabled}
    />
  );
};

export default StudyQuestionCard;
