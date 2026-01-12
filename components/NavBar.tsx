"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, BookOpen, FileText, Info, Calculator, ChevronDown, Upload, GraduationCap, BarChart3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import { useCalculators } from "@/components/providers/CalculatorProvider";
import type { CalculatorCode } from "@/lib/types";

const categories = [
  { id: "3", title: "Categoria 3", description: "Entrada" },
  { id: "2", title: "Categoria 2", description: "Intermédio" },
  { id: "1", title: "Categoria 1", description: "Avançado" },
] as const;

const exams = categories.map((cat) => ({
  title: cat.title,
  href: `/exam/${cat.id}`,
  description: cat.description,
}));

const browse: { title: string; href: string; description: string }[] = categories.flatMap((cat) => [
  {
    title: `${cat.title}`,
    href: `/browse/${cat.id}`,
    description: `${cat.description} - completo`,
  },
  {
    title: `${cat.title}`,
    href: `/browse/${cat.id}/flash`,
    description: `${cat.description} - flashcards`,
  },
  {
    title: `${cat.title}`,
    href: `/browse/${cat.id}/smart-practice`,
    description: `${cat.description} - prática inteligente`,
  },
]);

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
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-slate-100">
          <span className="text-2xl">📻</span>
          Rádio Escola
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <Home className="mr-2 h-4 w-4" />
            {t("home")}
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {t("dashboard")}
          </Link>

          <Link
            href="/study"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {t("study")}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none data-[state=open]:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100 dark:data-[state=open]:bg-slate-700">
              <BookOpen className="mr-2 h-4 w-4" />
              {t("browse")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {browse.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none data-[state=open]:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100 dark:data-[state=open]:bg-slate-700">
              <FileText className="mr-2 h-4 w-4" />
              {t("exams")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {exams.map((exam) => (
                <DropdownMenuItem key={exam.href} asChild>
                  <Link href={exam.href} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{exam.title}</span>
                      <span className="text-xs text-muted-foreground">{exam.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
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

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none data-[state=open]:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100 dark:data-[state=open]:bg-slate-700">
              <Calculator className="mr-2 h-4 w-4" />
              {t("calculators")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
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
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <Info className="mr-2 h-4 w-4" />
            {t("about")}
          </Link>

          <Link
            href="/ser-radioamador"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-200 focus:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            {t("becomeHam")}
          </Link>
        </nav>

        {/* Desktop Language Switcher & Theme Toggle */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu */}
        <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      </div>
    </header>
  );
}
