"use client";
import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface UseConfettiOptions {
  enabled?: boolean;
}

export function useConfetti({ enabled = true }: UseConfettiOptions = {}) {
  const hasTriggered = useRef(false);

  const celebrate = useCallback(() => {
    if (!enabled || hasTriggered.current) return;

    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    hasTriggered.current = true;

    const colors = ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#fbbf24', '#f59e0b'];

    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });

    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    // Center burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors,
      });
    }, 200);
  }, [enabled]);

  const reset = useCallback(() => {
    hasTriggered.current = false;
  }, []);

  return { celebrate, reset };
}
