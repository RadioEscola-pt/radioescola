"use client";
import Link from "next/link";
import { Home, BookOpen, FileText, Radio, Info, Calculator, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCalculators } from "@components/providers/CalculatorProvider";

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

const browseComplete = categories.map((cat) => ({
  title: `${cat.title}`,
  href: `/browse/${cat.id}`,
  description: `${cat.description} - completo`,
}));

const browseFlashcards = categories.map((cat) => ({
  title: `${cat.title}`,
  href: `/browse/${cat.id}/flash`,
  description: `${cat.description} - flashcards`,
}));

const calculators = [
  {
    title: "Ohm's Law",
    description: "Solve voltage, current, or resistance.",
    action: "ohm",
  },
  {
    title: "Component Sum",
    description: "Sum resistors, capacitors, or inductors.",
    action: "componentSum",
  },
] as const;

export default function NavBar() {
  const { openOhms, openComponentSum } = useCalculators();
  const t = useTranslations("NavBar");

  return (
    <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Radio className="h-6 w-6" />
          HamRadioStudy
        </Link>
        <nav className="flex items-center gap-1">
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("browseComplete")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-[240px]">
                  {browseComplete.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("browseFlashcards")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-[240px]">
                  {browseFlashcards.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
              <Calculator className="mr-2 h-4 w-4" />
              {t("calculators")}
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {calculators.map((calc) => (
                <DropdownMenuItem
                  key={calc.action}
                  className="cursor-pointer"
                  onClick={() => {
                    if (calc.action === "ohm") {
                      openOhms();
                    } else if (calc.action === "componentSum") {
                      openComponentSum();
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{calc.title}</span>
                    <span className="text-xs text-muted-foreground">{calc.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
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
        <LanguageSwitcher />
      </div>
    </header>
  );
}

