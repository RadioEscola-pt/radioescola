"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { navIconButton } from "./nav-styles";

// Hydration-safe "is this running on the client?" flag — false on the
// server and during hydration, true afterwards. No subscription needed.
const noopSubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useIsMounted();

  // Prevent hydration mismatch by rendering placeholder until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className={navIconButton}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={navIconButton}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
