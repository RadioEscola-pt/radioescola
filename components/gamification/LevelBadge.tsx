"use client";

import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import type { Level } from "@/lib/types/gamification";

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
};

const iconSizes = {
  sm: 14,
  md: 20,
  lg: 28,
};

export function LevelBadge({ level, size = "md", showName = true }: LevelBadgeProps) {
  const t = useTranslations("Gamification");

  // Get the icon component dynamically
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[level.icon] ?? LucideIcons.Star;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg`}
      >
        <IconComponent size={iconSizes[size]} />
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("level", { level: level.level })}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {level.name}
          </span>
        </div>
      )}
    </div>
  );
}
