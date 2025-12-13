import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Clock, Radio, Award, FileText, CheckCircle, RefreshCw, User, Zap, GraduationCap, Signal } from "lucide-react";

export default async function BecomeHamPage() {
  const t = await getTranslations("BecomeHam");

  const categories = [
    {
      id: "3",
      gradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      accentColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      id: "2",
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      borderColor: "border-blue-200 dark:border-blue-800",
      accentColor: "text-blue-600 dark:text-blue-400",
      badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      id: "1",
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      borderColor: "border-amber-200 dark:border-amber-800",
      accentColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  ];

  const categoryIcons = [
    { key: "age", icon: User },
    { key: "experience", icon: Clock },
    { key: "privileges", icon: Zap },
    { key: "exam", icon: GraduationCap },
    { key: "power", icon: Signal },
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("categoriesTitle")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t("categoriesIntro")}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group relative rounded-2xl border ${cat.borderColor} ${cat.bgColor} overflow-hidden transition-shadow hover:shadow-lg`}
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${cat.gradient} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {t(`category${cat.id}.name`)}
                  </h3>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-2xl font-bold text-white">{cat.id}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <ul className="space-y-3">
                  {categoryIcons.map(({ key, icon: Icon }) => (
                    <li key={key} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.badgeBg}`}>
                        <Icon className={`h-4 w-4 ${cat.accentColor}`} />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {t(`category${cat.id}.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={`/exam/${cat.id}`}
                  className={`mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${cat.gradient} px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90`}
                >
                  <BookOpen className="h-4 w-4" />
                  {t("studyCategory")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Wait Times - Progression Diagram */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("waitTimesTitle")}
          </h2>
        </div>

        {/* Progression Flow */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {/* Category 3 */}
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">3</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-500">{t("progression.entry")}</div>
                </div>
              </div>
              <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">12+</span>
            </div>

            {/* Arrow with 2 years */}
            <div className="flex flex-col md:flex-row items-center gap-1 md:mx-2">
              <div className="hidden md:block h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-blue-400" />
              <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-blue-400" />
              <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("progression.twoYears")}</span>
              </div>
              <div className="hidden md:block h-0.5 w-8 bg-gradient-to-r from-blue-400 to-blue-500" />
              <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-500" />
            </div>

            {/* Category 2 */}
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">2</div>
                  <div className="text-xs text-blue-600 dark:text-blue-500">{t("progression.intermediate")}</div>
                </div>
              </div>
              <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">14+</span>
            </div>

            {/* Arrow with 1 year */}
            <div className="flex flex-col md:flex-row items-center gap-1 md:mx-2">
              <div className="hidden md:block h-0.5 w-8 bg-gradient-to-r from-blue-400 to-amber-400" />
              <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-blue-400 to-amber-400" />
              <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("progression.oneYear")}</span>
              </div>
              <div className="hidden md:block h-0.5 w-8 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-amber-400 to-amber-500" />
            </div>

            {/* Category 1 */}
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">1</div>
                  <div className="text-xs text-amber-600 dark:text-amber-500">{t("progression.advanced")}</div>
                </div>
              </div>
              <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">16+</span>
            </div>
          </div>

          {/* Note */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 italic max-w-xl mx-auto">
            {t("waitTimesNote")}
          </p>
        </div>
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
