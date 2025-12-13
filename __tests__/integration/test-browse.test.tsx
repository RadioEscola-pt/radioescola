import { describe, it, expect } from "vitest";
import { CATEGORIES, CATEGORY_STYLES, CATEGORY_IMAGES } from "@/lib/config";

describe("Integration: Category Configuration", () => {
  it("defines all three categories", () => {
    expect(CATEGORIES).toEqual(["3", "2", "1"]);
    expect(CATEGORIES.length).toBe(3);
  });

  it("has styles for each category", () => {
    for (const catId of CATEGORIES) {
      const style = CATEGORY_STYLES[catId];
      expect(style).toBeDefined();
      expect(style.badgeBg).toBeDefined();
      expect(style.badgeText).toBeDefined();
      expect(style.solidBtn).toBeDefined();
      expect(style.outlineBtn).toBeDefined();
    }
  });

  it("has images for each category", () => {
    for (const catId of CATEGORIES) {
      const image = CATEGORY_IMAGES[catId];
      expect(image).toBeDefined();
      expect(image).toMatch(/^\/images\/cat\d+\/cover\.(webp|jpg)$/);
    }
  });

  it("category 3 has green styling (easiest)", () => {
    const style = CATEGORY_STYLES["3"];
    expect(style.badgeBg).toContain("green");
  });

  it("category 1 has rose styling (hardest)", () => {
    const style = CATEGORY_STYLES["1"];
    expect(style.badgeBg).toContain("rose");
  });
});
