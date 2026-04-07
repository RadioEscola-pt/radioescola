import { vi } from "vitest";

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

// Override the global next-intl mock with a stable function reference
// to prevent useEffect([t]) from re-firing on every render
const stableT = (key: string) => key;
vi.mock("next-intl", () => ({
  useTranslations: () => stableT,
  useLocale: () => "pt",
}));

import { render, screen, fireEvent } from "@testing-library/react";
import TransformerCalculator from "@/components/calculators/TransformerCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("TransformerCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in voltage mode with primary and secondary voltage inputs", () => {
    render(<TransformerCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 120")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 12")).toBeInTheDocument();
  });

  it("calculates turns ratio from voltages", () => {
    render(<TransformerCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 120"), { target: { value: "120" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 12"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/turnsRatioResult/)).toBeInTheDocument();
  });

  it("switches to turns mode and shows turns inputs", () => {
    render(<TransformerCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "turns" }));

    expect(screen.getByPlaceholderText("e.g. 1000")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();
  });

  it("calculates from turns values", () => {
    render(<TransformerCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "turns" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. 1000"), { target: { value: "1000" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/turnsRatioResult/)).toBeInTheDocument();
  });

  it("switches to impedance mode and calculates", () => {
    render(<TransformerCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "impedance" }));

    fireEvent.change(screen.getByPlaceholderText("e.g. 50"), { target: { value: "50" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 2"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/impedanceResult/)).toBeInTheDocument();
  });

  it("shows error for invalid input in voltage mode", () => {
    render(<TransformerCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("voltagesPositive")).toBeInTheDocument();
  });

  it("reset clears all fields", () => {
    render(<TransformerCalculator {...defaultProps} />);

    const primaryInput = screen.getByPlaceholderText("e.g. 120");
    const secondaryInput = screen.getByPlaceholderText("e.g. 12");

    fireEvent.change(primaryInput, { target: { value: "120" } });
    fireEvent.change(secondaryInput, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(primaryInput).toHaveValue("");
    expect(secondaryInput).toHaveValue("");
  });
});
