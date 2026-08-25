import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Radio, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BAND_PLAN,
  CATEGORIES,
  CATEGORY_CONFIG,
  formatSegment,
  type CategoryId,
} from "@/lib/config";

/**
 * Lei n.º 22/2026 removed every age floor and every permanence period, so this
 * page is no longer a timed ladder. What still separates the categories is the
 * bands and the power, which is why the band plan carries the weight here.
 */
export default async function BecomeHamPage() {
  const t = await getTranslations("BecomeHam");
  const locale = await getLocale();

  const cardKeys = ["bands", "power", "exam"] as const;

  const examProcessSteps = ["registration", "preparation", "exam", "licence"] as const;

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="mb-10">
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

      {/* What changed — remove once the 2026 change stops being news */}
      <section className="mb-14">
        <div className="rounded-xl border border-amber-400 dark:border-amber-500/60 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            {t("changed.eyebrow")}
          </p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
            {t("changed.title")}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
            {(["age", "wait", "licence"] as const).map((key) => (
              <li key={key}>{t(`changed.${key}`)}</li>
            ))}
          </ul>
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
          {CATEGORIES.map((id) => {
            const cfg = CATEGORY_CONFIG[id];
            return (
              <div
                key={id}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg transition-all"
              >
                <span
                  className={`absolute -right-3 -top-4 text-[120px] font-black leading-none select-none pointer-events-none opacity-10 ${cfg.badgeText}`}
                  aria-hidden="true"
                >
                  {id}
                </span>

                <div className="relative px-5 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {t(`category${id}.name`)}
                    </h3>
                  </div>
                  <p className="mt-1 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    {t(`category${id}.role`)}
                  </p>

                  <dl className="space-y-2.5 text-sm">
                    {cardKeys.map((key) => (
                      <div key={key}>
                        <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {t(`cardLabels.${key}`)}
                        </dt>
                        <dd className="text-slate-600 dark:text-slate-300">
                          {t(`category${id}.${key}`)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Button asChild variant="outline" className={`mt-5 w-full ${cfg.outlineBtn}`}>
                    <Link href={`/browse/${id}`}>
                      <BookOpen className="h-3.5 w-3.5" />
                      {t("studyCategory")}
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bands and power */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {t("bandsTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("bandsIntro")}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[520px] text-sm tabular-nums border-collapse">
            <caption className="sr-only">{t("bandsCaption")}</caption>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                <th scope="col" className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {t("bandsTable.band")}
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {t("bandsTable.segment")}
                </th>
                {CATEGORIES.map((id) => (
                  <th
                    key={id}
                    scope="col"
                    className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[70px]"
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${CATEGORY_CONFIG[id].dot}`} />
                    {t("bandsTable.cat", { id })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BAND_PLAN.map((row) => (
                <tr
                  key={`${row.from}-${row.to}-${row.unit}`}
                  className={`border-t ${row.band ? "border-slate-200 dark:border-slate-700" : "border-slate-100 dark:border-slate-800"}`}
                >
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.band}
                  </th>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatSegment(row, locale)}
                  </td>
                  {CATEGORIES.map((id) => {
                    const watts = row.power[id];
                    return (
                      <td
                        key={id}
                        className={`px-3 py-2 text-right ${watts === null ? "text-slate-300 dark:text-slate-600" : "text-slate-900 dark:text-slate-100"}`}
                      >
                        {watts === null ? "—" : watts}
                        <span className="sr-only">
                          {watts === null ? t("bandsTable.noAccess") : " W"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          {t("bandsNote")}
        </p>
      </section>

      {/* Progression — the order survives, the waiting does not */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {t("progressionTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("progressionIntro")}
        </p>

        <ol className="flex flex-col sm:flex-row sm:items-start relative">
          {CATEGORIES.map((id, index) => (
            <li key={id} className="contents">
              <div className="flex sm:flex-1 sm:flex-col items-center gap-3 sm:gap-0 sm:text-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold shadow-sm ${CATEGORY_CONFIG[id].accent}`}>
                  {id}
                </div>
                <div className="sm:mt-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t(`progression.${id}.name`)}
                  </span>
                  <span className="ml-2 sm:ml-0 sm:block text-xs text-slate-400 dark:text-slate-500">
                    {t(`progression.${id}.requires`)}
                  </span>
                </div>
              </div>

              {index < CATEGORIES.length - 1 && (
                <div className="flex sm:flex-1 items-center gap-3 sm:flex-col sm:pt-2.5 py-2 sm:py-0 pl-[18px] sm:pl-0">
                  <span className="h-6 w-px sm:h-px sm:w-full bg-slate-200 dark:bg-slate-700 sm:hidden" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                    <FileText className="h-3 w-3 text-slate-400" />
                    {t("progression.exam")}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-r-lg border-l-[3px] border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          {t("progressionNoGate")}
        </p>
      </section>

      {/* Age: no longer gates access, only operation */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {t("ageTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("ageIntro")}
        </p>

        <div className="grid sm:grid-cols-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          {(["certificate", "operate"] as const).map((key, index) => (
            <div
              key={key}
              className={index === 1 ? "px-5 py-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700" : "px-5 py-4"}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                {t(`age.${key}.label`)}
              </p>
              <p className="mt-1.5 font-semibold text-slate-900 dark:text-slate-100">
                {t(`age.${key}.headline`)}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(`age.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Exam process */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          {t("examProcessTitle")}
        </h2>

        <ol className="space-y-0">
          {examProcessSteps.map((key, index) => (
            <li key={key} className="flex gap-4">
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
                  {t(`examProcess.${key}.title`)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`examProcess.${key}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-2 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400 mt-px" />
          {t("examProcessNote")}
        </p>
      </section>
    </div>
  );
}
