"use client";

import { useTranslations } from "next-intl";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { PageLoading } from "@/components/shared/Loading";
import { CATEGORIES } from "@/lib/config";
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
  Trophy,
  Target,
  Flame,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import type { ExamAttempt } from "@/lib/types/progress";

interface CategoryQuestionCount {
  [key: string]: number;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { progress, isLoading, getCategoryProgress, getWeakQuestions } =
    useProgressContext();
  const [questionCounts, setQuestionCounts] = useState<CategoryQuestionCount>(
    {}
  );

  useEffect(() => {
    loadData().then((data) => {
      const counts: CategoryQuestionCount = {};
      for (const catId of CATEGORIES) {
        counts[catId] = data.categories[catId]?.questions.length ?? 0;
      }
      setQuestionCounts(counts);
    });
  }, []);

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

  // Prepare chart data (last 10 exams, reversed for chronological order)
  const chartData = examHistory
    .slice(0, 10)
    .reverse()
    .map((exam, index) => ({
      name: `#${index + 1}`,
      score: exam.score,
      passed: exam.passed,
      date: new Date(exam.timestamp).toLocaleDateString(),
    }));

  // Get weak questions
  const weakQuestions = getWeakQuestions(2).slice(0, 5);

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      <div className="px-4 sm:px-0 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 sm:px-0 mb-6">
        <StatCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label={t("totalExams")}
          value={stats.totalExams.toString()}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-green-500" />}
          label={t("passRate")}
          value={`${passRate}%`}
          subtext={`${stats.totalPassed}/${stats.totalExams}`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label={t("currentStreak")}
          value={stats.currentStreak.toString()}
          subtext={t("longestStreak", { count: stats.longestStreak })}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label={t("lastStudy")}
          value={stats.lastStudyDate ?? t("never")}
        />
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mx-4 sm:mx-0 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            {t("performanceChart")}
          </h2>
          <div className="h-64">
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          {t("categoryProgress")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CATEGORIES.map((catId) => {
            const totalQuestions = questionCounts[catId] ?? 0;
            const categoryProgress = getCategoryProgress(
              catId,
              totalQuestions
            );
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mx-4 sm:mx-0 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t("weakAreas")}
          </h2>
          <div className="space-y-3">
            {weakQuestions.map(({ key, stats: qStats, successRate }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mx-4 sm:mx-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            {t("examHistory")}
          </h2>
          <div className="space-y-2">
            {examHistory.slice(0, 10).map((exam) => (
              <ExamHistoryRow key={exam.id} exam={exam} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!progress ||
        (examHistory.length === 0 && (
          <div className="text-center py-12 px-4">
            <Trophy className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t("emptyTitle")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t("emptyDescription")}
            </p>
            <a
              href="/exam/3"
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
            >
              {t("startExam")}
            </a>
          </div>
        ))}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {subtext}
        </p>
      )}
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {t("category")} {categoryId}
      </h3>
      <div className="relative h-24 w-24 mx-auto mb-3">
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
            className="stroke-amber-500"
            strokeWidth="10"
            fill="none"
            cx="50"
            cy="50"
            r="40"
            strokeLinecap="round"
            strokeDasharray={`${masteryPercent * 2.51} 251`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {masteryPercent}%
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        <p className="text-slate-600 dark:text-slate-300">
          {mastered}/{total} {t("mastered")}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
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
  const timeSpentMinutes = Math.floor(exam.timeSpent / 60);
  const timeSpentSeconds = exam.timeSpent % 60;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        {exam.passed ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
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
