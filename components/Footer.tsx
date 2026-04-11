"use client";

import Link from "next/link";
import { Github, MessageCircle, Smartphone, Bug, Info, Radio, Zap, BarChart3, GraduationCap, School, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { EXTERNAL_LINKS } from "@/lib/config";

const internalLinks = [
  { href: "/drill", icon: Zap, labelKey: "quickDrill" },
  { href: "/dashboard", icon: BarChart3, labelKey: "progress" },
  { href: "/ser-radioamador", icon: GraduationCap, labelKey: "becomeHam" },
  { href: "/about", icon: Info, labelKey: "about" },
  { href: "/estado-da-escola", icon: School, labelKey: "schoolStatus" },
  { href: "/estado-da-nacao", icon: TrendingUp, labelKey: "nationStatus" },
] as const;

const externalLinks = [
  { href: EXTERNAL_LINKS.TELEGRAM, icon: MessageCircle, labelKey: "telegram" },
  { href: EXTERNAL_LINKS.GOOGLE_PLAY, icon: Smartphone, labelKey: "app" },
  { href: EXTERNAL_LINKS.GITHUB_REPO, icon: Github, labelKey: "sourceCode" },
  { href: EXTERNAL_LINKS.GITHUB_ISSUES, icon: Bug, labelKey: "reportError" },
] as const;

const linkClasses = "flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors dark:text-slate-400 dark:hover:text-amber-400";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Mobile: 2-column grid, Desktop: single row */}
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:hidden px-4">
          <div className="flex flex-col gap-3">
            {internalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.labelKey} href={link.href} className={linkClasses}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {externalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.labelKey} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(link.labelKey)}</span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* Desktop: horizontal row */}
        <nav className="hidden sm:flex flex-wrap justify-center gap-x-6 gap-y-2">
          {internalLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.labelKey} href={link.href} className={linkClasses}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(link.labelKey)}</span>
              </Link>
            );
          })}
          {externalLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.labelKey} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(link.labelKey)}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm text-slate-500 text-center dark:text-slate-400">
            {t("slogan")}
          </p>
          <Link href="/" className="logo-link flex items-center gap-2 text-slate-400 transition-colors hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400">
            <Radio className="logo-radio-icon h-4 w-4" />
            <span className="text-sm font-medium tracking-tight">Rádio Escola</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
