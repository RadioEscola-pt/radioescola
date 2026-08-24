import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  isLocale,
  locales,
  resolveLocale,
} from "@/lib/i18n/config";

describe("resolveLocale", () => {
  it("defaults to Portuguese when no locale has been chosen", () => {
    expect(resolveLocale(undefined)).toBe("pt");
    expect(resolveLocale(null)).toBe("pt");
    expect(resolveLocale("")).toBe("pt");
  });

  it("honours an explicit choice", () => {
    for (const locale of locales) {
      expect(resolveLocale(locale)).toBe(locale);
    }
  });

  it("falls back to Portuguese for a locale we do not ship", () => {
    // A stale or hand-edited cookie must not break rendering.
    expect(resolveLocale("fr")).toBe(defaultLocale);
    expect(resolveLocale("en-GB")).toBe(defaultLocale);
    expect(resolveLocale("EN")).toBe(defaultLocale);
  });

  it("keeps Portuguese as the shipped default", () => {
    expect(defaultLocale).toBe("pt");
    expect(isLocale(defaultLocale)).toBe(true);
  });
});
