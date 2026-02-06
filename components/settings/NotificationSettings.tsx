"use client";

import { Bell, BellOff, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationSettings() {
  const t = useTranslations("Notifications");
  const {
    settings,
    isSupported,
    isEnabled,
    permission,
    toggleEnabled,
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-start gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <BellOff className="h-5 w-5 text-slate-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("notSupported")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("notSupportedDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
          ) : (
            <BellOff className="h-5 w-5 text-slate-400 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t("title")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("description")}
            </p>
          </div>
        </div>

        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
            isEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Permission denied warning */}
      {permission === "denied" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {t("permissionDenied")}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {t("permissionDeniedDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Settings when enabled */}
      {isEnabled && permission === "granted" && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("minQuestions")}
            </label>
            <select
              value={settings.minQuestionsForReminder}
              onChange={(e) =>
                toggleEnabled().then(() => {
                  // Settings are saved automatically
                })
              }
              className="w-full p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value={3}>3 {t("questions")}</option>
              <option value={5}>5 {t("questions")}</option>
              <option value={10}>10 {t("questions")}</option>
              <option value={20}>20 {t("questions")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("cooldown")}
            </label>
            <select
              value={settings.cooldownMinutes}
              onChange={(e) =>
                toggleEnabled().then(() => {
                  // Settings are saved automatically
                })
              }
              className="w-full p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value={30}>30 {t("minutes")}</option>
              <option value={60}>1 {t("hour")}</option>
              <option value={120}>2 {t("hours")}</option>
              <option value={240}>4 {t("hours")}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
