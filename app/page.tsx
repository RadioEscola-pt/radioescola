import React from "react";
import Link from "next/link";
import { BookOpen, ClipboardCheck, IdCard, Radio, ExternalLink, Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");

  const categoryIds = ["3", "2", "1"] as const;
  const categoryImages: Record<(typeof categoryIds)[number], string> = {
    "3": "/images/cat3/cover.webp",
    "2": "/images/cat2/cover.webp",
    "1": "/images/cat1/cover.jpg",
  };

  const styles: Record<
    string,
    {
      badgeBg: string;
      badgeText: string;
      solidBtn: string;
      outlineBtn: string;
    }
  > = {
    "3": {
      badgeBg: "bg-green-100",
      badgeText: "text-green-700",
      solidBtn: "bg-green-600 text-white hover:bg-green-700",
      outlineBtn: "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400",
    },
    "2": {
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-700",
      solidBtn: "bg-amber-600 text-white hover:bg-amber-700",
      outlineBtn: "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400",
    },
    "1": {
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-700",
      solidBtn: "bg-rose-600 text-white hover:bg-rose-700",
      outlineBtn: "border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-400",
    },
  };

  const processSteps = [
    {
      icon: BookOpen,
      title: t("processSteps.study.title"),
      description: t("processSteps.study.description"),
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      icon: ClipboardCheck,
      title: t("processSteps.exam.title"),
      description: t("processSteps.exam.description"),
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: IdCard,
      title: t("processSteps.license.title"),
      description: t("processSteps.license.description"),
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      icon: Radio,
      title: t("processSteps.operate.title"),
      description: t("processSteps.operate.description"),
      iconClass: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <main className="p-8">
      <section className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border mb-8">
        <div className="px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{t("heroTitle")}</h1>
          <p className="mt-3 text-gray-700 max-w-2xl">{t("heroSubtitle")}</p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/exam/3" className={`px-4 py-2 rounded ${styles["3"].solidBtn}`}>{t("ctaExam")}</Link>
            <Link href="/browse/3" className={`px-4 py-2 rounded border ${styles["3"].outlineBtn}`}>{t("ctaBrowse")}</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("categoriesHeading")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryIds.map((id) => {
            const s = styles[id] ?? styles["3"];
            const name = t("categoryName", { id });
            const badge = t("categoryBadge", { id });
            const browseLabel = t("categoryBrowse");
            const simulationLabel = t("categorySimulation");
            const image = categoryImages[id];

            return (
              <div
                key={id}
                className="group overflow-hidden rounded-xl border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
                {image && (
                  <div className="h-40 w-full overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`${name} illustration`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
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

      <section className="mt-10 rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-indigo-600" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900">{t("processHeading")}</h2>
          </div>
          <p className="mt-2 text-gray-700">{t("sectionSubtitle")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {processSteps.map((step) => (
              <div key={step.title} className="flex items-start gap-3 rounded-xl border bg-white/70 p-4 backdrop-blur">
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${step.iconClass}`}
                >
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 text-sm text-gray-700">
            <Building2 className="h-4 w-4 text-indigo-600 mt-0.5" aria-hidden />
            <p>{t("tipText")}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.anacom.pt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/80 border border-indigo-200 text-indigo-700 hover:bg-white"
            >
              {t("externalLinks.anacom")}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="https://www.rep.pt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/80 border border-indigo-200 text-indigo-700 hover:bg-white"
            >
              {t("externalLinks.rep")}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
