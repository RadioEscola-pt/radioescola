"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/setLocale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { locale: "en", labelKey: "english", flag: "/images/flags/en.svg", alt: "English" },
  { locale: "pt", labelKey: "portuguese", flag: "/images/flags/pt.svg", alt: "Português" },
] as const;

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("LanguageSwitcher");
  const [isPending, startTransition] = React.useTransition();

  const currentLanguage = LANGUAGES.find((lang) => lang.locale === locale) ?? LANGUAGES[0];
  const otherLanguages = LANGUAGES.filter((lang) => lang.locale !== currentLanguage.locale);

  const handleSelect = (nextLocale: string) => {
    if (isPending || nextLocale === locale) return;

    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  };

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-muted-foreground/40",
              "bg-background shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            aria-label={`${t("label")}: ${t(currentLanguage.labelKey)}`}
            disabled={isPending}
          >
            <Image
              src={currentLanguage.flag}
              alt={currentLanguage.alt}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {otherLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.locale}
              onSelect={() => handleSelect(lang.locale)}
              disabled={isPending}
              className="gap-2"
            >
              <Image
                src={lang.flag}
                alt={lang.alt}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="text-sm font-medium leading-none">{t(lang.labelKey)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
