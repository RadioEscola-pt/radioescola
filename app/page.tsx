import React from "react";
import Link from "next/link";
import { BookOpen, IdCard, Radio, ExternalLink, Building2, ArrowRight, Zap, Brain, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_STYLES, CATEGORY_IMAGES } from "@/lib/config";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const defaultStyle = CATEGORY_STYLES["3"];

  const processSteps = [
    {
      icon: BookOpen,
      title: t("processSteps.study.title"),
      description: t("processSteps.study.description"),
      iconClass: "bg-indigo-500/20 text-indigo-400",
    },
    {
      icon: IdCard,
      title: t("processSteps.examAndLicense.title"),
      description: t("processSteps.examAndLicense.description"),
      iconClass: "bg-emerald-500/20 text-emerald-400",
    },
    {
      icon: Radio,
      title: t("processSteps.operate.title"),
      description: t("processSteps.operate.description"),
      iconClass: "bg-amber-500/20 text-amber-400",
    },
  ];

  return (
    <div className="py-8">
      <section className="relative overflow-hidden mb-8 -mx-4 md:mx-0 md:rounded-xl">
        <div
          className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105"
          style={{ backgroundImage: "url('https://www.radioescola.pt/images/header2.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(180, 83, 9, 0.9), rgba(247, 149, 22, 0.8))" }}
        />
        <div className="relative px-6 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">{t("heroTitle")}</h1>
          <p className="mt-3 text-white/90 max-w-2xl drop-shadow-sm">{t("heroSubtitle")}</p>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <Button asChild>
              <Link href="/exam/3">{t("ctaExam")}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/browse/3">{t("ctaBrowse")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("categoriesHeading")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((id) => {
            const s = CATEGORY_STYLES[id];
            const name = t("categoryName", { id });
            const browseLabel = t("categoryBrowse");
            const simulationLabel = t("categorySimulation");
            const image = CATEGORY_IMAGES[id];

            return (
              <div
                key={id}
                className="group relative overflow-hidden rounded-2xl h-64 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={image}
                  alt={`${name} illustration`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="relative h-full flex flex-col justify-between p-5">
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider ${s.badgeText} ${s.badgeBg} rounded px-2 py-1`}>
                      {id === '3' ? t("categoryLevel.beginner") : id === '2' ? t("categoryLevel.intermediate") : t("categoryLevel.advanced")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">{name}</h3>
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

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">{t("featuresHeading")}</h2>

        <Link
          href="/drill"
          className="flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200/60 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:border-amber-800/40 dark:hover:bg-amber-950/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group mb-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white animate-gentle-pulse">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{t("drillTitle")}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("drillDescription")}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" aria-hidden />
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
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

      <section className="mt-10 -mx-4 md:mx-0 md:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
        <div className="p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t("processHeading")}</h2>
            <p className="mt-2 text-slate-300 max-w-2xl mx-auto">{t("sectionSubtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="mb-4 relative">
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${step.iconClass}`}>
                      <step.icon className="h-7 w-7" aria-hidden />
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
              {t("tipText")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/ser-radioamador">{t("learnMore")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://www.anacom.pt" target="_blank" rel="noreferrer">
                  {t("externalLinks.anacom")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://radioamador.info/associations" target="_blank" rel="noreferrer">
                  {t("externalLinks.clubs")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
