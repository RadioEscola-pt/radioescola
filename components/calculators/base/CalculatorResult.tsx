"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { CalculatorColor } from "@/lib/types";

interface CalculatorResultProps {
  label?: string;
  value: string;
  color?: CalculatorColor;
  formula?: string;
}

const RESULT_CLASSES: Record<CalculatorColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-800 dark:text-blue-300" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-800 dark:text-green-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-800 dark:text-purple-300" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-800 dark:text-orange-300" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-800 dark:text-cyan-300" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-800 dark:text-rose-300" },
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
      {formula && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {t("formula")}: {formula}
        </p>
      )}
    </div>
  );
}
