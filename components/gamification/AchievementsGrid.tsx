"use client";

import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import { Lock } from "lucide-react";
import type { Achievement, UnlockedAchievement } from "@/lib/types/gamification";

interface AchievementsGridProps {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  maxDisplay?: number;
  onViewAll?: () => void;
}

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  uncommon: "from-green-400 to-green-500",
  rare: "from-blue-400 to-blue-500",
  epic: "from-purple-400 to-purple-500",
  legendary: "from-amber-400 to-orange-500",
};

const rarityBgColors = {
  common: "bg-slate-100 dark:bg-slate-700/50",
  uncommon: "bg-green-50 dark:bg-green-900/20",
  rare: "bg-blue-50 dark:bg-blue-900/20",
  epic: "bg-purple-50 dark:bg-purple-900/20",
  legendary: "bg-amber-50 dark:bg-amber-900/20",
};

export function AchievementsGrid({
  achievements,
  unlockedAchievements,
  maxDisplay,
  onViewAll,
}: AchievementsGridProps) {
  const t = useTranslations("Gamification");
  const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));

  const displayAchievements = maxDisplay
    ? achievements.slice(0, maxDisplay)
    : achievements;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          {t("achievements.title")}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {t("achievements.progress", { unlocked: unlockedCount, total: totalCount })}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {displayAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.has(achievement.id)}
          />
        ))}
      </div>

      {onViewAll && maxDisplay && achievements.length > maxDisplay && (
        <button
          onClick={onViewAll}
          className="mt-4 w-full text-center text-sm text-amber-600 dark:text-amber-400 hover:underline"
        >
          {t("achievements.viewAll")}
        </button>
      )}
    </div>
  );
}

function AchievementBadge({
  achievement,
  isUnlocked,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
}) {
  const t = useTranslations("Gamification");
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[achievement.icon] ?? LucideIcons.Star;

  return (
    <div className="group relative">
      <div
        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${
          isUnlocked
            ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        {isUnlocked ? (
          <IconComponent className="w-1/2 h-1/2 text-white" />
        ) : (
          <Lock className="w-1/2 h-1/2 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {isUnlocked || !achievement.secret
          ? t(achievement.nameKey)
          : t("achievements.secret")}
      </div>
    </div>
  );
}

export function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const t = useTranslations("Gamification");
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[achievement.icon] ?? LucideIcons.Star;

  return (
    <div
      className={`p-4 rounded-lg ${
        isUnlocked ? rarityBgColors[achievement.rarity] : "bg-slate-100 dark:bg-slate-700/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            isUnlocked
              ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
              : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          {isUnlocked ? (
            <IconComponent className="w-6 h-6 text-white" />
          ) : (
            <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {isUnlocked || !achievement.secret
              ? t(achievement.nameKey)
              : t("achievements.secret")}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isUnlocked || !achievement.secret
              ? t(achievement.descriptionKey)
              : "???"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 capitalize">
              {achievement.rarity}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              +{achievement.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
