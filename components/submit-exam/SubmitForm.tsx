"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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
      <div className="rounded-lg border bg-green-50 border-green-200 p-6 text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
        <h3 className="font-semibold text-green-800">{t("submit.success")}</h3>
        <p className="text-sm text-green-700 mt-1">{t("submit.successDesc")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
      <h3 className="font-semibold mb-4">{t("form.category")}</h3>

      {/* Category dropdown (required) */}
      <div className="mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId | "")}
          required
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500",
            category === "" && "text-gray-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("form.year")}
        </label>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t("form.yearPlaceholder")}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Email (optional) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("form.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("form.emailPlaceholder")}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">{t("form.emailHint")}</p>
      </div>

      {/* Error state */}
      {status === "error" && error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{t("submit.error")}</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 underline"
          >
            {t("submit.retry")}
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {isSubmitting && (
        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {status === "preparing" && t("progress.preparing")}
            {status === "generating" && t("progress.generating")}
            {status === "uploading" && t("progress.uploading")}
          </span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2",
          "px-4 py-2.5 rounded-md text-sm font-medium",
          "bg-indigo-600 text-white",
          "hover:bg-indigo-700 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isSubmitting ? t("submit.sending") : t("submit.button")}
      </button>

      {pageCount === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          {t("pages.empty")}
        </p>
      )}
    </form>
  );
}
