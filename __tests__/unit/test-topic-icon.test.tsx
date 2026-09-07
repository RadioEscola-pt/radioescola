import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TopicIcon, TOPIC_STYLES, topicTileClass } from "@/components/TopicIcon";
import { TOPIC_SLUGS } from "@/lib/config";

describe("Unit: TopicIcon", () => {
  it("has a style for every topic in the taxonomy", () => {
    expect(Object.keys(TOPIC_STYLES).sort()).toEqual([...TOPIC_SLUGS].sort());
  });

  it("gives each topic its own icon, so they stay distinguishable", () => {
    const icons = Object.values(TOPIC_STYLES).map((s) => s.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("gives each topic its own colour too", () => {
    const colours = Object.values(TOPIC_STYLES).map((s) => s.fg);
    expect(new Set(colours).size).toBe(colours.length);
  });

  it("defines both themes for every colour, so neither renders unreadable", () => {
    for (const [slug, style] of Object.entries(TOPIC_STYLES)) {
      expect(style.fg, slug).toMatch(/dark:/);
      expect(style.tile, slug).toMatch(/dark:/);
    }
  });

  it("has no tile for a slug outside the taxonomy, so the caller can fall back", () => {
    expect(topicTileClass("entidades")).toBe("");
    expect(topicTileClass("antenas")).not.toBe("");
  });

  it("renders an icon for a real slug", () => {
    const { container } = render(<TopicIcon slug="antenas" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders nothing for a slug outside the taxonomy", () => {
    // `topic` is free text in the schema, so a typo reaches the UI.
    const { container } = render(<TopicIcon slug="entidades" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is hidden from assistive tech, since the label is always beside it", () => {
    const { container } = render(<TopicIcon slug="teoria" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
