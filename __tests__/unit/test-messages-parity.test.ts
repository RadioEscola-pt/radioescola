import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import pt from "@/messages/pt.json";

/**
 * A key added to one locale and forgotten in the other fails silently: the
 * visitor gets the raw key back where the sentence should be, and only in the
 * language nobody testing the change happens to be using.
 */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return [path, ...keyPaths(child, path)];
  });
}

describe("Unit: message catalogues", () => {
  const enKeys = keyPaths(en);
  const ptKeys = keyPaths(pt);

  it("defines every English key in Portuguese", () => {
    expect([...enKeys].filter((k) => !ptKeys.includes(k))).toEqual([]);
  });

  it("defines every Portuguese key in English", () => {
    expect([...ptKeys].filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it("leaves no message empty", () => {
    const empty = (obj: unknown, prefix = ""): string[] => {
      if (typeof obj === "string") return obj.trim().length === 0 ? [prefix] : [];
      if (obj === null || typeof obj !== "object") return [];
      return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
        empty(v, prefix ? `${prefix}.${k}` : k)
      );
    };
    expect(empty(pt)).toEqual([]);
    expect(empty(en)).toEqual([]);
  });
});
