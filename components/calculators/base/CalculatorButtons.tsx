"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { CalculatorColor } from "@/lib/types";

interface CalculatorButtonsProps {
  onCalculate: () => void;
  onReset: () => void;
  color?: CalculatorColor;
  calculateLabel?: string;
  resetLabel?: string;
}

const BUTTON_CLASSES: Record<CalculatorColor, { bg: string; hover: string; focus: string }> = {
  blue: { bg: "bg-blue-600", hover: "hover:bg-blue-500", focus: "focus:ring-blue-500" },
  green: { bg: "bg-green-600", hover: "hover:bg-green-500", focus: "focus:ring-green-500" },
  purple: { bg: "bg-purple-600", hover: "hover:bg-purple-500", focus: "focus:ring-purple-500" },
  orange: { bg: "bg-orange-600", hover: "hover:bg-orange-500", focus: "focus:ring-orange-500" },
  cyan: { bg: "bg-cyan-600", hover: "hover:bg-cyan-500", focus: "focus:ring-cyan-500" },
  rose: { bg: "bg-rose-600", hover: "hover:bg-rose-500", focus: "focus:ring-rose-500" },
};

export function CalculatorButtons({
  onCalculate,
  onReset,
  color = "blue",
  calculateLabel,
  resetLabel,
}: CalculatorButtonsProps) {
  const t = useTranslations("Calculators.common");
  const colorClasses = BUTTON_CLASSES[color];

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onCalculate}
        className={`flex-1 rounded ${colorClasses.bg} px-3 py-2 text-white transition ${colorClasses.hover} focus:outline-none focus:ring-2 ${colorClasses.focus}`}
      >
        {calculateLabel ?? t("calculate")}
      </button>
      <button
        type="button"
        onClick={onReset}
        className={`rounded border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 ${colorClasses.focus}`}
      >
        {resetLabel ?? t("reset")}
      </button>
    </div>
  );
}
