import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  BookOpen,
  Clock,
  Radio,
  ArrowRight,
} from "lucide-react";
import CategoryPowerInfo from "@/components/CategoryPowerInfo";
import { Button } from "@/components/ui/button";

export default async function BecomeHamPage() {
  const t = await getTranslations("BecomeHam");

  const categories = [
    {
      id: "3",
      accent: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
      badgeBg: "bg-green-100 dark:bg-green-900/50",
      numberColor: "text-green-100 dark:text-green-900/40",
    },
    {
      id: "2",
      accent: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
      numberColor: "text-amber-100 dark:text-amber-900/40",
    },
    {
      id: "1",
      accent: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500",
      badgeBg: "bg-rose-100 dark:bg-rose-900/50",
      numberColor: "text-rose-100 dark:text-rose-900/40",
    },
  ];

  const detailKeys = ["age", "experience", "privileges", "exam", "power"] as const;

  const examProcessSteps = [
    { key: "registration" },
    { key: "preparation" },
    { key: "exam" },
    { key: "results" },
  ];

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="mb-14">
        <div className="flex items-start gap-4">
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

      {/* Categories */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {t("categoriesTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("categoriesIntro")}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg transition-all"
            >
              {/* Watermark number */}
              <span
                className={`absolute -right-3 -top-4 text-[120px] font-black leading-none select-none pointer-events-none ${cat.numberColor}`}
                aria-hidden="true"
              >
                {cat.id}
              </span>

              <div className="relative px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t(`category${cat.id}.name`)}
                  </h3>
                </div>

                <dl className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {detailKeys.map((key) => (
                    <div key={key}>
                      {key === "power" && cat.id === "3" ? (
                        <CategoryPowerInfo
                          text={t(`category${cat.id}.${key}`)}
                          footnote={t("category3PowerFootnote")}
                          showFootnote={true}
                          accentColor={cat.accent}
                          badgeBg={cat.badgeBg}
                        />
                      ) : (
                        <dd>{t(`category${cat.id}.${key}`)}</dd>
                      )}
                    </div>
                  ))}
                </dl>

                <Button asChild className="mt-5 w-full">
                  <Link href={`/browse/${cat.id}`}>
                    <BookOpen className="h-3.5 w-3.5" />
                    {t("studyCategory")}
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Progression */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {t("waitTimesTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("waitTimesNote")}
        </p>

        {/* Desktop: horizontal track */}
        <div className="hidden sm:block">
          <div className="relative flex items-start">
            <div className="absolute top-5 left-[40px] right-[40px] h-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="relative flex-1 flex flex-col items-center">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold text-base shadow-sm">
                3
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.entry")}</span>
              <span className="text-xs text-slate-400">12+</span>
            </div>

            <div className="relative flex-1 flex flex-col items-center pt-[7px]">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 shadow-sm">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.twoYears")}</span>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col items-center">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-base shadow-sm">
                2
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.intermediate")}</span>
              <span className="text-xs text-slate-400">14+</span>
            </div>

            <div className="relative flex-1 flex flex-col items-center pt-[7px]">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 shadow-sm">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("progression.oneYear")}</span>
              </div>
            </div>

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
            <div className="absolute top-5 bottom-5 left-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="relative flex items-center gap-4 pb-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold text-base shadow-sm -ml-5">
                3
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.entry")}</span>
                <span className="ml-2 text-xs text-slate-400">12+</span>
              </div>
            </div>

            <div className="relative flex items-center gap-4 py-2">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 shadow-sm -ml-[13px]">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("progression.twoYears")}</span>
              </div>
            </div>

            <div className="relative flex items-center gap-4 pb-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-base shadow-sm -ml-5">
                2
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("progression.intermediate")}</span>
                <span className="ml-2 text-xs text-slate-400">14+</span>
              </div>
            </div>

            <div className="relative flex items-center gap-4 py-2">
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 shadow-sm -ml-[13px]">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("progression.oneYear")}</span>
              </div>
            </div>

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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          {t("examProcessTitle")}
        </h2>

        <div className="space-y-3">
          {examProcessSteps.map((step, index) => (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                  {index + 1}
                </div>
                {index < examProcessSteps.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                  {t(`examProcess.${step.key}.title`)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`examProcess.${step.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
