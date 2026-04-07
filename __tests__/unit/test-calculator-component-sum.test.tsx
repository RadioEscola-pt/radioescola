import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks/useDraggableWindow", () => ({
  useDraggableWindow: () => ({
    position: { x: 0, y: 0 },
    containerRef: { current: null },
    beginDrag: vi.fn(),
  }),
}));

vi.mock("@/lib/config", () => ({
  registerCalculatorComponent: vi.fn(),
}));

// Override the global next-intl mock to return a stable translator function
// so that the useEffect depending on `t` does not re-fire after every render.
const stableTranslator = (key: string) => key;
vi.mock("next-intl", () => ({
  useTranslations: () => stableTranslator,
  useLocale: () => "pt",
}));

import ComponentSumCalculator from "@/components/calculators/ComponentSumCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("ComponentSumCalculator", () => {
  it("renders component type select, mode buttons, and two component rows", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    // Component type select (has resistor/capacitor/inductor options)
    const selects = screen.getAllByRole("combobox");
    const typeSelect = selects.find((s) =>
      Array.from(s.querySelectorAll("option")).some(
        (o) => o.value === "resistor"
      )
    );
    expect(typeSelect).toBeInTheDocument();

    // Mode buttons
    expect(screen.getByText("series")).toBeInTheDocument();
    expect(screen.getByText("parallel")).toBeInTheDocument();

    // Two value inputs
    const inputs = screen.getAllByPlaceholderText("value");
    expect(inputs).toHaveLength(2);
  });

  it("calculates series resistance", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText("value");
    fireEvent.change(inputs[0]!, { target: { value: "100" } });
    fireEvent.change(inputs[1]!, { target: { value: "200" } });

    fireEvent.click(screen.getByText("calculate"));

    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it("calculates parallel resistance", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    fireEvent.click(screen.getByText("parallel"));

    const inputs = screen.getAllByPlaceholderText("value");
    fireEvent.change(inputs[0]!, { target: { value: "100" } });
    fireEvent.change(inputs[1]!, { target: { value: "100" } });

    fireEvent.click(screen.getByText("calculate"));

    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it("adds a component row", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    fireEvent.click(screen.getByText("add"));

    const inputs = screen.getAllByPlaceholderText("value");
    expect(inputs).toHaveLength(3);
  });

  it("removes a component row", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    // Should start with 2 rows, each with a remove button
    const inputs = screen.getAllByPlaceholderText("value");
    expect(inputs).toHaveLength(2);

    // Find remove buttons: they are sibling to the value inputs (in the component rows)
    // Each row has an input with placeholder "value", and a remove button next to it
    const firstInput = inputs[0]!;
    const row = firstInput.closest(".flex.items-center")!;
    const removeButton = row.querySelector("button")!;
    fireEvent.click(removeButton);

    const remainingInputs = screen.getAllByPlaceholderText("value");
    expect(remainingInputs).toHaveLength(1);
  });

  it("handles empty inputs", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    fireEvent.click(screen.getByText("calculate"));

    expect(screen.getByText("addAtLeastOne")).toBeInTheDocument();
  });

  it("handles invalid inputs", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText("value");
    fireEvent.change(inputs[0]!, { target: { value: "abc" } });

    fireEvent.click(screen.getByText("calculate"));

    expect(screen.getByText("allPositive")).toBeInTheDocument();
  });

  it("reset clears all values", () => {
    render(<ComponentSumCalculator {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText("value");
    fireEvent.change(inputs[0]!, { target: { value: "100" } });
    fireEvent.change(inputs[1]!, { target: { value: "200" } });

    fireEvent.click(screen.getByText("reset"));

    const resetInputs = screen.getAllByPlaceholderText("value");
    for (const input of resetInputs) {
      expect(input).toHaveValue("");
    }
  });
});
