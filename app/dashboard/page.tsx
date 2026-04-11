"use client";

import { useTranslations } from "next-intl";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { PageLoading } from "@/components/shared/Loading";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/config";
import type { CategoryId } from "@/lib/config/categories";
import { loadData } from "@/lib/data";
import { useEffect, useState } from "react";
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

interface CategoryQuestionCount {
  [key: string]: number;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tGamification = useTranslations("Gamification");
  const { progress, isLoading, getCategoryProgress, getWeakQuestions, setGamificationEnabled, dismissAchievementNotifications, gamification } =
    useProgressContext();
  const [questionCounts, setQuestionCounts] = useState<CategoryQuestionCount>(
    {}
  );
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    loadData().then((data) => {
      const counts: CategoryQuestionCount = {};
      for (const catId of CATEGORIES) {
        counts[catId] = data.categories[catId]?.questions.length ?? 0;
      }
      setQuestionCounts(counts);
    });
  }, []);

  useEffect(() => {
    if (progress) {
      const bookmarks = getBookmarkedQuestions(progress);
      setBookmarkCount(bookmarks.length);
    }
  }, [progress]);

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

  const chartData = examHistory
    .slice(0, 10)
    .reverse()
    .map((exam, index) => ({
      name: `#${index + 1}`,
      score: exam.score,
      passed: exam.passed,
      date: new Date(exam.timestamp).toLocaleDateString(),
    }));

  const weakQuestions = getWeakQuestions(2).slice(0, 5);

  const pendingAchievements = gamification?.pendingNotifications
    .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
    .filter((a): a is typeof ACHIEVEMENTS[number] => a !== undefined) ?? [];

  const gamificationEnabled = gamification?.isEnabled ?? true;
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
                className={`group p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-md motion-safe:animate-[fadeSlideUp_0.4s_ease-out_both] motion-reduce:opacity-100`}
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
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {t(titleKey)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(descKey)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick start CTA */}
        <div className="px-4 sm:px-0 mb-8 text-center motion-safe:animate-[fadeSlideUp_0.4s_ease-out_0.4s_both] motion-reduce:opacity-100">
          <Button asChild size="lg" className="hover:shadow-lg hover:shadow-amber-500/25 active:translate-y-0.5 transition-all duration-200">
            <Link href="/exam/3">{t("startExam")}</Link>
          </Button>
        </div>

        {/* Import existing data — for returning users on a new device */}
        <div className="px-4 sm:px-0">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors list-none [&::-webkit-details-marker]:hidden">
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
      <AchievementToastContainer
        achievements={pendingAchievements}
        onDismiss={handleDismissAchievement}
      />

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
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={tGamification("settings.toggle")}
            >
              <Settings className="h-4 w-4 text-slate-400" />
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

      {/* Compact Stats */}
      <div className="px-4 sm:px-0 mb-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2 text-sm">
          <Stat label={t("totalExams")} value={stats.totalExams.toString()} />
          <Stat
            label={t("passRate")}
            value={`${passRate}%`}
            detail={`${stats.totalPassed}/${stats.totalExams}`}
            valueColor={passRate >= 70 ? 'text-green-600 dark:text-green-400' : passRate >= 40 ? 'text-amber-600 dark:text-amber-400' : undefined}
          />
          <Stat
            label={t("currentStreak")}
            value={`${stats.currentStreak}`}
            detail={t("longestStreak", { count: stats.longestStreak })}
            valueColor={stats.currentStreak >= 3 ? 'text-amber-600 dark:text-amber-400' : undefined}
          />
          <Stat label={t("lastStudy")} value={stats.lastStudyDate ?? t("never")} />
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

      {/* Gamification Disabled Banner */}
      {!gamificationEnabled && (
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

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="px-4 sm:px-0 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t("performanceChart")}
          </h2>
          <div className="h-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-700"
                />
                <XAxis
                  dataKey="name"
                  className="text-slate-500 dark:text-slate-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 40]}
                  className="text-slate-500 dark:text-slate-400"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-slate-800)",
                    border: "1px solid var(--color-slate-700)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-slate-200)" }}
                />
                <ReferenceLine
                  y={20}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{
                    value: t("passingScore"),
                    position: "right",
                    fill: "#22c55e",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Progress */}
      <div className="px-4 sm:px-0 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
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

      {/* Weak Areas */}
      {weakQuestions.length > 0 && (
        <div className="px-4 sm:px-0 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("weakAreas")}
          </h2>
          <div className="space-y-2">
            {weakQuestions.map(({ key, stats: qStats, successRate }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {key.replace("cat", t("category") + " ").replace("_", " #")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {qStats.attempts} {t("attempts")}, {qStats.correct}{" "}
                    {t("correct")}
                  </p>
                </div>
                <div
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    successRate < 0.5
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {Math.round(successRate * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam History */}
      {examHistory.length > 0 && (
        <div className="px-4 sm:px-0 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("examHistory")}
          </h2>
          <div className="space-y-2">
            {examHistory.slice(0, 10).map((exam) => (
              <ExamHistoryRow key={exam.id} exam={exam} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks — compact link */}
      <div className="px-4 sm:px-0 mb-6">
        <Link
          href="/bookmarks"
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <Bookmark className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("bookmarks")}
          </span>
          <span className="text-xs text-slate-400">
            {t("bookmarksCount", { count: bookmarkCount })}
          </span>
        </Link>
      </div>

      {/* Notification Settings */}
      <div className="px-4 sm:px-0 mb-6">
        <NotificationSettings />
      </div>

      {/* Data Management — collapsed by default */}
      <details className="px-4 sm:px-0 mb-6 group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors list-none [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          {t("dataManagement")}
        </summary>
        <div className="mt-3 pl-6">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            {t("dataManagementDesc")}
          </p>
          <DataManagement />
        </div>
      </details>
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
  valueColor,
}: {
  label: string;
  value: string;
  detail?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-semibold text-base sm:text-sm ${valueColor ?? 'text-slate-900 dark:text-slate-100'}`}>{value}</span>
        {detail && (
          <span className="text-xs text-slate-400 dark:text-slate-500">{detail}</span>
        )}
      </div>
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
    <div className={`p-4 rounded-xl ${catColors.bg}`}>
      <h3 className={`flex items-center gap-1.5 font-semibold mb-3 ${cfg?.badgeText ?? ''}`}>
        {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
        {t("category")} {categoryId}
      </h3>
      <div className="relative h-20 w-20 mx-auto mb-3">
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
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {masteryPercent}%
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        <p className="text-slate-600 dark:text-slate-300">
          {mastered}/{total} {t("mastered")}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          {attempted} {t("attempted")}
        </p>
        {bestScore !== undefined && (
          <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
            {t("bestScore")}: {bestScore.toFixed(1)}
          </p>
        )}
      </div>
    </div>
  );
}

function ExamHistoryRow({
  exam,
  t,
}: {
  exam: ExamAttempt;
  t: ReturnType<typeof useTranslations>;
}) {
  const date = new Date(exam.timestamp);

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border-l-3 ${
      exam.passed
        ? 'bg-green-50/50 dark:bg-green-950/10 border-green-500'
        : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-400'
    }`}>
      <div className="flex items-center gap-3">
        {exam.passed ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-400" />
        )}
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {t("category")} {exam.category}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            exam.passed
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {exam.score.toFixed(1)}/{exam.totalQuestions}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end">
          <CheckCircle className="h-3 w-3 text-green-500" />
          {exam.correctCount}
          <XCircle className="h-3 w-3 text-red-500 ml-1" />
          {exam.incorrectCount}
          <MinusCircle className="h-3 w-3 text-slate-400 ml-1" />
          {exam.unansweredCount}
        </p>
      </div>
    </div>
  );
}
