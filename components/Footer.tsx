"use client";

import { Github, MessageCircle, Smartphone, Bug } from "lucide-react";
import { useTranslations } from "next-intl";
import { EXTERNAL_LINKS } from "@/lib/config";

const links = [
  {
    href: EXTERNAL_LINKS.GITHUB_ISSUES,
    icon: Bug,
    labelKey: "reportError",
  },
  {
    href: EXTERNAL_LINKS.GITHUB_REPO,
    icon: Github,
    labelKey: "sourceCode",
  },
  {
    href: EXTERNAL_LINKS.TELEGRAM,
    icon: MessageCircle,
    labelKey: "telegram",
  },
  {
    href: EXTERNAL_LINKS.GOOGLE_PLAY,
    icon: Smartphone,
    labelKey: "app",
  },
] as const;

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.labelKey}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors dark:text-slate-400 dark:hover:text-amber-400"
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(link.labelKey)}</span>
                </a>
              );
            })}
          </div>

          {/* Slogan */}
          <p className="text-sm text-slate-500 text-center dark:text-slate-400">
            {t("slogan")}
          </p>

          {/* Logo */}
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <span className="text-lg">📻</span>
            <span className="text-sm font-medium">Rádio Escola</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
