"use client";

import React from "react";
import type { CalculatorColor } from "@/lib/types";

/**
 * The one-of-N mode selector the calculators put above their fields.
 *
 * It was two (or three) loose buttons in a `flex gap-2`, copy-pasted across
 * seven calculators: each one filled when active and outlined when not, so the
 * group read as several independent buttons that happened to disagree, rather
 * than as one control with a position. A segmented track with a thumb says the
 * thing the state actually is — an exclusive choice, currently here, movable
 * there — and it says it before anybody reads the labels.
 *
 * `radiogroup` rather than `tablist`: the modes change which fields the form
 * offers, but there is no panel per mode in the markup, and "pick one of these
 * settings" is what a screen reader should hear. Selection follows focus with
 * the arrow keys, as a radio group is expected to, and only the selected option
 * is tabbable so the group is one stop rather than N.
 */
export interface CalculatorModeOption<T extends string> {
  value: T;
  label: string;
}

interface CalculatorModeSwitchProps<T extends string> {
  /** The visible group label — rendered by the caller, referenced by id here. */
  labelId: string;
  options: readonly CalculatorModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  color?: CalculatorColor;
}

/**
 * Tailwind needs the whole class name in the source, so the accent cannot be
 * interpolated. Same shape as the maps in `CalculatorWindow` and
 * `CalculatorResult`, kept beside them on purpose.
 */
const THUMB_CLASSES: Record<CalculatorColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
  orange: "bg-orange-600",
  cyan: "bg-cyan-600",
  rose: "bg-rose-600",
  amber: "bg-amber-600",
  indigo: "bg-indigo-600",
  teal: "bg-teal-600",
};

const RING_CLASSES: Record<CalculatorColor, string> = {
  blue: "focus-visible:ring-blue-500",
  green: "focus-visible:ring-green-500",
  purple: "focus-visible:ring-purple-500",
  orange: "focus-visible:ring-orange-500",
  cyan: "focus-visible:ring-cyan-500",
  rose: "focus-visible:ring-rose-500",
  amber: "focus-visible:ring-amber-500",
  indigo: "focus-visible:ring-indigo-500",
  teal: "focus-visible:ring-teal-500",
};

export function CalculatorModeSwitch<T extends string>({
  labelId,
  options,
  value,
  onChange,
  color = "blue",
}: CalculatorModeSwitchProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  const move = (delta: number) => {
    const next = (index + delta + options.length) % options.length;
    onChange(options[next]!.value);
    // Focus follows selection: the arrow keys are how a radio group is driven,
    // and leaving focus behind on the old option makes the next key press jump
    // from somewhere the eye has already left.
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      onKeyDown={onKeyDown}
      className="relative grid gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-900/60"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {/*
        One thumb that slides, rather than a background on each option: the
        movement is the feedback, and it is a transform, so it never reflows the
        labels it travels over. Width is set from the option count so a
        three-mode calculator gets the same control for free.
      */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-1 left-1 rounded-full shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${THUMB_CLASSES[color]}`}
        style={{
          width: `calc((100% - 0.5rem - ${(options.length - 1) * 0.25}rem) / ${options.length})`,
          transform: `translateX(calc(${index * 100}% + ${index * 0.25}rem))`,
        }}
      />
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`relative z-10 rounded-full px-2 py-1.5 text-xs font-medium leading-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 ${
              RING_CLASSES[color]
            } ${
              selected
                ? "text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
