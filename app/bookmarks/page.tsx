"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bookmark, ArrowLeft, Trash2 } from "lucide-react";
import { useProgressContext } from "@/components/providers/ProgressProvider";
import { getBookmarkedQuestions, toggleBookmark } from "@/lib/storage/localStorage";
import { loadData } from "@/lib/data";
import { CATEGORY_CONFIG } from "@/lib/config/categories";
import type { CategoryId } from "@/lib/config/categories";
import type { Question, Data } from "@/lib/types";
import type { QuestionStats } from "@/lib/types/progress";
import QuestionCard from "@/components/QuestionCard";
import { PageLoading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

interface BookmarkedQuestion {
  key: string;
  category: string;
  questionId: number;
  stats: QuestionStats;
  question?: Question;
}

export default function BookmarksPage() {
  const t = useTranslations("Bookmarks");
  const { progress, refreshProgress } = useProgressContext();
  const [filter, setFilter] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  // Load question data
  useEffect(() => {
    loadData().then(setData);
  }, []);

  const isLoading = data === null;

  // Bookmarked questions enriched with their question data — derived from progress + data
  const bookmarks = useMemo<BookmarkedQuestion[]>(() => {
    if (!data) return [];

    return getBookmarkedQuestions(progress).map((b) => {
      const categoryData = data.categories[b.category];
      const question = categoryData?.questions.find((q) => q.id === b.questionId);
      return { ...b, question };
    });
  }, [progress, data]);

  const handleRemoveBookmark = useCallback(async (category: string, questionId: number) => {
    await toggleBookmark(category, questionId);
    await refreshProgress();
  }, [refreshProgress]);

  const filteredBookmarks = filter
    ? bookmarks.filter((b) => b.category === filter)
    : bookmarks;

  const categories = [...new Set(bookmarks.map((b) => b.category))].sort();

  if (isLoading) {
    return <PageLoading message={t("loading")} />;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>

        <div className="flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-amber-500 fill-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t("title")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("subtitle", { count: bookmarks.length })}
            </p>
          </div>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">{t("empty")}</p>
          <Link href="/browse/3">
            <Button variant="outline">{t("startBrowsing")}</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Category filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filter === null
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {t("filterAll")} ({bookmarks.length})
              </button>
              {categories.map((cat) => {
                const count = bookmarks.filter((b) => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      filter === cat
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {t("filterCategory", { id: cat })} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Bookmarked questions list */}
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => {
              if (!bookmark.question) {
                return (
                  <div
                    key={bookmark.key}
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-slate-500"
                  >
                    {t("questionNotFound", { id: bookmark.questionId })}
                  </div>
                );
              }

              return (
                <div key={bookmark.key} className="relative">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    {(() => {
                      const cfg = CATEGORY_CONFIG[bookmark.category as CategoryId];
                      const CatIcon = cfg?.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${cfg ? `${cfg.badgeBg} ${cfg.badgeText}` : "bg-slate-100 text-slate-700"}`}>
                          {CatIcon && <CatIcon className="h-3 w-3" />}
                          Cat {bookmark.category}
                        </span>
                      );
                    })()}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.category, bookmark.questionId)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <QuestionCard
                    question={bookmark.question}
                    selectedOption={undefined}
                    onSelect={() => {}}
                    showImage
                    disabled
                    successRate={bookmark.stats.attempts > 0 ? (bookmark.stats.correct / bookmark.stats.attempts) * 100 : undefined}
                    attemptCount={bookmark.stats.attempts}
                  />
                  {bookmark.stats.notes && (
                    <div className="mt-2 mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <span className="font-medium">{t("notes")}:</span> {bookmark.stats.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
