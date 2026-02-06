import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  BookOpen,
  Clock,
  Radio,
  Award,
  FileText,
  CheckCircle,
  RefreshCw,
  User,
  Zap,
  GraduationCap,
  Signal,
} from "lucide-react";
import CategoryPowerInfo from "@/components/CategoryPowerInfo";

export default async function BecomeHamPage() {
  const t = await getTranslations("BecomeHam");

  const categories = [
    {
      id: "3",
      color: "green",
      headerBg: "bg-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800/60",
      accent: "text-green-600 dark:text-green-400",
      badgeBg: "bg-green-100 dark:bg-green-900/50",
      dotBg: "bg-green-400",
      btnBg: "bg-green-600 hover:bg-green-500",
    },
    {
      id: "2",
      color: "amber",
      headerBg: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/60",
      accent: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
      dotBg: "bg-amber-400",
      btnBg: "bg-amber-600 hover:bg-amber-500",
    },
    {
      id: "1",
      color: "rose",
      headerBg: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-800/60",
      accent: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-100 dark:bg-rose-900/50",
      dotBg: "bg-rose-400",
      btnBg: "bg-rose-600 hover:bg-rose-500",
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
      <section className="mb-14">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <Radio className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {t("title")}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t("intro")}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {t("categoriesTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("categoriesIntro")}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`relative rounded-xl border ${cat.border} overflow-hidden`}
            >
              {/* Header */}
              <div className={`px-5 pt-4 pb-3 ${cat.bg}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold ${cat.accent}`}>
                    {t(`category${cat.id}.name`)}
                  </h3>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${cat.badgeBg} text-sm font-bold ${cat.accent}`}>
                    {cat.id}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4 bg-white dark:bg-slate-800/50">
                <ul className="space-y-2.5">
                  {categoryIcons.map(({ key, icon: Icon }) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${cat.accent} opacity-70`} />
                      {key === "power" && cat.id === "3" ? (
                        <CategoryPowerInfo
                          text={t(`category${cat.id}.${key}`)}
                          footnote={t("category3PowerFootnote")}
                          showFootnote={true}
                          accentColor={cat.accent}
                          badgeBg={cat.badgeBg}
                        />
                      ) : (
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {t(`category${cat.id}.${key}`)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/exam/${cat.id}`}
                  className={`mt-5 flex items-center justify-center gap-2 rounded-lg ${cat.btnBg} px-4 py-2 text-sm font-medium text-white transition-colors`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("studyCategory")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wait Times - Progression Diagram */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {t("waitTimesTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("waitTimesNote")}
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            {/* Category 3 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 ring-2 ring-green-200 dark:ring-green-800/40">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">3</div>
                  <div className="text-[10px] font-medium text-green-500 dark:text-green-500">{t("progression.entry")}</div>
                </div>
              </div>
              <span className="mt-1.5 text-xs font-medium text-slate-400">12+</span>
            </div>

            {/* Arrow: 2 years */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:mx-3">
              <div className="hidden sm:block h-px w-6 bg-slate-300 dark:bg-slate-600" />
              <div className="sm:hidden w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.twoYears")}</span>
              </div>
              <div className="hidden sm:block h-px w-6 bg-slate-300 dark:bg-slate-600" />
              <div className="sm:hidden w-px h-6 bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Category 2 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-200 dark:ring-amber-800/40">
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">2</div>
                  <div className="text-[10px] font-medium text-amber-500 dark:text-amber-500">{t("progression.intermediate")}</div>
                </div>
              </div>
              <span className="mt-1.5 text-xs font-medium text-slate-400">14+</span>
            </div>

            {/* Arrow: 1 year */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:mx-3">
              <div className="hidden sm:block h-px w-6 bg-slate-300 dark:bg-slate-600" />
              <div className="sm:hidden w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.oneYear")}</span>
              </div>
              <div className="hidden sm:block h-px w-6 bg-slate-300 dark:bg-slate-600" />
              <div className="sm:hidden w-px h-6 bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Category 1 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 ring-2 ring-rose-200 dark:ring-rose-800/40">
                <div className="text-center">
                  <div className="text-xl font-bold text-rose-600 dark:text-rose-400">1</div>
                  <div className="text-[10px] font-medium text-rose-500 dark:text-rose-500">{t("progression.advanced")}</div>
                </div>
              </div>
              <span className="mt-1.5 text-xs font-medium text-slate-400">16+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Process */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          {t("examProcessTitle")}
        </h2>

        <div className="space-y-3">
          {examProcessSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex gap-4">
                {/* Step number */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < examProcessSteps.length - 1 && (
                    <div className="w-px flex-1 bg-amber-200 dark:bg-amber-800/50 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2.5 mb-1">
                    <Icon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {t(`examProcess.${step.key}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 ml-[26px] leading-relaxed">
                    {t(`examProcess.${step.key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* License Maintenance */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <RefreshCw className="h-4.5 w-4.5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("maintenanceTitle")}
            </h2>
          </div>
          <ul className="space-y-2.5">
            {maintenanceSteps.map((step) => (
              <li key={step} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500 dark:text-green-400" />
                {t(`maintenance.${step}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
