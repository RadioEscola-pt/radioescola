"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import { X } from "lucide-react";
import type { Achievement } from "@/lib/types/gamification";
import { useConfetti } from "@/hooks/useConfetti";

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  uncommon: "from-green-400 to-green-500",
  rare: "from-blue-400 to-blue-500",
  epic: "from-purple-400 to-purple-500",
  legendary: "from-amber-400 to-orange-500",
};

export function AchievementToast({
  achievement,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
}: AchievementToastProps) {
  const t = useTranslations("Gamification");
  const { celebrate } = useConfetti();
  const [isVisible, setIsVisible] = useState(false);

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[achievement.icon] ?? LucideIcons.Star;

  // Keep the latest onDismiss in a ref so the auto-hide effect can run once on
  // mount without a fresh inline onDismiss closure (passed by the container on
  // every parent re-render) restarting the timer and re-firing indefinitely.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Celebrate with confetti
    celebrate();

    // Auto-hide if enabled
    let hideTimer: NodeJS.Timeout | undefined;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismissRef.current(), 300);
      }, autoHideDelay);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [autoHide, autoHideDelay, celebrate]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header with gradient */}
        <div className={`h-1 bg-gradient-to-r ${rarityColors[achievement.rarity]}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${rarityColors[achievement.rarity]}`}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                {t("achievements.unlocked")}
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {t(achievement.nameKey)}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {t(achievement.descriptionKey)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                +{achievement.xpReward} XP
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AchievementToastContainerProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementToastContainer({
  achievements,
  onDismiss,
}: AchievementToastContainerProps) {
  if (achievements.length === 0) return null;

  // Only show the first achievement
  const firstAchievement = achievements[0];
  if (!firstAchievement) return null;

  return (
    <AchievementToast
      achievement={firstAchievement}
      onDismiss={() => onDismiss(firstAchievement.id)}
    />
  );
}
