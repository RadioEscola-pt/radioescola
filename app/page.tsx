import React from "react";
import Link from "next/link";
import { BookOpen, IdCard, Radio, ExternalLink, Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_STYLES, CATEGORY_IMAGES } from "@/lib/config";

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
            <Link href="/exam/3" className="px-4 py-2 rounded bg-white text-amber-700 font-medium hover:bg-amber-50 transition-colors shadow-md text-center">{t("ctaExam")}</Link>
            <Link href="/browse/3" className="px-4 py-2 rounded border-2 border-white text-white font-medium hover:bg-white/10 transition-colors text-center">{t("ctaBrowse")}</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("categoriesHeading")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((id) => {
            const s = CATEGORY_STYLES[id];
            const name = t("categoryName", { id });
            const badge = t("categoryBadge", { id });
            const browseLabel = t("categoryBrowse");
            const simulationLabel = t("categorySimulation");
            const image = CATEGORY_IMAGES[id];

            return (
              <div
                key={id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={image}
                    alt={`${name} illustration`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name}</h3>
                    <span className={`text-xs font-medium ${s.badgeBg} ${s.badgeText} rounded-full px-3 py-1`}>
                      {badge}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      href={`/browse/${id}`}
                      className={`flex-1 rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors ${s.outlineBtn}`}
                    >
                      {browseLabel}
                    </Link>
                    <Link
                      href={`/exam/${id}`}
                      className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${s.solidBtn}`}
                    >
                      {simulationLabel}
                    </Link>
                  </div>
                </div>
              </div>
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

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-500" aria-hidden />
                {t("tipText")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.anacom.pt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors"
                >
                  {t("externalLinks.anacom")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="https://www.rep.pt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  {t("externalLinks.rep")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <Link
                  href="/ser-radioamador"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  {t("learnMore")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
