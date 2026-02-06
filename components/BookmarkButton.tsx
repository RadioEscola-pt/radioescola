"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => Promise<void> | void;
  size?: "sm" | "md";
  className?: string;
}

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  size = "md",
  className,
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
        isBookmarked
          ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={cn(iconSize, isBookmarked && "fill-current")}
      />
    </button>
  );
}
