"use client";

import { useTranslations } from "next-intl";
import { Lightbulb, Sun, Square, Focus, Maximize, ArrowUpRight } from "lucide-react";

const tips = [
  { key: "lighting", icon: Sun },
  { key: "flat", icon: Square },
  { key: "focus", icon: Focus },
  { key: "margins", icon: Maximize },
  { key: "angle", icon: ArrowUpRight },
] as const;

export function PhotoTips() {
  const t = useTranslations("SubmitExam.tips");

  return (
    <div className="rounded-xl border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 p-4">
      <h3 className="font-medium flex items-center gap-2 text-amber-800 dark:text-amber-300 mb-3">
        <Lightbulb className="h-4 w-4" />
        {t("title")}
      </h3>
      <ul className="space-y-2">
        {tips.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
