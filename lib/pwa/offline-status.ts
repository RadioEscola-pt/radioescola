"use client";

import { useState, useEffect, useCallback } from "react";

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    // Set initial state
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}

/**
 * Check if the browser is currently online
 */
export function checkOnlineStatus(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
