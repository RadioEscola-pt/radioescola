"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye } from 'lucide-react';
import { CATEGORY_CONFIG, type CategoryId } from '@/lib/config/categories';
import { parseQuestionRef } from '@/lib/question-lookup';
import type { PreviewState } from '@/hooks/useQuestionPreview';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Ref({ refId, cat }: { refId: string; cat: CategoryId | null }) {
  const cfg = cat ? CATEGORY_CONFIG[cat] : null;
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-700/60">
      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
        {refId.replace('#', ' · ')}
      </span>
      {cfg && cat && (
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${cfg.badgeBg} ${cfg.badgeText}`}>
          {cat}
        </span>
      )}
    </div>
  );
}

/** Three lines of grey where the stem and the first options will land. */
function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2 px-3 py-3 motion-reduce:animate-none" aria-hidden="true">
      <div className="h-3 w-[92%] rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-[70%] rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-1.5 h-8 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

/**
 * The preview body: stem, options, and the answer behind one deliberate step.
 *
 * Withholding the answer is the whole point of this card. The formulary is a
 * study surface as much as a lookup one, and a card that hands you the right
 * option the moment you point at a reference takes the question away from
 * anyone using it to test themselves. Showing the options costs nothing —
 * knowing which one is right is the part you have to ask for.
 */
export function QuestionPreviewCard({
  refId,
  state,
  onNavigate,
}: {
  refId: string;
  state: PreviewState;
  onNavigate?: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const cat = parseQuestionRef(refId)?.cat ?? null;
  const href = cat ? `/browse/${cat}#q-${parseQuestionRef(refId)?.id}` : null;

  // No reset needed: neither the popover nor the sheet keeps its content
  // mounted while closed, so every open starts with the answer hidden again —
  // which is the point of showing it behind a step at all.

  // `R` reveals, matching the hint on the button. Guarded on the focused
  // element so it cannot fire while somebody is typing in the page's search.
  useEffect(() => {
    if (state.status !== 'ready' || revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'r' && e.key !== 'R') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      setRevealed(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.status, revealed]);

  if (state.status === 'loading' || state.status === 'idle') {
    return <><Ref refId={refId} cat={cat} /><Skeleton /></>;
  }

  if (state.status === 'missing' || state.status === 'error') {
    return (
      <>
        <Ref refId={refId} cat={cat} />
        <p className="px-3 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
          {state.status === 'missing'
            ? 'Esta pergunta já não faz parte do banco.'
            : 'Não foi possível carregar a pergunta.'}
        </p>
      </>
    );
  }

  const { question } = state;

  return (
    <>
      <Ref refId={refId} cat={cat} />

      <p className="px-3 pb-1 pt-3 text-[13.5px] leading-relaxed text-pretty text-slate-900 dark:text-slate-100">
        {question.question}
      </p>

      {/* Some stems are meaningless without the figure — "o valor da
          resistência apresentada na figura" names nothing on its own. */}
      {question.img && (
        <div className="px-3 pt-2">
          <Image
            src={question.img}
            alt=""
            width={380}
            height={280}
            className="h-auto max-h-40 w-full rounded border border-slate-200 bg-white object-contain dark:border-slate-700"
            unoptimized
          />
        </div>
      )}

      <ul className="flex flex-col gap-1 px-3 pb-3 pt-2">
        {question.options.map((option, i) => {
          const correct = revealed && i === question.correctIndex;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded border-l-4 px-3 py-2 transition-colors duration-150 motion-reduce:transition-none ${
                correct
                  ? 'border-green-500 bg-green-200 dark:bg-green-800/60'
                  : 'border-transparent bg-slate-100 dark:bg-slate-700'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/50 text-xs font-bold text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                {LETTERS[i] ?? i + 1}
              </span>
              <span className="pt-0.5 text-[13px] leading-snug text-slate-700 dark:text-slate-200">{option}</span>
              {correct && <span className="sr-only">(resposta correta)</span>}
            </li>
          );
        })}
      </ul>

      {/* The extra bottom inset is for the sheet on a phone, where the home
          indicator sits exactly where this row lands. */}
      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-slate-700/60 dark:bg-slate-900/40">
        {!revealed ? (
          <>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-800 transition-colors duration-150 hover:bg-amber-100 motion-reduce:transition-none dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Ver resposta
            </button>
            <kbd className="ml-auto hidden rounded border border-slate-200 bg-white px-1 py-px font-mono text-[10.5px] text-slate-500 sm:inline dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
              R
            </kbd>
          </>
        ) : (
          href && (
            <Link
              href={href}
              onClick={onNavigate}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              Abrir no banco
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )
        )}
      </div>
    </>
  );
}
