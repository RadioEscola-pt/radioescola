"use client";
import Link from "next/link";
import { Home, BookOpen, FileText, Upload, Menu, GraduationCap, BarChart3, Settings, Moon, Globe } from "lucide-react";
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
import ThemeToggle from "./ThemeToggle";
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-200 hover:text-slate-900"
          aria-label={t("menu")}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-slate-800">
            <span className="text-xl">📻</span>
            Rádio Escola
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 mt-6">
          {/* Home Link */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>

          {/* Accordion for nested items */}
          <Accordion type="multiple" className="w-full">
            {/* Study Accordion */}
            <AccordionItem value="study" className="border-none">
              <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:no-underline">
                <span className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  {t("study")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="flex flex-col gap-1 pl-7">
                  <Link
                    href="/study"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100"
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{t("studyLibrary")}</span>
                  </Link>
                  <div className="border-t my-1" />
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
                        className="flex items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100 w-full"
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

            {/* Browse Accordion */}
            <AccordionItem value="browse" className="border-none">
              <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:no-underline">
                <span className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  {t("browse")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="flex flex-col gap-1 pl-7">
                  {categories.map((cat, idx) => (
                    <div key={cat.id}>
                      {idx > 0 && <div className="border-t my-1" />}
                      <span className="px-3 py-1 text-xs font-medium text-muted-foreground">
                        {cat.title} ({cat.description})
                      </span>
                      <Link
                        href={`/browse/${cat.id}`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100"
                      >
                        {t("questions")}
                      </Link>
                      <Link
                        href={`/browse/${cat.id}/flash`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100"
                      >
                        {t("flashcards")}
                      </Link>
                      <Link
                        href={`/browse/${cat.id}/smart-practice`}
                        onClick={closeMenu}
                        className="flex rounded-md px-3 py-2 text-sm hover:bg-slate-100"
                      >
                        {t("smartPractice")}
                      </Link>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Exams Accordion */}
            <AccordionItem value="exams" className="border-none">
              <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:no-underline">
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  {t("exams")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="flex flex-col gap-1 pl-7">
                  {exams.map((exam) => (
                    <Link
                      key={exam.href}
                      href={exam.href}
                      onClick={closeMenu}
                      className="flex flex-col rounded-md px-3 py-2 hover:bg-slate-100"
                    >
                      <span className="text-sm font-medium">{exam.title}</span>
                      <span className="text-xs text-muted-foreground">{exam.description}</span>
                    </Link>
                  ))}
                  <div className="border-t my-1" />
                  <Link
                    href="/submit-exam"
                    onClick={closeMenu}
                    className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-slate-100"
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
                        <Moon className="h-4 w-4" />
                        {t("theme")}
                      </span>
                      <ThemeToggle />
                    </div>
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
