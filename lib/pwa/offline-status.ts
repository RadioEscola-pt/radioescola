"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Hook to track online/offline status.
 * `isOnline` is sourced from the browser's connectivity store via
 * useSyncExternalStore (SSR-safe: assumes online on the server).
 */
export function useOnlineStatus(): OnlineStatus {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    () => navigator.onLine,
    () => true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setWasOffline(true);
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  return { isOnline, wasOffline };
}

/**
 * Check if the browser is currently online
 */
export function checkOnlineStatus(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
