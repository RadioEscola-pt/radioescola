"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { useProgressContext } from "@/components/providers/ProgressProvider";

/**
 * Tells the user when their progress stopped being saved.
 *
 * Answers are written to localStorage from handlers that do not await the
 * write, so a full quota used to fail in complete silence: the session looked
 * normal and nothing was persisted. This is the one place that failure surfaces.
 */
export function StorageWarning() {
  const t = useTranslations("Storage");
  const { storageError, dismissStorageError } = useProgressContext();

  if (!storageError) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-700 bg-red-600 px-4 py-3 text-white"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{t("notSavedTitle")}</p>
          <p className="mt-0.5 text-red-50">
            {storageError.kind === "quota" ? t("quotaBody") : t("unknownBody")}
          </p>
        </div>
        <button
          onClick={dismissStorageError}
          className="rounded p-1 transition-colors hover:bg-red-700"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
