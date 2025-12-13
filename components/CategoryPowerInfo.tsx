"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryPowerInfoProps {
  text: string;
  footnote: string;
  showFootnote: boolean;
  accentColor: string;
  badgeBg: string;
}

export default function CategoryPowerInfo({
  text,
  footnote,
  showFootnote,
  accentColor,
  badgeBg,
}: CategoryPowerInfoProps) {
  if (!showFootnote) {
    return <span className="text-sm text-slate-700 dark:text-slate-300">{text}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 hover:underline underline-offset-2 cursor-help"
        >
          {text}
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${badgeBg}`}>
            <Info className={`h-3 w-3 ${accentColor}`} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" side="top">
        <p className="text-slate-600 dark:text-slate-400">{footnote}</p>
      </PopoverContent>
    </Popover>
  );
}
