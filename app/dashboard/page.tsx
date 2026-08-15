"use client";

import { useTranslations, useFormatter, useNow } from "next-intl";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { PageLoading } from "@/components/shared/Loading";
import { CATEGORIES, CATEGORY_CONFIG, GAMIFICATION_ENABLED } from "@/lib/config";
import type { CategoryId } from "@/lib/config/categories";
import { EXAM_CONFIG } from "@/lib/config/exam";
import { loadData } from "@/lib/data";
import type { Data, Question } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Settings,
  Bookmark,
  ChevronDown,
  BookOpen,
  ListChecks,
  GraduationCap,
  Upload,
  ArrowRight,
  Brain,
  RotateCcw,
} from "lucide-react";
import type { ExamAttempt } from "@/lib/types/progress";
import {
  XPBar,
  DailyGoalsCard,
  AchievementsGrid,
  AchievementToastContainer,
} from "@/components/gamification";
import { StreakCalendar } from "@/components/gamification/StreakCalendar";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DataManagement from "@/components/settings/DataManagement";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { getBookmarkedQuestions } from "@/lib/storage/localStorage";

/** Ring + tint colors per category — extends CATEGORY_CONFIG with SVG-specific tokens */
const CATEGORY_RING_COLORS: Record<CategoryId, { stroke: string; bg: string }> = {
  '3': { stroke: 'stroke-green-500', bg: 'bg-green-50/60 dark:bg-green-950/15' },
  '2': { stroke: 'stroke-amber-500', bg: 'bg-amber-50/60 dark:bg-amber-950/15' },
  '1': { stroke: 'stroke-rose-500', bg: 'bg-rose-50/60 dark:bg-rose-950/15' },
};

/** Solid hex per category for SVG chart dots (Tailwind green/amber/rose 500) */
const CATEGORY_HEX: Record<CategoryId, string> = {
  '3': '#22c55e',
  '2': '#f59e0b',
  '1': '#f43f5e',
};

interface ChartPoint {
  name: string;
  score: number;
  passed: boolean;
  category: string;
}

/** Parses a questionStats key like "cat3_12" into its parts. */
function parseWeakKey(key: string): { category: string; questionId: number } | null {
  const m = /^cat(\d+)_(\d+)$/.exec(key);
  const cat = m?.[1];
  const id = m?.[2];
  if (!cat || !id) return null;
  return { category: cat, questionId: parseInt(id, 10) };
}

