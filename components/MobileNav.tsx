"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calculator,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  Layers,
  List,
  Menu,
  Sigma,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import LogoMark from "@/components/brand/LogoMark";
import LogoWordmark from "@/components/brand/LogoWordmark";
import {
  Sheet,
  SheetClose,
  SheetContent,
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
import {
  mobileRow,
  mobileRowActive,
  mobileSubRow,
  mobileSubRowStacked,
  navIconButton,
} from "./nav-styles";

import { useCalculators } from "@/components/providers/CalculatorProvider";
import {
  CATEGORIES,
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY,
  type CategoryId,
} from "@/lib/config/categories";
import { categoryFromPathname, navSections } from "@/lib/nav-sections";
import { cn } from "@/lib/utils";
import type { CalculatorCode } from "@/lib/types";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Indents a nested block to sit under its parent row's icon, on a hairline. */
const NESTED = "ml-[22px] flex flex-col gap-0.5 border-l border-slate-200 pl-2 dark:border-slate-800";

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { openCalculator, getAllCalculators } = useCalculators();
  const t = useTranslations("NavBar");
  const tc = useTranslations("Calculators");
  const pathname = usePathname();

  const section = navSections(pathname);
  const [picked, setPicked] = useState<CategoryId | null>(null);
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);

  // One picker instead of the same three links repeated per category. It opens
  // on wherever you already are; your pick then stands until the drawer is
  // closed and reopened, which is the natural moment to re-sync with the page.
  const category = picked ?? categoryFromPathname(pathname) ?? DEFAULT_CATEGORY;
  const categoryConfig = CATEGORY_CONFIG[category];

  const calculators = getAllCalculators();

  const closeMenu = () => onOpenChange(false);

  const handleOpenChange = (next: boolean) => {
    if (next) setPicked(null);
    onOpenChange(next);
  };

  const handleCalculatorClick = (code: CalculatorCode) => {
    openCalculator(code);
    closeMenu();
  };

  // Highlight what the route actually is, never what the picker points at —
  // changing the picker retargets these links, it does not move the visitor.
  const studyActions = [
    { href: `/browse/${category}`, icon: List, label: t("questions") },
    { href: `/browse/${category}/flash`, icon: Layers, label: t("flashcards") },
    { href: `/browse/${category}/smart-practice`, icon: Target, label: t("smartPractice") },
  ];

  const openSections = [
    section.study ? "study" : null,
    section.exams ? "exams" : null,
  ].filter((v): v is string => v !== null);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild className="lg:hidden">
        <button type="button" className={navIconButton} aria-label={t("menu")}>
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        hideClose
        className="flex w-[88vw] max-w-[360px] flex-col gap-0 p-0"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 pl-4 pr-2 dark:border-slate-800">
          <SheetTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <LogoMark className="h-9 w-auto shrink-0 text-slate-900 dark:text-white" />
            <LogoWordmark className="h-4 w-auto text-slate-900 dark:text-white" />
          </SheetTitle>
          <SheetClose
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </SheetClose>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/"
              onClick={closeMenu}
              aria-current={section.home ? "page" : undefined}
              className={cn(mobileRow, section.home && mobileRowActive)}
            >
              <Home className="h-5 w-5 shrink-0" />
              {t("home")}
            </Link>

            <Accordion type="multiple" defaultValue={openSections} className="w-full">
              {/* Aprender — browse, practice, the formulary and the calculators */}
              <AccordionItem value="study" className="border-none">
                <AccordionTrigger
                  className={cn(mobileRow, "hover:no-underline", section.study && mobileRowActive)}
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 shrink-0" />
                    {t("study")}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 pb-2 pt-1">
                  <div className={NESTED}>
                    <Link href="/drill" onClick={closeMenu} className={mobileSubRow}>
                      <Zap className="h-[18px] w-[18px] shrink-0 text-amber-500" />
                      {t("quickDrill")}
                    </Link>
                    <Link href="/aprender" onClick={closeMenu} className={mobileSubRow}>
                      <BookOpen className="h-[18px] w-[18px] shrink-0" />
                      {t("studyLibrary")}
                    </Link>
                    <Link href="/aprender/formulario" onClick={closeMenu} className={mobileSubRow}>
                      <Sigma className="h-[18px] w-[18px] shrink-0 text-violet-500" />
                      {t("formulary")}
                    </Link>
                  </div>

                  {/* Pick the category once; the three links below retarget. The
                      control is a recessed track with one solid thumb — the number
                      is the identity, so it is the biggest thing in the drawer. */}
                  <div
                    role="group"
                    aria-label={t("categoryPicker")}
                    className="relative grid grid-cols-3 rounded-xl bg-slate-200 p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.09)] dark:bg-slate-800/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    {/* The thumb slides rather than blinking, so the switch reads
                        as one control changing and not three separate buttons. */}
                    <span
                      aria-hidden="true"
                      style={{ transform: `translateX(${CATEGORIES.indexOf(category) * 100}%)` }}
                      className={cn(
                        "pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg shadow-sm",
                        "transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                        categoryConfig.segmentSelected
                      )}
                    />
                    {CATEGORIES.map((catId) => {
                      const cfg = CATEGORY_CONFIG[catId];
                      const Icon = cfg.icon;
                      const selected = catId === category;
                      return (
                        <button
                          key={catId}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`${t("category", { id: catId })} — ${t(`categoryDesc.${catId}`)}`}
                          onClick={() => setPicked(catId)}
                          className={cn(
                            "relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-lg transition-colors duration-200",
                            selected
                              ? "text-white"
                              // slate-500 on the slate-200 track is 3.86:1 — under AA for the 10px label.
                              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <Icon
                              className={cn(
                                "h-[15px] w-[15px] shrink-0 transition-opacity",
                                selected ? "opacity-90" : "opacity-70"
                              )}
                            />
                            <span className="text-[26px] font-bold leading-none tabular-nums">
                              {catId}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "text-[10px] leading-none",
                              selected ? "font-semibold" : "font-medium"
                            )}
                          >
                            {t(`categoryDesc.${catId}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* No wrapper: these belong to the choice above by adjacency and
                      by taking its colour, which beats nesting a card in a card. */}
                  <div className={cn(NESTED, "-mt-1")}>
                    {studyActions.map(({ href, icon: Icon, label }) => {
                      const active = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          className={cn(mobileSubRow, active && mobileRowActive)}
                        >
                          <Icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                              !active && categoryConfig.badgeText
                            )}
                          />
                          {label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Six calculators folded behind one row, not spilled into the list */}
                  <div className={NESTED}>
                    <button
                      type="button"
                      onClick={() => setCalculatorsOpen((v) => !v)}
                      aria-expanded={calculatorsOpen}
                      aria-controls="mobile-nav-calculators"
                      className={mobileSubRow}
                    >
                      <Calculator className="h-[18px] w-[18px] shrink-0" />
                      {t("calculators")}
                      <span className="ml-auto flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {calculators.length}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                            calculatorsOpen && "rotate-180"
                          )}
                        />
                      </span>
                    </button>
                    <div
                      id="mobile-nav-calculators"
                      hidden={!calculatorsOpen}
                      className="flex flex-col gap-0.5"
                    >
                      {calculators.map((calc) => {
                        const Icon = calc.icon;
                        const key = calc.translationKey;
                        return (
                          <button
                            key={calc.code}
                            type="button"
                            onClick={() => handleCalculatorClick(calc.code)}
                            className={mobileSubRowStacked}
                          >
                            <Icon className="h-[18px] w-[18px] shrink-0" />
                            <span className="flex min-w-0 flex-col">
                              <span className="font-medium">{tc(`${key}.shortTitle`)}</span>
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                {tc(`${key}.description`)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Exames */}
              <AccordionItem value="exams" className="border-none">
                <AccordionTrigger
                  className={cn(mobileRow, "hover:no-underline", section.exams && mobileRowActive)}
                >
                  <span className="flex items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0" />
                    {t("exams")}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-1">
                  <div className={NESTED}>
                    {CATEGORIES.map((catId) => {
                      const Icon = CATEGORY_CONFIG[catId].icon;
                      const href = `/exam/${catId}`;
                      const active = pathname === href;
                      return (
                        <Link
                          key={catId}
                          href={href}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          className={cn(mobileSubRowStacked, active && mobileRowActive)}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="flex min-w-0 flex-col">
                            <span className="font-medium">{t("category", { id: catId })}</span>
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                              {t(`categoryDesc.${catId}`)}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                    <Link
                      href="/submit-exam"
                      onClick={closeMenu}
                      className={cn(
                        mobileSubRowStacked,
                        pathname.startsWith("/submit-exam") && mobileRowActive
                      )}
                    >
                      <Upload className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{t("submitExam")}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t("submitExamDesc")}
                        </span>
                      </span>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Link
              href="/estado-da-nacao"
              onClick={closeMenu}
              aria-current={section.nation ? "page" : undefined}
              className={cn(mobileRow, section.nation && mobileRowActive)}
            >
              <TrendingUp className="h-5 w-5 shrink-0" />
              {t("nationStatus")}
            </Link>

            <Link
              href="/ser-radioamador"
              onClick={closeMenu}
              aria-current={section.becomeHam ? "page" : undefined}
              className={cn(mobileRow, section.becomeHam && mobileRowActive)}
            >
              <GraduationCap className="h-5 w-5 shrink-0" />
              {t("becomeHam")}
            </Link>
          </div>
        </nav>

        {/* Utility bar, pinned within thumb reach rather than buried in an accordion */}
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-slate-800">
          <Link
            href="/dashboard"
            onClick={closeMenu}
            aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
            className={cn(
              "flex min-h-[52px] flex-1 items-center gap-3 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
              pathname.startsWith("/dashboard") && "bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
            )}
          >
            <BarChart3 className="h-5 w-5 shrink-0" />
            {t("dashboard")}
          </Link>
          <LanguageSwitcher triggerClassName="h-[52px] w-[52px] rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
