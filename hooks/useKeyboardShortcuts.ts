"use client";

import { useEffect, useCallback } from "react";

type ShortcutHandler = () => void;

export interface KeyboardShortcutConfig {
  onAnswer1?: ShortcutHandler;
  onAnswer2?: ShortcutHandler;
  onAnswer3?: ShortcutHandler;
  onAnswer4?: ShortcutHandler;
  onNext?: ShortcutHandler;
  onPrevious?: ShortcutHandler;
  onReveal?: ShortcutHandler;
  onEndQuiz?: ShortcutHandler;
  enabled?: boolean;
}

function isInputElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toUpperCase();
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    element.isContentEditable
  );
}

export function useKeyboardShortcuts(config: KeyboardShortcutConfig): void {
  const {
    onAnswer1,
    onAnswer2,
    onAnswer3,
    onAnswer4,
    onNext,
    onPrevious,
    onReveal,
    onEndQuiz,
    enabled = true,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement | null;
      if (isInputElement(target)) return;

      const key = event.key.toLowerCase();

      switch (key) {
        case "1":
        case "a":
          if (onAnswer1) {
            event.preventDefault();
            onAnswer1();
          }
          break;

        case "2":
        case "b":
          if (onAnswer2) {
            event.preventDefault();
            onAnswer2();
          }
          break;

        case "3":
        case "c":
          if (onAnswer3) {
            event.preventDefault();
            onAnswer3();
          }
          break;

        case "4":
        case "d":
          if (onAnswer4) {
            event.preventDefault();
            onAnswer4();
          }
          break;

        case "arrowright":
        case "n":
          if (onNext) {
            event.preventDefault();
            onNext();
          }
          break;

        case "arrowleft":
        case "p":
          if (onPrevious) {
            event.preventDefault();
            onPrevious();
          }
          break;

        case " ":
        case "enter":
          if (onReveal) {
            event.preventDefault();
            onReveal();
          }
          break;

        case "escape":
          if (onEndQuiz) {
            event.preventDefault();
            onEndQuiz();
          }
          break;
      }
    },
    [enabled, onAnswer1, onAnswer2, onAnswer3, onAnswer4, onNext, onPrevious, onReveal, onEndQuiz]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