/** Rebuilds the exam-replay URL (same q/a/t format the exam page parses). */
function buildReplayHref(exam: ExamAttempt): string | null {
  if (exam.questionIds.length === 0) return null;
  const q = exam.questionIds.join('-');
  const a = exam.questionIds
    .map((id) => {
      const answer = exam.answers[id];
      return answer === undefined ? 'x' : answer.toString(36);
    })
    .join('');
  return `/exam/${exam.category}?q=${q}&a=${a}&t=0`;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tGamification = useTranslations("Gamification");
  const format = useFormatter();
  const now = useNow();
  const { progress, isLoading, getCategoryProgress, getWeakQuestions, setGamificationEnabled, dismissAchievementNotifications, gamification } =
    useProgressContext();
  const [data, setData] = useState<Data | null>(null);

  const bookmarkCount = useMemo(
    () => (progress ? getBookmarkedQuestions(progress).length : 0),
    [progress]
  );

  useEffect(() => {
    loadData().then(setData);
  }, []);

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const catId of CATEGORIES) {
      counts[catId] = data?.categories[catId]?.questions.length ?? 0;
    }
    return counts;
  }, [data]);

  const findQuestion = (category: string, questionId: number): Question | undefined =>
    data?.categories[category]?.questions.find((q) => q.id === questionId);

  const handleDismissAchievement = (id: string) => {
    dismissAchievementNotifications([id]);
  };

  const handleToggleGamification = () => {
    if (gamification) {
      setGamificationEnabled(!gamification.isEnabled);
    }
  };

  if (isLoading) {
    return <PageLoading message={t("loading")} />;
  }

  const stats = progress?.stats ?? {
    totalExams: 0,
    totalPassed: 0,
    bestScores: {},
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  };

  const examHistory = progress?.examHistory ?? [];
  const passRate =
    stats.totalExams > 0
      ? Math.round((stats.totalPassed / stats.totalExams) * 100)
      : 0;

  const latestExam = examHistory[0];
  const previousSameCategory = latestExam
    ? examHistory.slice(1).find((e) => e.category === latestExam.category)
    : undefined;
  const scoreDelta =
    latestExam && previousSameCategory
      ? latestExam.score - previousSameCategory.score
      : null;

  const chartData: ChartPoint[] = examHistory
    .slice(0, 10)
    .reverse()
    .map((exam) => ({
      name: format.dateTime(new Date(exam.timestamp), { day: "numeric", month: "short" }),
      score: exam.score,
      passed: exam.passed,
      category: exam.category,
    }));
  const chartCategories = CATEGORIES.filter((catId) =>
    chartData.some((point) => point.category === catId)
  );

  const lastStudyFormatted = (() => {
    if (!stats.lastStudyDate) return t("never");
    const parsed = new Date(stats.lastStudyDate);
    if (Number.isNaN(parsed.getTime())) return stats.lastStudyDate;
    return format.dateTime(parsed, { day: "numeric", month: "short" });
  })();

  // The provider returns every attempted question sorted by success rate; only
  // rows the user actually struggles with belong under "areas to improve".
  const weakQuestions = getWeakQuestions(2)
    .filter((weak) => weak.successRate < 0.7)
    .slice(0, 5);
  const weakCtaCategory = (() => {
    const counts = new Map<string, number>();
    for (const weak of weakQuestions) {
      const parsed = parseWeakKey(weak.key);
      if (parsed) counts.set(parsed.category, (counts.get(parsed.category) ?? 0) + 1);
    }
    let best = '3';
    let bestCount = 0;
    for (const [category, count] of counts) {
      if (count > bestCount) {
        best = category;
        bestCount = count;
      }
    }
    return best;
  })();

  const pendingAchievements = gamification?.pendingNotifications
    .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
    .filter((a): a is typeof ACHIEVEMENTS[number] => a !== undefined) ?? [];

  // `?? true` keeps the pre-existing default-on behaviour while progress is
  // still loading, so the build flag has to be applied on top of it here.
  const gamificationEnabled =
    GAMIFICATION_ENABLED && (gamification?.isEnabled ?? true);
  const hasActivity = stats.totalExams > 0 || (gamification?.totalXP ?? 0) > 0;

  // New user — show onboarding instead of empty data grids
  if (!hasActivity) {
    return (
      <section className="-mx-4 sm:mx-0 pb-8">
        <AchievementToastContainer
          achievements={pendingAchievements}
          onDismiss={handleDismissAchievement}
        />

        <div className="px-4 sm:px-0 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("emptyTitle")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("emptyDescription")}
          </p>
        </div>

        {/* 3-step getting started */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: "/study", icon: BookOpen, color: "green", step: 1, titleKey: "onboardingStep1Title" as const, descKey: "onboardingStep1Desc" as const },
              { href: "/browse/3", icon: ListChecks, color: "amber", step: 2, titleKey: "onboardingStep2Title" as const, descKey: "onboardingStep2Desc" as const },
              { href: "/exam/3", icon: GraduationCap, color: "rose", step: 3, titleKey: "onboardingStep3Title" as const, descKey: "onboardingStep3Desc" as const },
            ].map(({ href, icon: Icon, color, step, titleKey, descKey }) => (
              <Link
                key={step}
                href={href}
                className={`group p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-md motion-safe:animate-[fadeSlideUp_0.4s_ease-out_both] motion-reduce:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2`}
                style={{ animationDelay: `${(step - 1) * 120}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                    color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>{step}</span>
                  <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    color === 'green' ? 'text-green-600 dark:text-green-400' :
                    color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  }`} />
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {t(titleKey)}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(descKey)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick start CTA — points at step 1, matching the pedagogy above */}
        <div className="px-4 sm:px-0 mb-8 text-center motion-safe:animate-[fadeSlideUp_0.4s_ease-out_0.4s_both] motion-reduce:opacity-100">
          <Button asChild size="lg" variant="glassAccent" className="hover:shadow-lg hover:shadow-amber-500/25 active:translate-y-0.5 transition-all duration-200">
            <Link href="/study">{t("onboardingCta")}</Link>
          </Button>
        </div>

        {/* Import existing data — for returning users on a new device */}
        <div className="px-4 sm:px-0">
          <details className="group">
            <summary className="flex w-fit items-center gap-2 cursor-pointer rounded text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
              <Upload className="h-3.5 w-3.5" />
              {t("onboardingImport")}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 max-w-sm">
              <DataManagement />
            </div>
          </details>
        </div>
      </section>
    );
  }

  return (
    <section className="-mx-4 sm:mx-0 pb-8">
      {GAMIFICATION_ENABLED && (
        <AchievementToastContainer
          achievements={pendingAchievements}
          onDismiss={handleDismissAchievement}
        />
      )}

      {/* Header */}
      <div className="px-4 sm:px-0 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* XP Bar */}
      {gamificationEnabled && gamification && (
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {tGamification("xpBar.progress")}
            </h2>
            <button
              onClick={handleToggleGamification}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title={tGamification("settings.toggle")}
            >
              <Settings className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="sr-only">{tGamification("settings.toggle")}</span>
            </button>
          </div>
          <XPBar
            currentXP={gamification.totalXP}
            levelXP={gamification.xpProgress.levelXP}
            requiredXP={gamification.xpProgress.requiredXP}
            percentage={gamification.xpProgress.percentage}
            level={gamification.currentLevel}
          />
        </div>
      )}

      {/* Streak Calendar */}
      {gamificationEnabled && gamification && progress?.gamification?.xpHistory && (
        <div className="px-4 sm:px-0 mb-6">
          <StreakCalendar xpHistory={progress.gamification.xpHistory} weeks={12} />
        </div>
      )}

      {/* Readiness hero — the dark brand moment, echoing the landing's process
          section. Leads with the number that answers "am I ready?": the latest
          exam score against the pass line, with the trend chart alongside. */}
      <div className="mb-8 overflow-hidden bg-slate-900 dark:bg-slate-800/50 sm:rounded-xl">
        <div className="p-5 sm:p-8">
          {latestExam ? (
            <>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {t("lastExam")} · {t("category")} {latestExam.category} ·{" "}
                    {format.relativeTime(new Date(latestExam.timestamp), now)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {latestExam.score.toFixed(1)}
                      <span className="text-xl font-medium text-slate-400">
                        /{latestExam.totalQuestions}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        latestExam.passed
                          ? "bg-green-500/10 text-green-400 ring-green-500/30"
                          : "bg-rose-500/10 text-rose-400 ring-rose-500/30"
                      }`}
                    >
                      {latestExam.passed ? t("passed") : t("failed")}
                    </span>
                    {scoreDelta !== null && (
                      <span
                        className={`text-sm font-medium ${
                          scoreDelta >= 0 ? "text-green-400" : "text-rose-400"
                        }`}
                      >
                        {t("vsPrevious", {
                          delta: `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(1)}`,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:flex sm:flex-wrap">
                  <HeroStat label={t("totalExams")} value={stats.totalExams.toString()} />
                  <HeroStat
                    label={t("passRate")}
                    value={`${passRate}%`}
                    detail={`${stats.totalPassed}/${stats.totalExams}`}
                  />
                  <HeroStat
                    label={t("currentStreak")}
                    value={t("streakDays", { count: stats.currentStreak })}
                    detail={t("longestStreak", { count: stats.longestStreak })}
                  />
                  <HeroStat label={t("lastStudy")} value={lastStudyFormatted} />
                </dl>
              </div>

              {chartData.length > 1 && (
                <div className="mt-8">
                  <h2 className="sr-only">{t("performanceChart")}</h2>
                  <div className="h-52 sm:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.6} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={{ stroke: "#334155" }}
                        />
                        <YAxis
                          domain={[0, EXAM_CONFIG.MAX_QUESTIONS]}
                          ticks={[0, 10, 20, 30, 40]}
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                          itemStyle={{ color: "#fbbf24" }}
                          formatter={(value) => [
                            `${value}/${EXAM_CONFIG.MAX_QUESTIONS}`,
                            null,
                          ]}
                          labelFormatter={(label, payload) => {
                            const point = payload?.[0]?.payload as ChartPoint | undefined;
                            return point
                              ? `${label} · ${t("category")} ${point.category}`
                              : label;
                          }}
                        />
                        <ReferenceLine
                          y={EXAM_CONFIG.PASSING_SCORE}
                          stroke="#4ade80"
                          strokeDasharray="5 5"
                          label={{
                            value: t("passingScore"),
                            position: "insideBottomRight",
                            fill: "#4ade80",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#fbbf24"
                          strokeWidth={2}
                          dot={(props) => {
                            const { cx, cy, payload, index } = props as {
                              cx?: number;
                              cy?: number;
                              payload?: ChartPoint;
                              index?: number;
                            };
                            const fill =
                              CATEGORY_HEX[(payload?.category ?? '2') as CategoryId] ?? "#f59e0b";
                            return (
                              <circle
                                key={index}
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={fill}
                                stroke="#0f172a"
                                strokeWidth={1}
                              />
                            );
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {chartCategories.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {chartCategories.map((catId) => (
                        <span key={catId} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: CATEGORY_HEX[catId] }}
                            aria-hidden
                          />
                          {t("category")} {catId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{t("noExamsYet")}</p>
                <p className="mt-1 text-sm text-slate-400">{t("subtitle")}</p>
              </div>
              <Button asChild>
                <Link href="/exam/3">{t("startExam")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Goals & Achievements */}
      {gamificationEnabled && gamification && (
        <div className="grid md:grid-cols-2 gap-4 px-4 sm:px-0 mb-6">
          <DailyGoalsCard
            dailyProgress={gamification.dailyProgress}
            dailyGoalStreak={gamification.dailyGoalStreak}
          />
          <AchievementsGrid
            achievements={ACHIEVEMENTS}
            unlockedAchievements={progress?.gamification?.unlockedAchievements ?? []}
            maxDisplay={8}
          />
        </div>
      )}

      {/* Gamification Disabled Banner — only when the user turned it off; a
          build without gamification has no way to act on the Enable button. */}
      {GAMIFICATION_ENABLED && !gamificationEnabled && (
        <div className="mx-4 sm:mx-0 mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {tGamification("settings.disabled")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tGamification("settings.disabledDescription")}
              </p>
            </div>
            <Button size="sm" onClick={handleToggleGamification}>
              {tGamification("settings.enable")}
            </Button>
          </div>
        </div>
      )}

      {/* Weak Areas — the actionable heart of the page: real question text,
          each row links to the question, one CTA into smart practice */}
      {weakQuestions.length > 0 && (
        <div className="px-4 sm:px-0 mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("weakAreas")}
            </h2>
            <Button size="sm" asChild>
              <Link href={`/browse/${weakCtaCategory}/smart-practice`}>
                <Brain className="h-4 w-4" aria-hidden />
                {t("practiceWeakCta")}
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200 dark:border-slate-800 dark:divide-slate-800">
            {weakQuestions.map(({ key, stats: qStats, successRate }) => {
              const parsed = parseWeakKey(key);
              const question = parsed
                ? findQuestion(parsed.category, parsed.questionId)
                : undefined;
              const row = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {question?.question ??
                        `${t("category")} ${parsed?.category ?? "?"} · ${t("questionNumber", { id: parsed?.questionId ?? "?" })}`}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {t("category")} {parsed?.category ?? "?"} ·{" "}
                      {t("questionNumber", { id: parsed?.questionId ?? "?" })} ·{" "}
                      {t("attemptsCount", { count: qStats.attempts })},{" "}
                      {t("correctCount", { count: qStats.correct })}
                    </p>
                  </div>
                  <div
                    className={`shrink-0 text-sm font-semibold px-2 py-1 rounded ${
                      successRate < 0.5
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {Math.round(successRate * 100)}%
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 -translate-x-2 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600"
                    aria-hidden
                  />
                </>
              );
              return parsed ? (
                <Link
                  key={key}
                  href={`/browse/${parsed.category}#q-${parsed.questionId}`}
                  className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
                >
                  {row}
                </Link>
              ) : (
                <div key={key} className="flex items-center gap-4 px-4 py-3">
                  {row}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Progress — cards are links into the browser; best exam score
          leads, bank coverage is the secondary line */}
      <div className="px-4 sm:px-0 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          {t("categoryProgress")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CATEGORIES.map((catId) => {
            const totalQuestions = questionCounts[catId] ?? 0;
            const categoryProgress = getCategoryProgress(catId, totalQuestions);
            const bestScore = stats.bestScores[catId];
            return (
              <CategoryCard
                key={catId}
                categoryId={catId}
                mastered={categoryProgress.mastered}
                attempted={categoryProgress.attempted}
                total={totalQuestions}
                bestScore={bestScore}
                t={t}
              />
            );
          })}
        </div>
      </div>

      {/* Exam History */}
      {examHistory.length > 0 && (
        <div className="px-4 sm:px-0 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("examHistory")}
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200 dark:border-slate-800 dark:divide-slate-800">
            {examHistory.slice(0, 10).map((exam) => (
              <ExamHistoryRow key={exam.id} exam={exam} t={t} format={format} />
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks — compact link */}
      <div className="px-4 sm:px-0 mb-8">
        <Link
          href="/bookmarks"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          <Bookmark className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" aria-hidden />
          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("bookmarks")}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {bookmarkCount}
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 -translate-x-2 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600"
            aria-hidden
          />
        </Link>
      </div>

      {/* Settings — one collapsed group so the progress story isn't interrupted
          (and the page no longer ends on a destructive action) */}
      <h2 className="sr-only">{t("settings")}</h2>
      <details className="px-4 sm:px-0 mb-6 group">
        <summary className="flex w-fit items-center gap-2 cursor-pointer rounded text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
          <Settings className="h-4 w-4" aria-hidden />
          {t("settings")}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-4 space-y-6 sm:pl-6">
          <NotificationSettings />
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              {t("dataManagementDesc")}
            </p>
            <DataManagement />
          </div>
        </div>
      </details>
    </section>
  );
}

function HeroStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="font-semibold text-white">{value}</span>
        {detail && <span className="text-xs text-slate-400">{detail}</span>}
      </dd>
    </div>
  );
}

