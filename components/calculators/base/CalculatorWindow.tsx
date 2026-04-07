"use client";

import React from "react";
import { X } from "lucide-react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";
import type { Position, CalculatorColor } from "@/lib/types";

interface CalculatorWindowProps {
  title: string;
  color: CalculatorColor;
  width?: string;
  initialPosition: Position;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const COLOR_CLASSES: Record<CalculatorColor, { bg: string; hover: string; focus: string }> = {
  blue: { bg: "bg-blue-600", hover: "hover:bg-blue-500", focus: "focus:ring-blue-500" },
  green: { bg: "bg-green-600", hover: "hover:bg-green-500", focus: "focus:ring-green-500" },
  purple: { bg: "bg-purple-600", hover: "hover:bg-purple-500", focus: "focus:ring-purple-500" },
  orange: { bg: "bg-orange-600", hover: "hover:bg-orange-500", focus: "focus:ring-orange-500" },
  cyan: { bg: "bg-cyan-600", hover: "hover:bg-cyan-500", focus: "focus:ring-cyan-500" },
  rose: { bg: "bg-rose-600", hover: "hover:bg-rose-500", focus: "focus:ring-rose-500" },
};

export function CalculatorWindow({
  title,
  color,
  width = "w-72",
  initialPosition,
  zIndex,
  onClose,
  onFocus,
  children,
}: CalculatorWindowProps) {
  const { position, containerRef, beginDrag } = useDraggableWindow({
    initialPosition,
  });

  const colorClasses = COLOR_CLASSES[color];

  const handlePointerDown = () => {
    onFocus();
  };

  return (
    <div
      ref={containerRef}
      className={`fixed ${width} select-none rounded-lg border border-gray-300 bg-white shadow-lg`}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={handlePointerDown}
    >
      <div
        className={`flex cursor-move items-center justify-between rounded-t-lg ${colorClasses.bg} px-3 py-2 text-sm font-semibold text-white`}
        onPointerDown={beginDrag}
      >
        <span>{title}</span>
        <button
          type="button"
          onClick={onClose}
          className={`rounded-md p-1 transition ${colorClasses.hover}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 px-5 py-5 text-sm overflow-hidden">{children}</div>
    </div>
  );
}
