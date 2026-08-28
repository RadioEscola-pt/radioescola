"use client";

import React from "react";
import type { CalculatorColor } from "@/lib/types";

interface CalculatorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  units?: readonly string[];
  selectedUnit?: string;
  onUnitChange?: (unit: string) => void;
  color?: CalculatorColor;
  disabled?: boolean;
}

const FOCUS_CLASSES: Record<CalculatorColor, string> = {
  blue: "focus:border-blue-500 focus:ring-blue-500",
  green: "focus:border-green-500 focus:ring-green-500",
  purple: "focus:border-purple-500 focus:ring-purple-500",
  orange: "focus:border-orange-500 focus:ring-orange-500",
  cyan: "focus:border-cyan-500 focus:ring-cyan-500",
  rose: "focus:border-rose-500 focus:ring-rose-500",
  amber: "focus:border-amber-500 focus:ring-amber-500",
  indigo: "focus:border-indigo-500 focus:ring-indigo-500",
  teal: "focus:border-teal-500 focus:ring-teal-500",
};

export function CalculatorInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  units,
  selectedUnit,
  onUnitChange,
  color = "blue",
  disabled = false,
}: CalculatorInputProps) {
  const focusClass = FOCUS_CLASSES[color];
  const hasUnits = units && units.length > 0;

  return (
    <div>
      <label
        className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
        htmlFor={id}
      >
        {label}
      </label>
      <div className={hasUnits ? "flex gap-2" : undefined}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${hasUnits ? "flex-1" : "w-full"} rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 ${focusClass} ${disabled ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {hasUnits && selectedUnit !== undefined && onUnitChange && (
          <select
            value={selectedUnit}
            onChange={(e) => onUnitChange(e.target.value)}
            className={`w-20 rounded border border-slate-300 bg-white px-1 py-1 text-sm text-slate-900 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 ${focusClass}`}
            disabled={disabled}
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
