import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const categories = [
    { id: '3', name: 'Categoria 3', img: '/images/cat3/cover.webp' },
    { id: '2', name: 'Categoria 2', img: '/images/cat2/cover.webp' },
    { id: '1', name: 'Categoria 1', img: '/images/cat1/cover.jpg' },
  ];

  return (
    <main className="p-8">
      <section className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border mb-8">
        <div className="px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Ham Radio Study</h1>
          <p className="mt-3 text-gray-700 max-w-2xl">
            Practice with real questions, take timed exams, and review your results. Choose a category to get started.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/exam/3" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Take Exam (Cat 3)</Link>
            <Link href="/browse/3" className="px-4 py-2 rounded border text-indigo-700 border-indigo-200 hover:bg-indigo-50">Browse Questions</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="border rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
              {c.img && (
          <div className="h-40 w-full overflow-hidden bg-gray-100">
            <img src={c.img} alt={`${c.name} illustration`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
              )}
              <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">CAT {c.id}</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Link href={`/browse/${c.id}`} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">Browse</Link>
            <Link href={`/exam/${c.id}`} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center">Exam</Link>
          </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
