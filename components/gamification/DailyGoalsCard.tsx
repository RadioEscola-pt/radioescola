"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import type { DailyProgress, DailyGoal } from "@/lib/types/gamification";
import { getDailyGoalLabelKey } from "@/lib/gamification/daily-goals";

interface DailyGoalsCardProps {
  dailyProgress: DailyProgress | null;
  dailyGoalStreak: number;
}

export function DailyGoalsCard({ dailyProgress, dailyGoalStreak }: DailyGoalsCardProps) {
  const t = useTranslations("Gamification");

  if (!dailyProgress) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {t("dailyGoals.title")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("dailyGoals.loading")}
        </p>
      </div>
    );
  }

  const allComplete = dailyProgress.completed.length >= dailyProgress.goals.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          {t("dailyGoals.title")}
        </h3>
        {dailyGoalStreak > 0 && (
          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
            {t("dailyGoals.streak", { count: dailyGoalStreak })}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {dailyProgress.goals.map((goal) => (
          <DailyGoalItem
            key={goal.id}
            goal={goal}
            progress={dailyProgress.progress[goal.id] ?? 0}
            isCompleted={dailyProgress.completed.includes(goal.id)}
          />
        ))}
      </div>

      {allComplete && !dailyProgress.bonusClaimed && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300 text-sm">
          <Gift className="h-4 w-4" />
          <span>{t("dailyGoals.bonusReady")}</span>
        </div>
      )}

      {allComplete && dailyProgress.bonusClaimed && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-400 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{t("dailyGoals.allComplete")}</span>
        </div>
      )}
    </div>
  );
}

function DailyGoalItem({
  goal,
  progress,
  isCompleted,
}: {
  goal: DailyGoal;
  progress: number;
  isCompleted: boolean;
}) {
  const t = useTranslations("Gamification");
  const labelKey = getDailyGoalLabelKey(goal.type);

  return (
    <div className="flex items-center gap-3">
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              isCompleted
                ? "text-slate-500 dark:text-slate-400 line-through"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {t(labelKey, { count: goal.target })}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400">
            +{goal.xpReward} XP
          </span>
        </div>
        {!isCompleted && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(100, (progress / goal.target) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {progress}/{goal.target}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
