"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { lookupQuestion } from '@/lib/question-lookup';
import type { Question } from '@/lib/types';

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; question: Question }
  | { status: 'missing' }
  | { status: 'error' };

/**
 * Fetches a question the first time its preview is actually opened.
 *
 * Deliberately lazy: a formula row carries up to six references and a section
 * carries dozens, so fetching on mount would pull the whole bank down to render
 * a page nobody has pointed at yet.
 */
const LOADING: PreviewState = { status: 'loading' };

export function useQuestionPreview(ref: string, active: boolean): PreviewState {
  const [state, setState] = useState<PreviewState>({ status: 'idle' });
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    let alive = true;
    lookupQuestion(ref)
      .then((q) => {
        if (!alive) return;
        setState(q ? { status: 'ready', question: q } : { status: 'missing' });
      })
      .catch(() => {
        if (!alive) return;
        // Let a later open try again — the category cache already dropped it.
        started.current = false;
        setState({ status: 'error' });
      });
    return () => { alive = false; };
  }, [ref, active]);

  // `loading` is derived rather than set at the top of the effect: the only
  // moment it is true is between opening and the fetch settling, which is
  // exactly "active, and nothing has come back yet".
  return active && state.status === 'idle' ? LOADING : state;
}

/**
 * True where the primary input cannot hover — a phone or tablet.
 *
 * Starts false so server and client render the same markup, then corrects on
 * mount. Nothing about the trigger's markup depends on it: it only decides
 * whether a tap previews or follows the link.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return coarse;
}

/**
 * Open/close with hover intent.
 *
 * The delays are what stop a wall of reference chips flickering cards as the
 * cursor crosses them, and the close delay is what lets you travel from the
 * chip into the card without it vanishing under the pointer.
 */
export function useHoverIntent(openDelay = 140, closeDelay = 180) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }, []);

  const schedule = useCallback((next: boolean, delay: number) => {
    clear();
    timer.current = setTimeout(() => setOpen(next), delay);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return {
    open,
    setOpen: (next: boolean) => { clear(); setOpen(next); },
    onEnter: () => schedule(true, openDelay),
    onLeave: () => schedule(false, closeDelay),
  };
}
