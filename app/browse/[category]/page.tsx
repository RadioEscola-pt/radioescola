"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Category } from '../../../lib/types';
import { loadData } from '../../../lib/data';
import QuestionCard from '../../../components/QuestionCard';

export default function BrowsePage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const cat = typeof params.category === 'string' ? params.category : Array.isArray(params.category) ? params.category[0] : '3';
    loadData().then((data) => {
      setCategory(data.categories[cat] ?? null);
    });
  }, [params.category]);

  if (!category) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Browse {category.name}</h1>
      </div>
      {category.questions.map((q, idx) => {
        const selected = answers[q.id];
        const isAnswered = selected !== undefined;
        return (
          <QuestionCard
            key={q.id}
            question={q}
            selectedOption={selected}
            onSelect={(choice) => {
              setAnswers((prev) => {
                if (Object.prototype.hasOwnProperty.call(prev, q.id)) return prev;
                return { ...prev, [q.id]: choice };
              });
            }}
            showImage
            indexNumber={idx + 1}
            showId
            ended={isAnswered}
          />
        );
      })}
    </main>
  );
}
