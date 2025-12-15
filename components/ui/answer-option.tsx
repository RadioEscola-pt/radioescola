"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AnswerOptionState = "default" | "selected" | "correct" | "incorrect";

interface AnswerOptionProps {
  letter: string;
  children: React.ReactNode;
  state?: AnswerOptionState;
  disabled?: boolean;
  onClick?: () => void;
}

export function AnswerOption({
  letter,
  children,
  state = "default",
  disabled = false,
  onClick,
}: AnswerOptionProps) {
  const stateStyles = {
    default: "bg-slate-100 dark:bg-slate-700 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500",
    selected: "bg-amber-200 dark:bg-amber-700/60 border-amber-500",
    correct: "bg-green-200 dark:bg-green-800/60 border-green-500",
    incorrect: "bg-red-200 dark:bg-red-800/60 border-red-500",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full text-left border-l-4 rounded px-3 py-2 transition-all disabled:cursor-default flex items-start gap-3",
        stateStyles[state]
      )}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded bg-white/50 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
        {letter}
      </span>
      <span className="text-slate-700 dark:text-slate-200 text-sm pt-0.5">
        {children}
      </span>
    </button>
  );
}
