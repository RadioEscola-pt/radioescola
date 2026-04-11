import { getTranslations } from "next-intl/server";
import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/config";
import type { CategoryId } from "@/lib/config/categories";

/** ANACOM metadata per category — these are external facts that change rarely */
const ANACOM_METADATA: Record<string, { verified: number; anacomProvided: number }> = {
  "3": { verified: 69, anacomProvided: 90 },
  "2": { verified: 317, anacomProvided: 189 },
  "1": { verified: 197, anacomProvided: 208 },
};

function getQuestionCount(catId: string): number {
  try {
    const filePath = join(process.cwd(), "public", "data", `cat${catId}.json`);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    return data.questions?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function EstadoEscolaPage() {
  const t = await getTranslations("EstadoEscola");

  const rows = CATEGORIES.map((catId) => {
    const total = getQuestionCount(catId);
    const meta = ANACOM_METADATA[catId] ?? { verified: 0, anacomProvided: 0 };
    const anacomTotal = meta.anacomProvided * 2;
    const cfg = CATEGORY_CONFIG[catId as CategoryId];
    const Icon = cfg?.icon;
    const pct = anacomTotal > 0 ? Math.round((total / anacomTotal) * 100) : 0;

    return { catId, total, ...meta, anacomTotal, Icon, cfg, pct };
  });

  const totalsRow = {
    total: rows.reduce((s, r) => s + r.total, 0),
    verified: rows.reduce((s, r) => s + r.verified, 0),
    anacomProvided: rows.reduce((s, r) => s + r.anacomProvided, 0),
    anacomTotal: rows.reduce((s, r) => s + r.anacomTotal, 0),
  };

  return (
    <section className="py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8">
        {t("subtitle")}
      </p>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 pr-2 font-medium" />
              <th className="py-3 px-2 font-medium text-right">
                {t("total")}
              </th>
              <th className="py-3 px-2 font-medium text-right">
                <span className="hidden sm:inline">{t("verified")}</span>
                <abbr className="sm:hidden no-underline" title={t("verified")}>Verif.</abbr>
              </th>
              <th className="py-3 px-2 font-medium text-right">
                <span className="hidden sm:inline">{t("anacomProvided")}</span>
                <abbr className="sm:hidden no-underline" title={t("anacomProvided")}>{t("anacomProvidedShort")}</abbr>
              </th>
              <th className="py-3 pl-2 font-medium text-right">
                <span className="hidden sm:inline">{t("anacomTotal")}</span>
                <abbr className="sm:hidden no-underline" title={t("anacomTotal")}>{t("anacomTotalShort")}</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ catId, total, verified, anacomProvided, anacomTotal, Icon, cfg }) => (
              <tr
                key={catId}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-3 pr-2">
                  <Link
                    href={`/browse/${catId}`}
                    className={`inline-flex items-center gap-1.5 font-medium hover:underline ${cfg?.badgeText ?? ''}`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="hidden sm:inline">{t("category")}</span> {catId}
                  </Link>
                </td>
                <td className="py-3 px-2 text-right text-base font-bold text-slate-900 dark:text-slate-100">
                  {total}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">
                  {verified}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">
                  {anacomProvided}
                </td>
                <td className="py-3 pl-2 text-right text-slate-400 dark:text-slate-500">
                  {anacomTotal}
                </td>
              </tr>
            ))}

            {/* Totals row */}
            <tr className="border-t-2 border-slate-300 dark:border-slate-600">
              <td className="py-3 pr-2 font-bold text-slate-900 dark:text-slate-100">
                Total
              </td>
              <td className="py-3 px-2 text-right text-base font-bold text-slate-900 dark:text-slate-100">
                {totalsRow.total}
              </td>
              <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-slate-300">
                {totalsRow.verified}
              </td>
              <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-slate-300">
                {totalsRow.anacomProvided}
              </td>
              <td className="py-3 pl-2 text-right font-medium text-slate-400 dark:text-slate-500">
                {totalsRow.anacomTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Coverage bars */}
      <div className="mt-8 space-y-3">
        {rows.map(({ catId, total, anacomTotal, cfg, pct }) => {
          const barColor = cfg?.accent ?? "bg-slate-500";
          const exceeds = pct > 100;
          return (
            <div key={catId}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={cfg?.badgeText ?? "text-slate-600 dark:text-slate-300"}>
                  {t("category")} {catId}
                </span>
                <span className={exceeds ? (cfg?.badgeText ?? '') : "text-slate-500 dark:text-slate-400"}>
                  {total} / {anacomTotal}
                  <span className="ml-1.5 text-slate-400 dark:text-slate-500">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
          {t("notes")}
        </h2>
        <dl className="space-y-3 text-sm">
          {[
            { label: t("total"), note: t("noteTotal") },
            { label: t("verified"), note: t("noteVerified") },
            { label: t("anacomProvided"), note: t("noteAnacomProvided") },
            { label: t("anacomTotal"), note: t("noteAnacomTotal") },
          ].map(({ label, note }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:gap-1.5">
              <dt className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                {label}:
              </dt>
              <dd className="text-slate-500 dark:text-slate-400">{note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
