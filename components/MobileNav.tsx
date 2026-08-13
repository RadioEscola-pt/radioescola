"use client";
import Link from "next/link";
import { Home, BookOpen, FileText, Upload, Menu, GraduationCap, BarChart3, Settings, Globe, Zap, Radio, TrendingUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

import { useCalculators } from "@/components/providers/CalculatorProvider";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/config/categories";
import type { CalculatorCode } from "@/lib/types";


interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { openCalculator, getAllCalculators } = useCalculators();
  const t = useTranslations("NavBar");
  const tc = useTranslations("Calculators");

  const calculators = getAllCalculators();

  const closeMenu = () => onOpenChange(false);

  const handleCalculatorClick = (code: CalculatorCode) => {
    openCalculator(code);
    closeMenu();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="md:hidden">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          aria-label={t("menu")}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Radio className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="tracking-tight">Rádio Escola</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 mt-6">
          {/* Home Link */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>

          {/* Accordion for nested items */}
          <Accordion type="multiple" className="w-full">
            {/* Study Accordion — includes browse/practice */}
            <AccordionItem value="study" className="border-none">
              <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:no-underline">
                <span className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  {t("study")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="flex flex-col gap-1 pl-7">
                  {/* Quick actions */}
                  <Link
                    href="/drill"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                    {t("quickDrill")}
                  </Link>
                  <Link
                    href="/study"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100"
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{t("studyLibrary")}</span>
                  </Link>

                  <div className="border-t my-1" />

                  {/* Categories */}
                  {CATEGORIES.map((catId, idx) => {
                    const cfg = CATEGORY_CONFIG[catId];
                    const Icon = cfg.icon;
                    return (
                    <div key={catId}>
                      {idx > 0 && <div className="border-t my-1" />}
                      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {t("category", { id: catId })}
                      </span>
                      <Link
                        href={`/browse/${catId}`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {t("questions")}
                      </Link>
                      <Link
                        href={`/browse/${catId}/flash`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {t("flashcards")}
                      </Link>
                      <Link
                        href={`/browse/${catId}/smart-practice`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {t("smartPractice")}
                      </Link>
                    </div>
                    );
                  })}

                  <div className="border-t my-1" />

                  {/* Calculators */}
                  <span className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t("calculators")}
                  </span>
                  {calculators.map((calc) => {
                    const Icon = calc.icon;
                    const key = calc.translationKey;
                    return (
                      <button
                        key={calc.code}
                        type="button"
                        onClick={() => handleCalculatorClick(calc.code)}
                        className="flex items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 w-full"
                      >
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{tc(`${key}.shortTitle`)}</span>
                          <span className="text-xs text-muted-foreground">{tc(`${key}.description`)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Exams Accordion */}
            <AccordionItem value="exams" className="border-none">
              <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:no-underline">
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  {t("exams")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="flex flex-col gap-1 pl-7">
                  {CATEGORIES.map((catId) => {
                    const cfg = CATEGORY_CONFIG[catId];
                    const Icon = cfg.icon;
                    return (
                    <Link
                      key={catId}
                      href={`/exam/${catId}`}
                      onClick={closeMenu}
                      className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{t("category", { id: catId })}</span>
                        <span className="text-xs text-muted-foreground">{t(`categoryDesc.${catId}`)}</span>
                      </div>
                    </Link>
                    );
                  })}
                  <div className="border-t my-1" />
                  <Link
                    href="/submit-exam"
                    onClick={closeMenu}
                    className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t("submitExam")}</span>
                      <span className="text-xs text-muted-foreground">{t("submitExamDesc")}</span>
                    </div>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          {/* Estado da Nação */}
          <Link
            href="/estado-da-nacao"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <TrendingUp className="h-4 w-4" />
            {t("nationStatus")}
          </Link>


          {/* Become Ham Link */}
          <Link
            href="/ser-radioamador"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <GraduationCap className="h-4 w-4" />
            {t("becomeHam")}
          </Link>

          {/* Settings Section */}
          <div className="border-t pt-2 mt-2">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="settings" className="border-none">
                <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:no-underline dark:text-slate-300 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    {t("settings")}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-1">
                  <div className="flex flex-col gap-1 pl-7">
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium">{t("dashboard")}</span>
                    </Link>
                    <div className="flex items-center justify-between rounded-md px-3 py-2">
                      <span className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4" />
                        {t("language")}
                      </span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
