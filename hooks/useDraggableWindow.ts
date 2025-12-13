"use client";

import { useState, useRef, useCallback, useEffect, RefObject } from "react";

export type Position = { x: number; y: number };

interface UseDraggableWindowOptions {
  initialPosition?: Position;
  padding?: number;
}

interface UseDraggableWindowReturn {
  position: Position;
  containerRef: RefObject<HTMLDivElement | null>;
  beginDrag: (event: React.PointerEvent<HTMLDivElement>) => void;
}

function clampPosition(pos: Position, padding: number): Position {
  const maxX = typeof window !== "undefined" ? window.innerWidth - padding : pos.x;
  const maxY = typeof window !== "undefined" ? window.innerHeight - padding : pos.y;
  return {
    x: Math.max(padding - 8, Math.min(maxX, pos.x)),
    y: Math.max(padding, Math.min(maxY, pos.y)),
  };
}

/**
 * Hook for creating draggable floating windows
 * Handles pointer events, clamping to viewport, and cleanup
 */
export function useDraggableWindow(options: UseDraggableWindowOptions = {}): UseDraggableWindowReturn {
  const { initialPosition = { x: 40, y: 120 }, padding = 16 } = options;

  const [position, setPosition] = useState<Position>(() => initialPosition);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(
    (next: Position) => {
      setPosition(clampPosition(next, padding));
    },
    [padding]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const next = {
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y,
      };
      updatePosition(next);
    },
    [updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const beginDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      draggingRef.current = true;
      dragOffsetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      event.preventDefault();
    },
    [handlePointerMove, handlePointerUp]
  );

  return { position, containerRef, beginDrag };
}
