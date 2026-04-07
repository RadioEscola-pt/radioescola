"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId } from "@/lib/config/categories";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ExamSubmissionMetadata, SubmissionStatus } from "@/lib/types";

interface SubmitFormProps {
  pageCount: number;
  status: SubmissionStatus;
  error: string | null;
  onSubmit: (metadata: ExamSubmissionMetadata) => void;
  onRetry: () => void;
}

export function SubmitForm({ pageCount, status, error, onSubmit, onRetry }: SubmitFormProps) {
  const t = useTranslations("SubmitExam");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [email, setEmail] = useState("");

  const isSubmitting = ["preparing", "generating", "uploading"].includes(status);
  const canSubmit = pageCount > 0 && category !== "" && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !category) return;
    onSubmit({
      category,
      year: year || undefined,
      email: email || undefined,
    });
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6 text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-3" />
        <h3 className="font-semibold text-green-800 dark:text-green-300">{t("submit.success")}</h3>
        <p className="text-sm text-green-700 dark:text-green-400 mt-1">{t("submit.successDesc")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          {t("submit.submitAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">{t("form.title")}</h3>

      {/* Category dropdown (required) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t("form.category")}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId | "")}
          required
          className={cn(
            "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm",
            "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-amber-500",
            category === "" && "text-slate-500 dark:text-slate-400"
          )}
        >
          <option value="" disabled>
            {t("form.categoryPlaceholder")}
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              Categoria {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Year (optional) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t("form.year")}
        </label>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t("form.yearPlaceholder")}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Email (optional) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t("form.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("form.emailPlaceholder")}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("form.emailHint")}</p>
      </div>

      {/* Error state */}
      {status === "error" && error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{t("submit.error")}</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 dark:text-red-400 underline"
          >
            {t("submit.retry")}
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {isSubmitting && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {status === "preparing" && t("progress.preparing")}
            {status === "generating" && t("progress.generating")}
            {status === "uploading" && t("progress.uploading")}
          </span>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isSubmitting ? t("submit.sending") : t("submit.button")}
      </Button>

    </form>
  );
}
