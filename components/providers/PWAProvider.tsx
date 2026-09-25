"use client";

import { useEffect, type ReactNode } from "react";
import { registerServiceWorker, unregisterServiceWorker } from "@/lib/pwa";
import { OfflineIndicator } from "@/components/OfflineIndicator";

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
      return;
    }

    // Never in development. The worker serves scripts stale-while-revalidate,
    // and a dev server reuses chunk URLs while their contents change, so a
    // phone that once opened the dev server gets yesterday's JavaScript against
    // today's HTML. Hydration then fails with nothing in the UI to show for it:
    // links still navigate, because they are plain anchors, while every button
    // in the app goes dead. Tear down whatever a previous dev session left.
    unregisterServiceWorker();
  }, []);

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}

export default PWAProvider;
