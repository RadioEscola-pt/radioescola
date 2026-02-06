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
        className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600"
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
          className={`${hasUnits ? "flex-1" : "w-full"} rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring ${focusClass} ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {hasUnits && selectedUnit !== undefined && onUnitChange && (
          <select
            value={selectedUnit}
            onChange={(e) => onUnitChange(e.target.value)}
            className={`w-20 rounded border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring ${focusClass}`}
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
