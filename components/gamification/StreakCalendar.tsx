"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { XPEvent } from "@/lib/types/gamification";

interface StreakCalendarProps {
  xpHistory: XPEvent[];
  weeks?: number;
}

// Maximum reasonable XP per event (sanity check for corrupted data)
const MAX_EVENT_XP = 1000;

// Aggregate XP by date
function aggregateXPByDate(xpHistory: XPEvent[]): Map<string, number> {
  const dailyXP = new Map<string, number>();

  for (const event of xpHistory) {
    const date = new Date(event.timestamp).toISOString().split("T")[0];
    if (date) {
      // Cap individual event amounts to prevent corrupted data from skewing display
      const safeAmount = Math.min(event.amount, MAX_EVENT_XP);
      dailyXP.set(date, (dailyXP.get(date) ?? 0) + safeAmount);
    }
  }

  return dailyXP;
}

// Get intensity level (0-4) based on XP
function getIntensity(xp: number, maxXP: number): number {
  if (xp === 0) return 0;
  if (maxXP === 0) return 1;
  const ratio = xp / maxXP;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

// Get dates for the last N weeks
function getCalendarDates(weeks: number): string[][] {
  const result: string[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Monday of the week that was (weeks) weeks ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);

  // Adjust to start on Monday
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);

  // Build weeks array (each week is Monday-Sunday)
  for (let week = 0; week < weeks + 1; week++) {
    const weekDates: string[] = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      if (currentDate <= today) {
        weekDates.push(currentDate.toISOString().split("T")[0]!);
      }
    }
    if (weekDates.length > 0) {
      result.push(weekDates);
    }
  }

  return result;
}

const intensityColors = [
  "bg-slate-100 dark:bg-slate-800", // 0 - no activity
  "bg-green-200 dark:bg-green-900/50", // 1 - low
  "bg-green-300 dark:bg-green-800/70", // 2 - medium-low
  "bg-green-400 dark:bg-green-700/80", // 3 - medium-high
  "bg-green-500 dark:bg-green-600", // 4 - high
];

export function StreakCalendar({ xpHistory, weeks = 16 }: StreakCalendarProps) {
  const t = useTranslations("StreakCalendar");

  const dailyXP = useMemo(() => aggregateXPByDate(xpHistory), [xpHistory]);
  const calendarWeeks = useMemo(() => getCalendarDates(weeks), [weeks]);

  const maxXP = useMemo(() => {
    let max = 0;
    dailyXP.forEach((xp) => {
      if (xp > max) max = xp;
    });
    return max;
  }, [dailyXP]);

  // Calculate streak
  const { currentStreak, totalDays } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]!;
    const sortedDates = [...dailyXP.keys()].sort().reverse();

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Check if there's activity today or yesterday (to not break streak on current day)
    const todayStr = checkDate.toISOString().split("T")[0]!;
    const yesterdayDate = new Date(checkDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0]!;

    if (!dailyXP.has(todayStr)) {
      // No activity today, start counting from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0]!;
      if (dailyXP.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { currentStreak: streak, totalDays: dailyXP.size };
  }, [dailyXP]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("title")}
        </h3>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{t("currentStreak", { days: currentStreak })}</span>
          <span>{t("totalDays", { days: totalDays })}</span>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1 text-xs text-slate-500 dark:text-slate-400">
          {dayLabels.map((label, idx) => (
            <div key={idx} className="h-3 w-3 flex items-center justify-center">
              {idx % 2 === 0 ? label : ""}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1 overflow-x-auto">
          {calendarWeeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {dayLabels.map((_, dayIdx) => {
                const date = week[dayIdx];
                if (!date) {
                  return <div key={dayIdx} className="w-3 h-3" />;
                }

                const xp = dailyXP.get(date) ?? 0;
                const intensity = getIntensity(xp, maxXP);
                const formattedDate = new Date(date).toLocaleDateString();

                return (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${intensityColors[intensity]} cursor-pointer transition-colors hover:ring-1 hover:ring-slate-400`}
                    title={xp > 0 ? `${formattedDate}: ${t("xpEarned", { xp })}` : formattedDate}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
        <span>{t("lessActive")}</span>
        {intensityColors.map((color, idx) => (
          <div key={idx} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>{t("moreActive")}</span>
      </div>
    </div>
  );
}

export default StreakCalendar;
