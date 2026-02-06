"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, BookOpen, Layers, Zap } from "lucide-react";

type StudyMode = "exam" | "browse" | "flash" | "smart";

const MODE_CONFIG = {
  exam: { icon: FileText, label: "EXAM" },
  browse: { icon: BookOpen, label: "BROWSE" },
  flash: { icon: Layers, label: "FLASH" },
  smart: { icon: Zap, label: "SMART" },
} as const;

const CATEGORY_ACCENT: Record<string, string> = {
  "3": "bg-green-500",
  "2": "bg-amber-500",
  "1": "bg-rose-500",
};

const CATEGORY_DOT: Record<string, string> = {
  "3": "bg-green-400",
  "2": "bg-amber-400",
  "1": "bg-rose-400",
};

interface StudyHeaderProps {
  categoryId: string;
  mode: StudyMode;
  backHref?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function StudyHeader({
  categoryId,
  mode,
  backHref,
  subtitle,
  children,
}: StudyHeaderProps) {
  const { icon: Icon, label } = MODE_CONFIG[mode];
  const accent = CATEGORY_ACCENT[categoryId] ?? "bg-amber-500";
  const dot = CATEGORY_DOT[categoryId] ?? "bg-amber-400";
  const href = backHref ?? "/";

  return (
    <div className="sticky top-14 z-10 -mx-4 sm:-mx-0 mb-4">
      {/* Category accent stripe */}
      <div className={`h-[2px] ${accent}`} />

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: back + mode/category */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={href}
              className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 min-w-0">
              {/* Mode badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.1em] text-slate-400 dark:text-slate-500 uppercase font-mono leading-none select-none">
                <Icon className="w-3 h-3" />
                {label}
              </span>

              <span className="text-slate-200 dark:text-slate-700 select-none">/</span>

              {/* Category indicator */}
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
                  Cat {categoryId}
                </span>
              </span>

              {/* Subtitle */}
              {subtitle && (
                <>
                  <span className="text-slate-200 dark:text-slate-700 select-none hidden sm:inline">
                    &middot;
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 leading-none hidden sm:inline truncate">
                    {subtitle}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right side: controls slot */}
          {children && (
            <div className="flex items-center gap-2 shrink-0">
              {children}
            </div>
          )}
        </div>

        {/* Subtitle on mobile (below, when hidden on desktop) */}
        {subtitle && (
          <p className="mt-1 ml-[2.375rem] text-xs text-slate-400 dark:text-slate-500 sm:hidden">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
