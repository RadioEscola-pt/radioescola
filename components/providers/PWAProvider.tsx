"use client";

import { useEffect, type ReactNode } from "react";
import { registerServiceWorker } from "@/lib/pwa";
import { OfflineIndicator } from "@/components/OfflineIndicator";

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}

export default PWAProvider;
