"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { CalculatorColor } from "@/lib/types";

interface CalculatorResultProps {
  label?: string;
  value: string;
  color?: CalculatorColor;
  /**
   * The expression the calculator just applied. A plain string keeps the
   * monospaced look the other eight calculators were written against; a node
   * lets one hand over rendered maths (KaTeX) instead, without every caller
   * having to opt into a second prop.
   */
  formula?: React.ReactNode;
}

const RESULT_CLASSES: Record<CalculatorColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-800 dark:text-blue-300" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-800 dark:text-green-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-800 dark:text-purple-300" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-800 dark:text-orange-300" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-800 dark:text-cyan-300" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-800 dark:text-rose-300" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-800 dark:text-amber-300" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-800 dark:text-indigo-300" },
  teal: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-800 dark:text-teal-300" },
};

export function CalculatorResult({
  label,
  value,
  color = "blue",
  formula,
}: CalculatorResultProps) {
  const t = useTranslations("Calculators.common");
  const colorClasses = RESULT_CLASSES[color];

  return (
    <div className={`rounded-md ${colorClasses.bg} px-3 py-2`}>
      {label && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
      <p className={`text-sm font-semibold ${colorClasses.text}`}>{value}</p>
      {/*
        A div, not a p: rendered maths is block-level markup, and nesting it in
        a paragraph is invalid HTML that React reports as a hydration mismatch.
        `overflow-x-auto` because the window is 320px wide and an expression
        that does not fit has to scroll inside this box rather than push the
        calculator open.
      */}
      {formula !== undefined && formula !== "" && (
        <div className="mt-1 overflow-x-auto text-xs text-slate-500 dark:text-slate-400">
          {t("formula")}:{" "}
          {typeof formula === "string" ? <span className="font-mono">{formula}</span> : formula}
        </div>
      )}
    </div>
  );
}
