"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseExamTimerOptions {
  initialSeconds: number;
  paused?: boolean;
  onExpire?: () => void;
}

interface UseExamTimerReturn {
  timeLeft: number;
  isExpired: boolean;
  reset: (newTime?: number) => void;
  setTimeLeft: (time: number) => void;
}

/**
 * Hook for managing an exam countdown timer.
 *
 * The countdown runs toward a wall-clock deadline (epoch ms) and derives the
 * remaining time from Date.now() on each tick, rather than decrementing a
 * per-tick counter. This avoids cumulative drift and prevents background-tab
 * throttling from silently granting extra time. Pausing freezes the deadline;
 * resuming (or calling reset/setTimeLeft) re-anchors it to the remaining time.
 */
export function useExamTimer(options: UseExamTimerOptions): UseExamTimerReturn {
  const { initialSeconds, paused = false, onExpire } = options;

  const [timeLeft, setTimeLeftState] = useState<number>(initialSeconds);
  // Latest timeLeft, readable inside effects without adding it as a dependency
  // (which would re-anchor the deadline on every tick).
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Bumped by reset()/setTimeLeft() to restart the countdown with a new time
  // (e.g. after the timer has already expired). Not bumped on normal ticks.
  const [runToken, setRunToken] = useState(0);

  // Wall-clock deadline (epoch ms) the countdown runs toward; null when paused.
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire callback fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Countdown: (re)created only when paused toggles or the timer is reset — never
  // on every tick — so there is no per-tick teardown/drift.
  useEffect(() => {
    if (paused) {
      deadlineRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Anchor the deadline to whatever time remains.
    deadlineRef.current = Date.now() + timeLeftRef.current * 1000;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setTimeLeftState(remaining);
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick(); // sync immediately so the display is correct on (re)start
    timerRef.current = setInterval(tick, 250);

    // Re-sync as soon as the tab regains focus; background tabs throttle timers.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, runToken]);

  // Handle expiration callback
  useEffect(() => {
    if (timeLeft === 0 && onExpireRef.current) {
      onExpireRef.current();
    }
  }, [timeLeft]);

  // Set remaining time and restart the countdown from it.
  const setTimeLeft = useCallback((time: number) => {
    setTimeLeftState(time);
    setRunToken((n) => n + 1);
  }, []);

  const reset = useCallback(
    (newTime?: number) => {
      setTimeLeft(newTime ?? initialSeconds);
    },
    [initialSeconds, setTimeLeft]
  );

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    reset,
    setTimeLeft,
  };
}
