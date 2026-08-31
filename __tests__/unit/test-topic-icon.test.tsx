import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TopicIcon, TOPIC_ICONS } from "@/components/TopicIcon";
import { TOPIC_SLUGS } from "@/lib/config";

describe("Unit: TopicIcon", () => {
  it("has an icon for every topic in the taxonomy", () => {
    expect(Object.keys(TOPIC_ICONS).sort()).toEqual([...TOPIC_SLUGS].sort());
  });

  it("gives each topic its own icon, so they stay distinguishable", () => {
    const icons = Object.values(TOPIC_ICONS);
    expect(new Set(icons).size).toBe(icons.length);
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
