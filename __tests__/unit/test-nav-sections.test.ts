import { describe, expect, it } from "vitest";
import { categoryFromPathname, navSections } from "@/lib/nav-sections";

describe("navSections", () => {
  it("marks home only on the root", () => {
    expect(navSections("/").home).toBe(true);
    expect(navSections("/dashboard").home).toBe(false);
  });

  it("folds browse, aprender and drill into one study section", () => {
    for (const path of ["/browse/3", "/browse/2/flash", "/aprender", "/aprender/formulario", "/drill"]) {
      expect(navSections(path).study, path).toBe(true);
    }
    expect(navSections("/exam/3").study).toBe(false);
  });

  it("folds exam and submit-exam into one exams section", () => {
    expect(navSections("/exam/1").exams).toBe(true);
    expect(navSections("/submit-exam").exams).toBe(true);
    expect(navSections("/browse/1").exams).toBe(false);
  });

  it("recognises the standalone pages", () => {
    expect(navSections("/estado-da-nacao").nation).toBe(true);
    expect(navSections("/ser-radioamador").becomeHam).toBe(true);
  });

  it("puts a page in at most one section", () => {
    for (const path of ["/", "/browse/3", "/exam/2", "/estado-da-nacao", "/ser-radioamador", "/dashboard"]) {
      const active = Object.values(navSections(path)).filter(Boolean);
      expect(active.length, path).toBeLessThanOrEqual(1);
    }
  });
});

describe("categoryFromPathname", () => {
  it("reads the category out of a browse or exam route", () => {
    expect(categoryFromPathname("/browse/3")).toBe("3");
    expect(categoryFromPathname("/browse/2/flash")).toBe("2");
    expect(categoryFromPathname("/browse/1/smart-practice")).toBe("1");
    expect(categoryFromPathname("/exam/2")).toBe("2");
  });

  it("returns null off those routes, so the caller can fall back", () => {
    expect(categoryFromPathname("/")).toBeNull();
    expect(categoryFromPathname("/aprender")).toBeNull();
    expect(categoryFromPathname("/drill")).toBeNull();
    expect(categoryFromPathname("/submit-exam")).toBeNull();
  });

  it("rejects a segment that is not a real category id", () => {
    expect(categoryFromPathname("/browse/4")).toBeNull();
    expect(categoryFromPathname("/browse/")).toBeNull();
    expect(categoryFromPathname("/exam/todos")).toBeNull();
  });
});
