import React from 'react';
import Link from 'next/link';
import { BookOpen, ClipboardCheck, IdCard, Radio, ExternalLink, Building2 } from 'lucide-react';

export default function HomePage() {
  const categories = [
    { id: '3', name: 'Categoria 3', img: '/images/cat3/cover.webp' },
    { id: '2', name: 'Categoria 2', img: '/images/cat2/cover.webp' },
    { id: '1', name: 'Categoria 1', img: '/images/cat1/cover.jpg' },
  ];

  const styles: Record<string, {
    badgeBg: string;
    badgeText: string;
    solidBtn: string;
    outlineBtn: string;
  }> = {
    // 3 = entry (green)
    '3': {
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
      solidBtn: 'bg-green-600 text-white hover:bg-green-700',
      outlineBtn: 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400',
    },
    // 2 = intermediate (amber)
    '2': {
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
      solidBtn: 'bg-amber-600 text-white hover:bg-amber-700',
      outlineBtn: 'border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400',
    },
    // 1 = highest (rose)
    '1': {
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      solidBtn: 'bg-rose-600 text-white hover:bg-rose-700',
      outlineBtn: 'border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-400',
    },
  };

  return (
    <main className="p-8">
      <section className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border mb-8">
        <div className="px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Ham Radio Study</h1>
          <p className="mt-3 text-gray-700 max-w-2xl">
            Practice with real questions, take timed exams, and review your results. Choose a category to get started.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/exam/3" className={`px-4 py-2 rounded ${styles['3'].solidBtn}`}>Take Exam (Cat 3)</Link>
            <Link href="/browse/3" className={`px-4 py-2 rounded border ${styles['3'].outlineBtn}`}>Browse Questions</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const s = styles[c.id] ?? styles['3'];
            return (
            <div key={c.id} className="border rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
              {c.img && (
          <div className="h-40 w-full overflow-hidden bg-gray-100">
            <img src={c.img} alt={`${c.name} illustration`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
              )}
              <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.badgeBg} ${s.badgeText}`}>CAT {c.id}</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Link href={`/browse/${c.id}`} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors text-center ${s.outlineBtn}`}>Browse</Link>
            <Link href={`/exam/${c.id}`} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-center ${s.solidBtn}`}>Simulation</Link>
          </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-indigo-600" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900">Ham Radio in Portugal: Due Process</h2>
          </div>
          <p className="mt-2 text-gray-700">
            A quick, practical path to get on the air legally in Portugal.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/70 backdrop-blur border p-4 flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">1) Study & Practice</h3>
                <p className="text-sm text-gray-700">Cover the syllabus for Cat 3, 2, or 1. Use browse and simulation exams here.</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/70 backdrop-blur border p-4 flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ClipboardCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">2) Take the Exam</h3>
                <p className="text-sm text-gray-700">Register with ANACOM and pass the exam to obtain the aptitude certificate.</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/70 backdrop-blur border p-4 flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <IdCard className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">3) License & Callsign</h3>
                <p className="text-sm text-gray-700">Apply for your amateur radio license and callsign with ANACOM and pay fees.</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/70 backdrop-blur border p-4 flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Radio className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">4) Operate Responsibly</h3>
                <p className="text-sm text-gray-700">Follow your category privileges and comply with national and CEPT rules.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 text-sm text-gray-700">
            <Building2 className="h-4 w-4 text-indigo-600 mt-0.5" aria-hidden />
            <p>
              Tip: Check official forms on ANACOM and consider a local club for mentoring.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.anacom.pt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/80 border border-indigo-200 text-indigo-700 hover:bg-white"
            >
              ANACOM
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="https://www.rep.pt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/80 border border-indigo-200 text-indigo-700 hover:bg-white"
            >
              REP
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
