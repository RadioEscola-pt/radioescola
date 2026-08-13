"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Home, BookOpen, FileText, Calculator, ChevronDown, Upload, GraduationCap, BarChart3, UserCircle, Globe, Zap, Radio, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import { useCalculators } from "@/components/providers/CalculatorProvider";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/config/categories";
import type { CalculatorCode } from "@/lib/types";

const triggerClasses = "inline-flex h-9 whitespace-nowrap items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none data-[state=open]:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100 dark:data-[state=open]:bg-slate-700";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCalculator, getAllCalculators } = useCalculators();
  const t = useTranslations("NavBar");
  const tc = useTranslations("Calculators");

  const calculators = getAllCalculators();

  const handleCalculatorClick = (code: CalculatorCode) => {
    openCalculator(code);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-slate-50/70 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="logo-link flex shrink-0 items-center gap-2 whitespace-nowrap font-bold text-lg text-slate-800 transition-colors hover:text-amber-700 dark:text-slate-100 dark:hover:text-amber-300">
          <Radio className="logo-radio-icon h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span className="tracking-tight">Rádio Escola</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-9 whitespace-nowrap items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <Home className="mr-2 h-4 w-4" />
            {t("home")}
          </Link>

          {/* Study — merged with Browse */}
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClasses}>
              <BookOpen className="mr-2 h-4 w-4" />
              {t("study")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[480px] p-0">
              {/* Top: quick actions */}
              <div className="p-1.5 flex gap-1">
                <DropdownMenuItem asChild className="flex-1 whitespace-nowrap">
                  <Link href="/drill" className="cursor-pointer">
                    <Zap className="mr-2 h-4 w-4 text-amber-500" />
                    {t("quickDrill")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex-1 whitespace-nowrap">
                  <Link href="/study" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t("studyLibrary")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex-1 whitespace-nowrap">
                    <Calculator className="mr-2 h-4 w-4" />
                    {t("calculators")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[220px]">
                    {calculators.map((calc) => {
                      const Icon = calc.icon;
                      const key = calc.translationKey;
                      return (
                        <DropdownMenuItem
                          key={calc.code}
                          className="cursor-pointer"
                          onClick={() => handleCalculatorClick(calc.code)}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium">{tc(`${key}.shortTitle`)}</span>
                              <span className="text-xs text-muted-foreground">{tc(`${key}.description`)}</span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>

              <DropdownMenuSeparator className="my-0" />

              {/* Category grid */}
              <div className="grid grid-cols-3 gap-0 p-1.5">
                {CATEGORIES.map((catId) => {
                  const cfg = CATEGORY_CONFIG[catId];
                  const Icon = cfg.icon;
                  return (
                  <div key={catId} className="flex flex-col">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 py-1">
                      <Icon className="h-3.5 w-3.5" />
                      {t("category", { id: catId })}
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/browse/${catId}`} className="cursor-pointer text-sm">
                        {t("questions")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/browse/${catId}/flash`} className="cursor-pointer text-sm">
                        {t("flashcards")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/browse/${catId}/smart-practice`} className="cursor-pointer text-sm">
                        {t("smartPractice")}
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Exams */}
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClasses}>
              <FileText className="mr-2 h-4 w-4" />
              {t("exams")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {CATEGORIES.map((catId) => {
                const cfg = CATEGORY_CONFIG[catId];
                const Icon = cfg.icon;
                return (
                <DropdownMenuItem key={catId} asChild>
                  <Link href={`/exam/${catId}`} className="cursor-pointer">
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{t("category", { id: catId })}</span>
                        <span className="text-xs text-muted-foreground">{t(`categoryDesc.${catId}`)}</span>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/submit-exam" className="cursor-pointer">
                  <div className="flex items-start gap-2">
                    <Upload className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{t("submitExam")}</span>
                      <span className="text-xs text-muted-foreground">{t("submitExamDesc")}</span>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/estado-da-nacao"
            className="inline-flex h-9 whitespace-nowrap items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("nationStatus")}
          </Link>


          <Link
            href="/ser-radioamador"
            className="inline-flex h-9 whitespace-nowrap items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            {t("becomeHam")}
          </Link>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Desktop Profile Dropdown */}
          <div className="hidden lg:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100">
                <UserCircle className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    {t("language")}
                  </span>
                  <LanguageSwitcher />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </div>
      </div>
    </header>
  );
}
