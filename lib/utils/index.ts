/**
 * Utilities barrel export
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from "./search";
export * from "./unit-conversion";
export * from "./electrical";
export * from "./pdf-generator";
