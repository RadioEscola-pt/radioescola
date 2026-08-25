"use client";

import React from "react";
import { findMatch } from "@/lib/utils";

interface HighlightProps {
  text: string;
  /** Search term to mark. Falsy or unmatched renders the text untouched. */
  term?: string | undefined;
}

/**
 * Marks the first occurrence of `term` in `text`.
 *
 * Only the first: a question that says "antena" four times would otherwise
 * turn into a stripe of highlight and become harder to read than it was
 * unmarked. One mark answers the question the reader has — why did this
 * result appear — and stops.
 */
export function Highlight({ text, term }: HighlightProps) {
  const range = term ? findMatch(text, term) : null;
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range.start)}
      <mark className="rounded-sm bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-500/40 dark:text-amber-50">
        {text.slice(range.start, range.end)}
      </mark>
      {text.slice(range.end)}
    </>
  );
}
