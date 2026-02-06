"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  share,
  canUseNativeShare,
  getShareUrl,
  type ShareContent,
  type SharePlatform,
} from "@/lib/share";

interface ShareButtonProps {
  content: ShareContent;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md";
}

const platformConfig = [
  {
    id: "twitter" as const,
    icon: Twitter,
    labelKey: "twitter",
    colorClass: "hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20",
  },
  {
    id: "facebook" as const,
    icon: Facebook,
    labelKey: "facebook",
    colorClass: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20",
  },
  {
    id: "linkedin" as const,
    icon: Linkedin,
    labelKey: "linkedin",
    colorClass: "hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20",
  },
];

export function ShareButton({
  content,
  className,
  iconOnly = false,
  size = "md",
}: ShareButtonProps) {
  const t = useTranslations("Share");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleNativeShare = async () => {
    const success = await share(content, "native");
    if (success) {
      setOpen(false);
    }
  };

  const handlePlatformShare = (platform: Exclude<SharePlatform, "native" | "copy">) => {
    const url = getShareUrl(content, platform);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
      setOpen(false);
    }
  };

  const handleCopy = async () => {
    const success = await share(content, "copy");
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = size === "sm"
    ? "p-1.5 text-xs"
    : "p-2 text-sm";

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-md transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-700",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            sizeClasses,
            className
          )}
          title={t("title")}
        >
          <Share2 className={cn(iconSize, "text-muted-foreground")} />
          {!iconOnly && <span className="ml-1.5">{t("title")}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-1">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {t("title")}
          </p>

          {/* Native share (mobile) */}
          {canUseNativeShare() && (
            <button
              onClick={handleNativeShare}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                "transition-colors",
                "hover:bg-gray-100 dark:hover:bg-slate-700"
              )}
            >
              <Share2 className="w-4 h-4" />
              <span>{t("native")}</span>
            </button>
          )}

          {/* Social platforms */}
          {platformConfig.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformShare(platform.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                "transition-colors",
                platform.colorClass
              )}
            >
              <platform.icon className="w-4 h-4" />
              <span>{t(platform.labelKey)}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1 h-px bg-border" />

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
              "transition-colors",
              copied
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "hover:bg-gray-100 dark:hover:bg-slate-700"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t("copyLink")}</span>
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ShareButton;
