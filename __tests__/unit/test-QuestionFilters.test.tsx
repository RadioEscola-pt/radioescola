import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionFilters } from "@/components/QuestionFilters";

// next-intl is mocked in vitest.setup.ts to echo the key back.
function renderFilters(overrides: Partial<React.ComponentProps<typeof QuestionFilters>> = {}) {
  const onRandomOrderChange = vi.fn();
  render(
    <QuestionFilters
      counts={[]}
      total={10}
      bankTotal={10}
      activeTopic={null}
      onTopicChange={() => {}}
      search=""
      onSearchChange={() => {}}
      randomOrder={false}
      onRandomOrderChange={onRandomOrderChange}
      {...overrides}
    />
  );
  return { onRandomOrderChange, toggle: screen.getByRole("button", { name: "orderRandomLabel" }) };
}

describe("Unit: QuestionFilters order toggle", () => {
  it("shows the order as off by default", () => {
    const { toggle } = renderFilters();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("asks for random order when pressed", () => {
    const { toggle, onRandomOrderChange } = renderFilters();
    fireEvent.click(toggle);
    expect(onRandomOrderChange).toHaveBeenCalledWith(true);
  });

  it("asks for the bank order when pressed again", () => {
    const { toggle, onRandomOrderChange } = renderFilters({ randomOrder: true });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle);
    expect(onRandomOrderChange).toHaveBeenCalledWith(false);
  });
});
