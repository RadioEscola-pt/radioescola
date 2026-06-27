import React from "react";
import Link from "next/link";
import { BookOpen, IdCard, Radio, ExternalLink, Building2, ArrowRight, Zap, Brain, Layers, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_CONFIG, CATEGORY_IMAGES } from "@/lib/config";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const t = await getTranslations("Home");

  const processSteps = [
    {
      icon: BookOpen,
      title: t("processSteps.study.title"),
      description: t("processSteps.study.description"),
      number: "01",
    },
    {
      icon: IdCard,
      title: t("processSteps.examAndLicense.title"),
      description: t("processSteps.examAndLicense.description"),
      number: "02",
    },
    {
      icon: Radio,
      title: t("processSteps.operate.title"),
      description: t("processSteps.operate.description"),
      number: "03",
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
                    <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">{name}</h3>
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
      <section className="mt-16 md:mt-20">
        <h2 className="text-lg font-medium text-muted-foreground mb-6">{t("testimonialsHeading")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            {
              quote: "Usei o Rádio Escola desde a Categoria 3 até à 1. Os simuladores de exame são iguais ao exame real da ANACOM.",
              name: "Carlos",
              callsign: "CT7XRQ",
              detail: "Categoria 1",
            },
            {
              quote: "A prática inteligente foca nas perguntas que erro mais. Em duas semanas senti-me preparado.",
              name: "Ana",
              callsign: "CS7BVF",
              detail: "Categoria 2",
            },
            {
              quote: "Estudei tudo no telemóvel, no comboio para o trabalho. Muito prático.",
              name: "Miguel",
              callsign: "CR7KJD",
              detail: "Categoria 3",
            },
          ]).map((testimonial) => (
            <blockquote key={testimonial.name} className="flex flex-col rounded-xl bg-slate-50 dark:bg-slate-800/60 px-5 py-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{testimonial.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{testimonial.callsign} &middot; {testimonial.detail}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Study modes */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t("featuresHeading")}</h2>

        <Link
          href="/drill"
          className="flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200/60 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:border-amber-800/40 dark:hover:bg-amber-950/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group mb-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white animate-gentle-pulse">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{t("drillTitle")}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("drillDescription")}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-200" aria-hidden />
        </Link>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex items-start gap-3 px-5 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors duration-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{t(feature.titleKey)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(feature.descKey)}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-slate-300 dark:text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
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

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {processSteps.map((step) => (
              <div key={step.title}>
                <span className="text-4xl font-black text-amber-500/25">{step.number}</span>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
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
