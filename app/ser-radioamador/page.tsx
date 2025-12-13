import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Clock, Radio, Award, FileText, CheckCircle, CreditCard, RefreshCw } from "lucide-react";

export default async function BecomeHamPage() {
  const t = await getTranslations("BecomeHam");

  const categories = [
    {
      id: "3",
      emoji: "🌟",
      color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    },
    {
      id: "2",
      emoji: "🚀",
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      id: "1",
      emoji: "🏆",
      color: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
  ];

  const examProcessSteps = [
    { icon: FileText, key: "registration" },
    { icon: BookOpen, key: "preparation" },
    { icon: CheckCircle, key: "exam" },
    { icon: Award, key: "results" },
  ];

  const maintenanceSteps = ["annualRenewal", "annualFees", "compliance"];

  return (
    <main className="py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          {t("intro")}
        </p>
      </section>

      {/* Categories Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {t("categoriesTitle")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t("categoriesIntro")}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-xl border p-6 ${cat.color}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.emoji}</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t(`category${cat.id}.name`)}
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>🎂</span>
                  <span className="text-slate-700 dark:text-slate-300">{t(`category${cat.id}.age`)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⏳</span>
                  <span className="text-slate-700 dark:text-slate-300">{t(`category${cat.id}.experience`)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🎛️</span>
                  <span className="text-slate-700 dark:text-slate-300">{t(`category${cat.id}.privileges`)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📚</span>
                  <span className="text-slate-700 dark:text-slate-300">{t(`category${cat.id}.exam`)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📡</span>
                  <span className="text-slate-700 dark:text-slate-300">{t(`category${cat.id}.power`)}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Licensing Process Intro */}
      <section className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("licensingTitle")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t("licensingIntro")}
        </p>
      </section>

      {/* Category Details */}
      <section className="mb-12 space-y-8">
        {["3", "2", "1"].map((catId) => (
          <div key={catId} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t(`categoryDetail${catId}.title`)}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t("requirements")}</h4>
                <p className="text-slate-600 dark:text-slate-400">{t(`categoryDetail${catId}.requirements`)}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t("examLabel")}</h4>
                <p className="text-slate-600 dark:text-slate-400">{t(`categoryDetail${catId}.examContent`)}</p>
              </div>

              {catId === "3" && (
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t("examContentLabel")}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{t("categoryDetail3.examFormat")}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{t("approval")}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Wait Times */}
      <section className="mb-12 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("waitTimesTitle")}
          </h2>
        </div>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300 mb-4">
          <li>• {t("waitTime32")}</li>
          <li>• {t("waitTime21")}</li>
        </ul>
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          {t("waitTimesNote")}
        </p>
      </section>

      {/* Exam Process */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          {t("examProcessTitle")}
        </h2>
        <div className="relative">
          {examProcessSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === examProcessSteps.length - 1;
            return (
              <div key={step.key} className="relative flex gap-6 pb-8 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-14 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400 to-amber-200 dark:from-amber-600 dark:to-amber-800" />
                )}

                {/* Step number circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                      <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {t(`examProcess.${step.key}.title`)}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 ml-13">
                    {t(`examProcess.${step.key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* License Maintenance */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("maintenanceTitle")}
          </h2>
        </div>
        <ul className="space-y-2">
          {maintenanceSteps.map((step) => (
            <li key={step} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {t(`maintenance.${step}`)}
            </li>
          ))}
        </ul>
      </section>

      {/* Footnote */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          * {t("footnote")}
        </p>
      </section>
    </main>
  );
}
