"use client";

import { useTranslations } from "next-intl";
import type { Level } from "@/lib/types/gamification";

interface XPBarProps {
  currentXP: number;
  levelXP: number;
  requiredXP: number;
  percentage: number;
  level: Level;
  compact?: boolean;
}

export function XPBar({
  currentXP,
  levelXP,
  requiredXP,
  percentage,
  level,
  compact = false,
}: XPBarProps) {
  const t = useTranslations("Gamification");

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {currentXP} XP
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {t("level", { level: level.level })}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {level.name}
          </span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {requiredXP > 0
            ? t("xpProgress", { current: levelXP, required: requiredXP })
            : t("maxLevel")}
        </span>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
        {currentXP} XP {t("total")}
      </div>
    </div>
  );
}
