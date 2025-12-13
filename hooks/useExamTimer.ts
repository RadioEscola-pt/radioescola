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
 * Hook for managing an exam countdown timer
 * Handles countdown, expiration, and reset functionality
 */
export function useExamTimer(options: UseExamTimerOptions): UseExamTimerReturn {
  const { initialSeconds, paused = false, onExpire } = options;

  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire callback fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Handle countdown
  useEffect(() => {
    // If paused or time is up, ensure timer is stopped
    if (paused || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start ticking
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, timeLeft]);

  // Handle expiration callback
  useEffect(() => {
    if (timeLeft === 0 && onExpireRef.current) {
      onExpireRef.current();
    }
  }, [timeLeft]);

  const reset = useCallback(
    (newTime?: number) => {
      setTimeLeft(newTime ?? initialSeconds);
    },
    [initialSeconds]
  );

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    reset,
    setTimeLeft,
  };
}
