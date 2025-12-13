"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, BookOpen, FileText, Radio, Info, Calculator, ChevronDown, Upload, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleMobileCalculatorClick = (code: CalculatorCode) => {
    openCalculator(code);
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Radio className="h-6 w-6" />
          HamRadioStudy
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <Home className="mr-2 h-4 w-4" />
            {t("home")}
          </Link>

          <Link
            href="/study"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {t("study")}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
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
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
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
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
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
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <Info className="mr-2 h-4 w-4" />
            {t("about")}
          </Link>
        </nav>

        {/* Desktop Language Switcher */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
              aria-label={t("menu")}
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] overflow-y-auto">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                HamRadioStudy
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 mt-6">
              {/* Home Link */}
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                {t("home")}
              </Link>

              {/* Accordion for nested items */}
              <Accordion type="multiple" className="w-full">
                {/* Study Accordion */}
                <AccordionItem value="study" className="border-none">
                  <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline">
                    <span className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4" />
                      {t("study")}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-1">
                    <div className="flex flex-col gap-1 pl-7">
                      <Link
                        href="/study"
                        onClick={closeMobileMenu}
                        className="flex flex-col rounded-md px-3 py-2 hover:bg-accent"
                      >
                        <span className="text-sm font-medium">{t("studyAll")}</span>
                        <span className="text-xs text-muted-foreground">{t("studyAllDesc")}</span>
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/study?cat=${cat.id}`}
                          onClick={closeMobileMenu}
                          className="flex flex-col rounded-md px-3 py-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">{cat.title}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Browse Accordion */}
                <AccordionItem value="browse" className="border-none">
                  <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline">
                    <span className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4" />
                      {t("browse")}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-1">
                    <div className="flex flex-col gap-1 pl-7">
                      {browse.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className="flex flex-col rounded-md px-3 py-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Exams Accordion */}
                <AccordionItem value="exams" className="border-none">
                  <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline">
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
                          onClick={closeMobileMenu}
                          className="flex flex-col rounded-md px-3 py-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">{exam.title}</span>
                          <span className="text-xs text-muted-foreground">{exam.description}</span>
                        </Link>
                      ))}
                      <div className="border-t my-1" />
                      <Link
                        href="/submit-exam"
                        onClick={closeMobileMenu}
                        className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-accent"
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

                {/* Calculators Accordion */}
                <AccordionItem value="calculators" className="border-none">
                  <AccordionTrigger className="w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline">
                    <span className="flex items-center gap-3">
                      <Calculator className="h-4 w-4" />
                      {t("calculators")}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-1">
                    <div className="flex flex-col gap-1 pl-7">
                      {calculators.map((calc) => {
                        const Icon = calc.icon;
                        const key = calc.translationKey;
                        return (
                          <button
                            key={calc.code}
                            type="button"
                            onClick={() => handleMobileCalculatorClick(calc.code)}
                            className="flex items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-accent w-full"
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
              </Accordion>

              {/* About Link */}
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Info className="h-4 w-4" />
                {t("about")}
              </Link>

              {/* Language Switcher in Mobile */}
              <div className="border-t pt-4 mt-2">
                <LanguageSwitcher />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
