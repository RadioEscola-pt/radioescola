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
      accent: "text-green-600 dark:text-green-400",
      dot: "bg-green-400",
      badgeBg: "bg-green-100 dark:bg-green-900/50",
      numberColor: "text-green-100 dark:text-green-900/40",
      btnBg: "bg-green-600 hover:bg-green-500",
      btnRing: "focus-visible:ring-green-300",
    },
    {
      id: "2",
      accent: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-400",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
      numberColor: "text-amber-100 dark:text-amber-900/40",
      btnBg: "bg-amber-600 hover:bg-amber-500",
      btnRing: "focus-visible:ring-amber-300",
    },
    {
      id: "1",
      accent: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-400",
      badgeBg: "bg-rose-100 dark:bg-rose-900/50",
      numberColor: "text-rose-100 dark:text-rose-900/40",
      btnBg: "bg-rose-600 hover:bg-rose-500",
      btnRing: "focus-visible:ring-rose-300",
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
              className="group relative rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Oversized number watermark */}
              <span
                className={`absolute -right-3 -top-4 text-[120px] font-black leading-none select-none pointer-events-none ${cat.numberColor}`}
                aria-hidden="true"
              >
                {cat.id}
              </span>

              <div className="relative px-5 pt-5 pb-5">
                {/* Category name with dot */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t(`category${cat.id}.name`)}
                  </h3>
                </div>

                {/* Details */}
                <ul className="space-y-2">
                  {categoryIcons.map(({ key, icon: Icon }) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${cat.accent}`} />
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
                  className={`mt-5 flex items-center justify-center gap-2 rounded-lg ${cat.btnBg} ${cat.btnRing} px-4 py-2.5 text-sm font-medium text-white transition-colors`}
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

        {/* Desktop: horizontal track */}
        <div className="hidden sm:block">
          <div className="relative flex items-start">
            {/* Continuous track line behind everything */}
            <div className="absolute top-5 left-[40px] right-[40px] h-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Cat 3 */}
            <div className="relative flex-1 flex flex-col items-center">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold text-base shadow-sm">
                3
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.entry")}</span>
              <span className="text-xs text-slate-400">12+</span>
            </div>

            {/* Wait: 2 years - centered on the track line (top-5 = 20px center) */}
            <div className="relative flex-1 flex flex-col items-center" style={{ paddingTop: 'calc(1.25rem - 13px)' }}>
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 shadow-sm">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.twoYears")}</span>
              </div>
            </div>

            {/* Cat 2 */}
            <div className="relative flex-1 flex flex-col items-center">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-base shadow-sm">
                2
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.intermediate")}</span>
              <span className="text-xs text-slate-400">14+</span>
            </div>

            {/* Wait: 1 year - centered on the track line */}
            <div className="relative flex-1 flex flex-col items-center" style={{ paddingTop: 'calc(1.25rem - 13px)' }}>
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 shadow-sm">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.oneYear")}</span>
              </div>
            </div>

            {/* Cat 1 */}
            <div className="relative flex-1 flex flex-col items-center">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-base shadow-sm">
                1
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.advanced")}</span>
              <span className="text-xs text-slate-400">16+</span>
            </div>
          </div>
        </div>

        {/* Mobile: vertical track */}
        <div className="sm:hidden">
          <div className="relative ml-5">
            {/* Vertical track line */}
            <div className="absolute top-5 bottom-5 left-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Cat 3 */}
            <div className="relative flex items-center gap-4 pb-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold text-base shadow-sm -ml-5">
                3
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.entry")}</span>
                <span className="ml-2 text-xs text-slate-400">12+</span>
              </div>
            </div>

            {/* Wait: 2 years */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 shadow-sm -ml-[13px]">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("progression.twoYears")}</span>
              </div>
            </div>

            {/* Cat 2 */}
            <div className="relative flex items-center gap-4 pb-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-base shadow-sm -ml-5">
                2
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.intermediate")}</span>
                <span className="ml-2 text-xs text-slate-400">14+</span>
              </div>
            </div>

            {/* Wait: 1 year */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 shadow-sm -ml-[13px]">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("progression.oneYear")}</span>
              </div>
            </div>

            {/* Cat 1 */}
            <div className="relative flex items-center gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-base shadow-sm -ml-5">
                1
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.advanced")}</span>
                <span className="ml-2 text-xs text-slate-400">16+</span>
              </div>
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
