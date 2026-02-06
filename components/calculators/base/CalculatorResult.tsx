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
  blue: { bg: "bg-blue-50", text: "text-blue-800" },
  green: { bg: "bg-green-50", text: "text-green-800" },
  purple: { bg: "bg-purple-50", text: "text-purple-800" },
  orange: { bg: "bg-orange-50", text: "text-orange-800" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-800" },
  rose: { bg: "bg-rose-50", text: "text-rose-800" },
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
        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
          {label}
        </p>
      )}
      <p className={`text-sm font-semibold ${colorClasses.text}`}>{value}</p>
      {formula && (
        <p className="mt-1 text-xs text-gray-500 font-mono">
          {t("formula")}: {formula}
        </p>
      )}
    </div>
  );
}