function CategoryCard({
  categoryId,
  mastered,
  attempted,
  total,
  bestScore,
  t,
}: {
  categoryId: string;
  mastered: number;
  attempted: number;
  total: number;
  bestScore?: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const targetDash = masteryPercent * 2.51;

  const cfg = CATEGORY_CONFIG[categoryId as CategoryId];
  const CategoryIcon = cfg?.icon;
  const catColors = CATEGORY_RING_COLORS[categoryId as CategoryId];

  return (
    <Link
      href={`/browse/${categoryId}`}
      className={`group flex items-center gap-4 p-4 rounded-xl ${catColors.bg} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2`}
    >
      <div className="min-w-0 flex-1">
        <h3 className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${cfg?.badgeText ?? ''}`}>
          {CategoryIcon && <CategoryIcon className="h-4 w-4 shrink-0" aria-hidden />}
          {t("category")} {categoryId}
        </h3>
        {bestScore !== undefined ? (
          <>
            <p className="mt-1.5 text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">
              {bestScore.toFixed(1)}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                /{EXAM_CONFIG.MAX_QUESTIONS}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("bestScore")}</p>
          </>
        ) : (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {t("noExamsYet")}
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {mastered}/{total} {t("mastered")} · {attempted} {t("attempted")}
        </p>
      </div>
      <div className="relative h-14 w-14 shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="10"
            fill="none"
            cx="50"
            cy="50"
            r="40"
          />
          <circle
            className={`${catColors.stroke} motion-safe:animate-[ringDraw_0.8s_ease-out_0.3s_both]`}
            strokeWidth="10"
            fill="none"
            cx="50"
            cy="50"
            r="40"
            strokeLinecap="round"
            strokeDasharray={`${targetDash} 251`}
            style={{ '--ring-target': `${targetDash}` } as React.CSSProperties}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {masteryPercent}%
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExamHistoryRow({
  exam,
  t,
  format,
}: {
  exam: ExamAttempt;
  t: ReturnType<typeof useTranslations>;
  format: ReturnType<typeof useFormatter>;
}) {
  const date = new Date(exam.timestamp);
  const replayHref = buildReplayHref(exam);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          exam.passed
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            : "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400"
        }`}
      >
        {exam.passed ? (
          <CheckCircle className="h-4 w-4" aria-hidden />
        ) : (
          <XCircle className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only">{exam.passed ? t("passed") : t("failed")}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {t("category")} {exam.category}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {format.dateTime(date, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {replayHref && (
            <>
              {" · "}
              <Link
                href={replayHref}
                className="inline-flex items-center gap-1 rounded p-1 -m-1 font-medium text-amber-600 hover:underline dark:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                {t("review")}
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            exam.passed
              ? "text-green-600 dark:text-green-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {exam.score.toFixed(1)}/{exam.totalQuestions}
        </p>
        <span className="sr-only">
          {t("resultBreakdown", {
            correct: exam.correctCount,
            incorrect: exam.incorrectCount,
            unanswered: exam.unansweredCount,
          })}
        </span>
        <p
          aria-hidden
          className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end"
        >
          <CheckCircle className="h-3 w-3 text-green-500" />
          {exam.correctCount}
          <XCircle className="h-3 w-3 text-rose-500 ml-1" />
          {exam.incorrectCount}
          <MinusCircle className="h-3 w-3 text-slate-400 ml-1" />
          {exam.unansweredCount}
        </p>
      </div>
    </div>
  );
}
