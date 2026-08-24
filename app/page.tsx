import React from "react";
import Link from "next/link";
import { BookOpen, IdCard, Radio, ExternalLink, Building2, ArrowRight, Zap, Brain, Layers, Heart, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_CONFIG, CATEGORY_IMAGES } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Testimonials, type Testimonial } from "@/components/Testimonials";

type RawTestimonial = Omit<Testimonial, "categoryLabel">;

// Real operators only — a callsign is publicly registered to a named person,
// so a made-up one puts words in a real amateur's mouth.
const TESTIMONIALS: RawTestimonial[] = [
  {
    quote:
      "Comecei com o RadioEscola para tirar a Categoria 3 e voltei sempre que subi de categoria. É o único sítio onde encontrei a matéria toda organizada em português e com perguntas reais de exames, fez toda a diferença.",
    name: "Joel",
    callsign: "CS7BLE",
    category: "2",
  },
];

export default async function HomePage() {
  const t = await getTranslations("Home");

  const processSteps = [
    {
      icon: BookOpen,
      title: t("processSteps.study.title"),
      description: t("processSteps.study.description"),
    },
    {
      icon: IdCard,
      title: t("processSteps.examAndLicense.title"),
      description: t("processSteps.examAndLicense.description"),
    },
    {
      icon: Radio,
      title: t("processSteps.operate.title"),
      description: t("processSteps.operate.description"),
    },
  ];

  return (
    <div className="py-6 md:py-10">
      {/* Hero heading */}
      <section>
        <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
          {t("heroPrefix")}{" "}
          <span className="font-semibold text-amber-600 dark:text-amber-400">{t("heroAccent")}</span>
        </h1>

        {/* Category cards */}
        <div className="mt-8 md:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((id) => {
            const s = CATEGORY_CONFIG[id];
            const name = t("categoryName", { id });
            const browseLabel = t("categoryBrowse");
            const simulationLabel = t("categorySimulation");
            const image = CATEGORY_IMAGES[id];

            return (
              <div
                key={id}
                className="group relative overflow-hidden rounded-xl h-72 md:h-80 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted standalone build deliberately avoids the /_next/image optimizer */}
                <img
                  src={image}
                  alt={`${name} illustration`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-widest ${s.badgeText} ${s.badgeBg} rounded-full px-3 py-1`}>
                      {id === '3' ? t("categoryLevel.beginner") : id === '2' ? t("categoryLevel.intermediate") : t("categoryLevel.advanced")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">{name}</h2>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1" asChild>
                        <Link href={`/browse/${id}`}>{browseLabel}</Link>
                      </Button>
                      <Button className={`flex-1 ${s.solidBtn}`} asChild>
                        <Link href={`/exam/${id}`}>{simulationLabel}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        heading={t("testimonialsHeading")}
        items={TESTIMONIALS.map((item) => ({
          ...item,
          categoryLabel: t("categoryName", { id: item.category }),
        }))}
      />

      {/* Study modes */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t("featuresHeading")}</h2>

        <Link
          href="/drill"
          className="group relative mb-4 flex items-center gap-4 overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 sm:gap-5"
        >
          {/* Diagonal speed streaks — a sense of motion behind the challenge. */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full text-white/10" aria-hidden>
            {[0, 90, 180, 270, 360, 450, 540, 630].map((x) => (
              <line key={x} x1={x} y1="-20" x2={x - 80} y2="160" stroke="currentColor" strokeWidth="14" />
            ))}
          </svg>

          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Zap className="h-6 w-6" />
          </div>

          <div className="relative min-w-0 flex-1">
            <h3 className="text-lg font-bold tracking-tight sm:text-xl">{t("drillTitle")}</h3>
            <p className="mt-0.5 text-sm font-medium text-white/85">{t("drillDescription")}</p>
          </div>

          <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] sm:px-5 sm:py-2.5">
            <Play className="h-4 w-4 fill-current" aria-hidden />
            <span className="hidden sm:inline">{t("drillCta")}</span>
          </span>
        </Link>

        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {([
            { href: "/browse/3/smart-practice", icon: Brain, titleKey: "smartPracticeTitle", descKey: "smartPracticeDescription" },
            { href: "/browse/3/flash", icon: Layers, titleKey: "flashcardsTitle", descKey: "flashcardsDescription" },
            { href: "/study", icon: BookOpen, titleKey: "studyLibraryTitle", descKey: "studyLibraryDescription" },
          ] as const).map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Icon className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-amber-500 dark:text-slate-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{t(feature.titleKey)}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t(feature.descKey)}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 -translate-x-2 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600" aria-hidden />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Process section */}
      <section className="mt-16 md:mt-20 -mx-4 md:mx-0 md:rounded-xl overflow-hidden bg-slate-900 dark:bg-slate-800/50">
        <div className="p-6 md:p-10 lg:p-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t("processHeading")}</h2>
          <p className="mt-2 text-slate-400 max-w-xl">{t("sectionSubtitle")}</p>

          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              const last = i === processSteps.length - 1;
              return (
                <div key={step.title} className="relative">
                  {!last && (
                    <div
                      className="absolute left-14 top-6 hidden h-px w-full bg-gradient-to-r from-amber-500/40 to-amber-500/0 md:block"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center gap-4 md:block">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-amber-400 ring-1 ring-amber-500/30">
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white md:mt-5">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
              {t("tipText")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/ser-radioamador">{t("learnMore")}</Link>
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200 bg-transparent hover:bg-slate-700 hover:text-white" asChild>
                <a href="https://www.anacom.pt" target="_blank" rel="noreferrer">
                  {t("externalLinks.anacom")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200 bg-transparent hover:bg-slate-700 hover:text-white" asChild>
                <a href="https://radioamador.info/associations" target="_blank" rel="noreferrer">
                  {t("externalLinks.clubs")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="mt-8 md:mt-10">
        <Link
          href="/donativos"
          className="flex items-center gap-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700/40 dark:hover:bg-slate-800/70 transition-all duration-200 group"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">
            {t("donatePrompt")}
          </p>
          <span className="shrink-0 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
            {t("donateButton")}
          </span>
        </Link>
      </section>
    </div>
  );
}
