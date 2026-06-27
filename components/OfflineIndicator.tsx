"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WifiOff, X } from "lucide-react";
import { useOnlineStatus } from "@/lib/pwa";

export function OfflineIndicator() {
  const t = useTranslations("Offline");
  const { isOnline, wasOffline } = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  // Reset dismissed state when connectivity drops so the banner reappears
  useEffect(() => {
    if (!isOnline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a connectivity transition
      setDismissed(false);
    }
  }, [isOnline]);

  // Show "reconnected" message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- transient banner cleared by the timer below
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, wasOffline]);

  // Show nothing if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  // Show nothing if dismissed while offline
  if (!isOnline && dismissed) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOnline
          ? "bg-green-500 text-white"
          : "bg-amber-500 text-slate-900"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {!isOnline && <WifiOff className="h-4 w-4" />}
        <span>
          {isOnline ? t("reconnected") : t("message")}
        </span>
        {!isOnline && (
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-0.5 rounded hover:bg-amber-600/20 transition-colors"
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;
